const WORD_EXTENSIONS = new Set(["docx", "docm", "dotx", "dotm"]);
const EXCEL_EXTENSIONS = new Set(["xlsx", "xlsm", "xltx", "xltm"]);
const POWERPOINT_EXTENSIONS = new Set([
  "pptx",
  "pptm",
  "potx",
  "potm",
  "ppsx",
  "ppsm",
]);
const LEGACY_EXTENSIONS = new Set(["doc", "xls", "ppt", "pps"]);
const MAX_OFFICE_PACKAGE_BYTES = 32 * 1024 * 1024;
const MAX_OFFICE_PACKAGE_BASE64_LENGTH =
  Math.ceil((MAX_OFFICE_PACKAGE_BYTES * 4) / 3) + 4;
const MAX_ZIP_ENTRY_COUNT = 2048;
const MAX_ZIP_COMPRESSED_ENTRY_BYTES = 16 * 1024 * 1024;
const MAX_ZIP_UNCOMPRESSED_ENTRY_BYTES = 8 * 1024 * 1024;
const MAX_ZIP_TOTAL_UNCOMPRESSED_BYTES = 32 * 1024 * 1024;
const MAX_XML_TEXT_BYTES = 8 * 1024 * 1024;
const MAX_XML_TEXT_CHARS = 4 * 1024 * 1024;

export default function activate(ctx) {
  ctx.registerViewer("office", async ({ h, components, sourcePath, i18n }) => {
    const { Stack, Text, Section, Table, Markdown } = components;

    if (!sourcePath) {
      return h(
        Text,
        { variant: "muted" },
        i18n.t(
          "viewers.office.errors.sourceUnavailable",
          "Office source path is not available.",
        ),
      );
    }

    const extension = getExtension(sourcePath);

    if (LEGACY_EXTENSIONS.has(extension)) {
      return h(
        Stack,
        { gap: "md" },
        h(
          Text,
          { variant: "muted" },
          i18n.t("viewers.office.legacy.title", "Legacy binary Office format."),
        ),
        h(
          Text,
          { variant: "muted" },
          i18n.t(
            "viewers.office.legacy.description",
            "This viewer supports Office Open XML files such as .docx, .xlsx, and .pptx.",
          ),
        ),
        h(Text, { variant: "code" }, sourcePath),
      );
    }

    try {
      const base64 = await ctx.files.readBinary(sourcePath);
      const zip = await readZipEntries(base64ToBytes(base64, i18n), i18n);

      if (WORD_EXTENSIONS.has(extension)) {
        return renderWordDocument(
          h,
          { Stack, Text, Section, Markdown, i18n },
          zip,
          sourcePath,
        );
      }

      if (EXCEL_EXTENSIONS.has(extension)) {
        return renderSpreadsheet(
          h,
          { Stack, Text, Section, Table, i18n },
          zip,
          sourcePath,
        );
      }

      if (POWERPOINT_EXTENSIONS.has(extension)) {
        return renderPresentation(
          h,
          { Stack, Text, Section, Markdown, i18n },
          zip,
          sourcePath,
        );
      }

      return h(
        Text,
        { variant: "muted" },
        translate(
          i18n,
          "viewers.office.errors.unsupportedExtension",
          "Unsupported Office extension: .{extension}",
          { extension },
        ),
      );
    } catch (error) {
      return h(
        Stack,
        { gap: "md" },
        h(
          Text,
          { variant: "muted" },
          i18n.t(
            "viewers.office.errors.previewFailed",
            "Failed to preview Office document.",
          ),
        ),
        h(Text, { variant: "code" }, String(error)),
      );
    }
  });

  ctx.log.info("office-documents-viewer-plugin activated");
}

export function deactivate(ctx) {
  ctx.log.info("office-documents-viewer-plugin deactivated");
}

async function renderWordDocument(h, components, zip, sourcePath) {
  const { Stack, Text, Section, Markdown, i18n } = components;
  const xml = await zip.readText("word/document.xml");

  if (!xml) {
    throw new Error(
      i18n.t(
        "viewers.office.errors.wordDocumentNotFound",
        "word/document.xml not found",
      ),
    );
  }

  const paragraphs = extractParagraphs(xml).slice(0, 200);
  const markdown = paragraphs.length
    ? paragraphs.map(escapeMarkdownText).join("\n\n")
    : `_${escapeMarkdownText(i18n.t("viewers.office.emptyText", "No previewable text found."))}_`;

  return h(
    "div",
    { className: "office-viewer-plugin" },
    h(
      Stack,
      { gap: "md" },
      h(
        Text,
        { variant: "muted" },
        translate(
          i18n,
          "viewers.office.word.previewTitle",
          "Word document preview: {fileName}",
          { fileName: fileName(sourcePath) },
        ),
      ),
      h(
        Section,
        { title: i18n.t("viewers.office.word.section", "Document") },
        h(Markdown, { content: markdown }),
      ),
    ),
  );
}

async function renderSpreadsheet(h, components, zip, sourcePath) {
  const { Stack, Text, Section, Table, i18n } = components;
  const sharedStrings = await readSharedStrings(zip);
  const sheetNames = zip
    .names()
    .filter((name) => /^xl\/worksheets\/sheet\d+\.xml$/i.test(name))
    .sort(compareNatural);

  if (sheetNames.length === 0) {
    throw new Error(
      i18n.t(
        "viewers.office.errors.worksheetNotFound",
        "worksheet XML not found",
      ),
    );
  }

  const sheetXml = await zip.readText(sheetNames[0]);
  const preview = parseWorksheet(sheetXml, sharedStrings, 120, 24);
  const columns = Array.from({ length: preview.columnCount }, (_, index) => ({
    key: `c${index}`,
    title: columnName(index),
  }));
  const rows = preview.rows.map((row) =>
    Object.fromEntries(
      columns.map((column, index) => [column.key, row[index] ?? ""]),
    ),
  );

  return h(
    "div",
    { className: "office-viewer-plugin" },
    h(
      Stack,
      { gap: "md" },
      h(
        Text,
        { variant: "muted" },
        translate(
          i18n,
          "viewers.office.spreadsheet.previewTitle",
          "Spreadsheet preview: {fileName} ({sheetName})",
          { fileName: fileName(sourcePath), sheetName: sheetNames[0] },
        ),
      ),
      h(
        Text,
        { variant: "muted" },
        translate(
          i18n,
          "viewers.office.spreadsheet.stats",
          "{rows} rows / {columns} columns{truncated}",
          {
            rows: rows.length,
            columns: columns.length,
            truncated: preview.truncated ? "+" : "",
          },
        ),
      ),
      h(
        Section,
        { title: i18n.t("viewers.office.spreadsheet.section", "Sheet") },
        h(Table, {
          columns,
          rows,
          empty: i18n.t("viewers.office.spreadsheet.emptyCells", "No cells"),
        }),
      ),
    ),
  );
}

async function renderPresentation(h, components, zip, sourcePath) {
  const { Stack, Text, Section, Markdown, i18n } = components;
  const slideNames = zip
    .names()
    .filter((name) => /^ppt\/slides\/slide\d+\.xml$/i.test(name))
    .sort(compareNatural)
    .slice(0, 30);

  if (slideNames.length === 0) {
    throw new Error(
      i18n.t("viewers.office.errors.slideNotFound", "slide XML not found"),
    );
  }

  const blocks = [];

  for (let index = 0; index < slideNames.length; index += 1) {
    const xml = await zip.readText(slideNames[index]);
    const text = extractParagraphs(xml).join("\n").trim();
    const heading = translate(
      i18n,
      "viewers.office.presentation.slideHeading",
      "Slide {number}",
      { number: index + 1 },
    );
    const emptyText = i18n.t(
      "viewers.office.emptyText",
      "No previewable text found.",
    );

    blocks.push(
      `## ${escapeMarkdownText(heading)}\n\n${escapeMarkdownText(text || emptyText)}`,
    );
  }

  return h(
    "div",
    { className: "office-viewer-plugin" },
    h(
      Stack,
      { gap: "md" },
      h(
        Text,
        { variant: "muted" },
        translate(
          i18n,
          "viewers.office.presentation.previewTitle",
          "Presentation preview: {fileName}",
          { fileName: fileName(sourcePath) },
        ),
      ),
      h(
        Section,
        { title: i18n.t("viewers.office.presentation.section", "Slides") },
        h(Markdown, { content: blocks.join("\n\n") }),
      ),
    ),
  );
}

async function readSharedStrings(zip) {
  const xml = await zip.readText("xl/sharedStrings.xml");

  if (!xml) {
    return [];
  }

  return matchAll(xml, /<si\b[^>]*>([\s\S]*?)<\/si>/g)
    .slice(0, 20000)
    .map((entry) => truncateText(extractTextRuns(entry[1]).join(""), 512));
}

function parseWorksheet(xml, sharedStrings, rowLimit, columnLimit) {
  const rows = [];
  let truncated = false;

  for (const rowMatch of matchAll(xml, /<row\b[^>]*>([\s\S]*?)<\/row>/g)) {
    if (rows.length >= rowLimit) {
      truncated = true;
      break;
    }

    const row = [];

    for (const cellMatch of matchAll(
      rowMatch[1],
      /<c\b([^>]*)>([\s\S]*?)<\/c>/g,
    )) {
      const attrs = cellMatch[1];
      const body = cellMatch[2];
      const ref = getXmlAttribute(attrs, "r");
      const columnIndex = ref ? columnIndexFromCellRef(ref) : row.length;

      if (columnIndex >= columnLimit) {
        continue;
      }

      row[columnIndex] = readCellValue(attrs, body, sharedStrings);
    }

    if (row.some((value) => value !== undefined && value !== "")) {
      rows.push(row.map((value) => value ?? ""));
    }
  }

  const columnCount = Math.max(
    1,
    ...rows.map((row) => Math.min(row.length, columnLimit)),
  );

  return {
    rows,
    columnCount,
    truncated,
  };
}

function readCellValue(attrs, body, sharedStrings) {
  const type = getXmlAttribute(attrs, "t");

  if (type === "inlineStr") {
    return extractTextRuns(body).join("");
  }

  const rawValue = firstMatch(body, /<v[^>]*>([\s\S]*?)<\/v>/);

  if (rawValue === undefined) {
    return extractTextRuns(body).join("");
  }

  if (type === "s") {
    return sharedStrings[Number(rawValue)] ?? "";
  }

  if (type === "b") {
    return rawValue === "1" ? "TRUE" : "FALSE";
  }

  return decodeXml(rawValue);
}

function extractParagraphs(xml) {
  const paragraphs = matchAll(
    xml,
    /<[a-z0-9]+:p\b[^>]*>([\s\S]*?)<\/[a-z0-9]+:p>/gi,
  )
    .map((match) => extractTextRuns(match[1]).join("").trim())
    .filter(Boolean);

  if (paragraphs.length > 0) {
    return paragraphs;
  }

  return extractTextRuns(xml)
    .map((text) => text.trim())
    .filter(Boolean);
}

function extractTextRuns(xml) {
  const normalized = xml
    .replace(/<[a-z0-9]+:tab\s*\/>/gi, "\t")
    .replace(/<[a-z0-9]+:br\s*\/>/gi, "\n");

  return matchAll(
    normalized,
    /<[a-z0-9]+:t\b[^>]*>([\s\S]*?)<\/[a-z0-9]+:t>/gi,
  ).map((match) => decodeXml(match[1]));
}

async function readZipEntries(bytes, i18n) {
  if (bytes.byteLength > MAX_OFFICE_PACKAGE_BYTES) {
    throw new Error(
      translate(
        i18n,
        "viewers.office.errors.packageTooLarge",
        "Office package is too large to preview: {size} exceeds {limit}.",
        {
          size: formatBytes(bytes.byteLength),
          limit: formatBytes(MAX_OFFICE_PACKAGE_BYTES),
        },
      ),
    );
  }

  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const eocdOffset = findEndOfCentralDirectory(view);
  const entryCount = view.getUint16(eocdOffset + 10, true);
  const centralDirectoryOffset = view.getUint32(eocdOffset + 16, true);
  const entries = new Map();
  let totalUncompressedBytes = 0;
  let offset = centralDirectoryOffset;

  if (entryCount > MAX_ZIP_ENTRY_COUNT) {
    throw new Error(
      translate(
        i18n,
        "viewers.office.errors.tooManyEntries",
        "Office package has too many ZIP entries: {count} exceeds {limit}.",
        { count: entryCount, limit: MAX_ZIP_ENTRY_COUNT },
      ),
    );
  }

  for (let index = 0; index < entryCount; index += 1) {
    if (view.getUint32(offset, true) !== 0x02014b50) {
      throw new Error(
        i18n.t(
          "viewers.office.errors.invalidCentralDirectory",
          "Invalid ZIP central directory",
        ),
      );
    }

    const flags = view.getUint16(offset + 8, true);
    const method = view.getUint16(offset + 10, true);
    const compressedSize = view.getUint32(offset + 20, true);
    const uncompressedSize = view.getUint32(offset + 24, true);
    const nameLength = view.getUint16(offset + 28, true);
    const extraLength = view.getUint16(offset + 30, true);
    const commentLength = view.getUint16(offset + 32, true);
    const localHeaderOffset = view.getUint32(offset + 42, true);
    const nameBytes = bytes.slice(offset + 46, offset + 46 + nameLength);
    const name = new TextDecoder("utf-8").decode(nameBytes);

    if ((flags & 1) !== 0) {
      throw new Error(
        i18n.t(
          "viewers.office.errors.encryptedUnsupported",
          "Encrypted Office files are not supported",
        ),
      );
    }

    if (compressedSize > MAX_ZIP_COMPRESSED_ENTRY_BYTES) {
      throw new Error(
        translate(
          i18n,
          "viewers.office.errors.compressedEntryTooLarge",
          "ZIP entry is too large to preview: {name} compressed size {size} exceeds {limit}.",
          {
            name,
            size: formatBytes(compressedSize),
            limit: formatBytes(MAX_ZIP_COMPRESSED_ENTRY_BYTES),
          },
        ),
      );
    }

    if (uncompressedSize > MAX_ZIP_UNCOMPRESSED_ENTRY_BYTES) {
      throw new Error(
        translate(
          i18n,
          "viewers.office.errors.uncompressedEntryTooLarge",
          "ZIP entry is too large to preview: {name} uncompressed size {size} exceeds {limit}.",
          {
            name,
            size: formatBytes(uncompressedSize),
            limit: formatBytes(MAX_ZIP_UNCOMPRESSED_ENTRY_BYTES),
          },
        ),
      );
    }

    entries.set(name, {
      method,
      compressedSize,
      uncompressedSize,
      localHeaderOffset,
    });

    offset += 46 + nameLength + extraLength + commentLength;
  }

  return {
    names: () => [...entries.keys()],
    readText: async (name) => {
      const data = await readZipEntry(bytes, view, entries.get(name), i18n);

      if (!data) {
        return undefined;
      }

      totalUncompressedBytes += data.byteLength;

      if (totalUncompressedBytes > MAX_ZIP_TOTAL_UNCOMPRESSED_BYTES) {
        throw new Error(
          translate(
            i18n,
            "viewers.office.errors.totalExpandedTooLarge",
            "Office preview expanded too much data: {size} exceeds {limit}.",
            {
              size: formatBytes(totalUncompressedBytes),
              limit: formatBytes(MAX_ZIP_TOTAL_UNCOMPRESSED_BYTES),
            },
          ),
        );
      }

      if (data.byteLength > MAX_XML_TEXT_BYTES) {
        throw new Error(
          translate(
            i18n,
            "viewers.office.errors.xmlPartTooLarge",
            "XML part is too large to preview: {name} is {size}.",
            { name, size: formatBytes(data.byteLength) },
          ),
        );
      }

      const text = new TextDecoder("utf-8").decode(data);

      if (text.length > MAX_XML_TEXT_CHARS) {
        throw new Error(
          translate(
            i18n,
            "viewers.office.errors.xmlTextTooLarge",
            "XML part has too much text to preview: {name} exceeds {limit} characters.",
            { name, limit: MAX_XML_TEXT_CHARS },
          ),
        );
      }

      return text;
    },
  };
}

async function readZipEntry(bytes, view, entry, i18n) {
  if (!entry) {
    return undefined;
  }

  const offset = entry.localHeaderOffset;

  if (view.getUint32(offset, true) !== 0x04034b50) {
    throw new Error(
      i18n.t(
        "viewers.office.errors.invalidLocalHeader",
        "Invalid ZIP local header",
      ),
    );
  }

  const nameLength = view.getUint16(offset + 26, true);
  const extraLength = view.getUint16(offset + 28, true);
  const dataStart = offset + 30 + nameLength + extraLength;
  const dataEnd = dataStart + entry.compressedSize;

  if (dataEnd > bytes.byteLength) {
    throw new Error(
      i18n.t(
        "viewers.office.errors.entryDataOutOfBounds",
        "ZIP entry data exceeds package bounds",
      ),
    );
  }

  const compressed = bytes.slice(dataStart, dataStart + entry.compressedSize);

  if (entry.method === 0) {
    ensureInflatedSizeWithinLimit(compressed.byteLength, i18n);
    return compressed;
  }

  if (entry.method === 8) {
    const inflated = await inflateRaw(compressed, i18n);
    ensureInflatedSizeWithinLimit(inflated.byteLength, i18n);
    return inflated;
  }

  throw new Error(
    translate(
      i18n,
      "viewers.office.errors.unsupportedCompressionMethod",
      "Unsupported ZIP compression method: {method}",
      { method: entry.method },
    ),
  );
}

async function inflateRaw(compressed, i18n) {
  if (typeof DecompressionStream !== "function") {
    throw new Error(
      i18n.t(
        "viewers.office.errors.decompressionUnavailable",
        "This WebView does not expose DecompressionStream.",
      ),
    );
  }

  try {
    return await inflateWithFormat(compressed, "deflate-raw");
  } catch {
    return inflateWithFormat(compressed, "deflate");
  }
}

async function inflateWithFormat(compressed, format) {
  const stream = new Blob([compressed])
    .stream()
    .pipeThrough(new DecompressionStream(format));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

function findEndOfCentralDirectory(view) {
  const start = Math.max(0, view.byteLength - 65557);

  for (let offset = view.byteLength - 22; offset >= start; offset -= 1) {
    if (view.getUint32(offset, true) === 0x06054b50) {
      return offset;
    }
  }

  throw new Error("ZIP end-of-central-directory record not found");
}

function base64ToBytes(base64, i18n) {
  if (base64.length > MAX_OFFICE_PACKAGE_BASE64_LENGTH) {
    throw new Error(
      translate(
        i18n,
        "viewers.office.errors.payloadTooLarge",
        "Office package payload is too large to preview: base64 length {length} exceeds {limit}.",
        { length: base64.length, limit: MAX_OFFICE_PACKAGE_BASE64_LENGTH },
      ),
    );
  }

  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

function ensureInflatedSizeWithinLimit(size, i18n) {
  if (size > MAX_ZIP_UNCOMPRESSED_ENTRY_BYTES) {
    throw new Error(
      translate(
        i18n,
        "viewers.office.errors.entryExpandedTooLarge",
        "ZIP entry expanded too large: {size} exceeds {limit}.",
        {
          size: formatBytes(size),
          limit: formatBytes(MAX_ZIP_UNCOMPRESSED_ENTRY_BYTES),
        },
      ),
    );
  }
}

function getExtension(path) {
  const name = fileName(path);
  const index = name.lastIndexOf(".");

  return index >= 0 ? name.slice(index + 1).toLowerCase() : "";
}

function fileName(path) {
  return path.split(/[\\/]/).pop() || path;
}

function compareNatural(left, right) {
  return left.localeCompare(right, undefined, {
    numeric: true,
    sensitivity: "base",
  });
}

function columnIndexFromCellRef(ref) {
  const letters = (ref.match(/^[A-Z]+/i)?.[0] ?? "").toUpperCase();
  let index = 0;

  for (const letter of letters) {
    index = index * 26 + letter.charCodeAt(0) - 64;
  }

  return Math.max(0, index - 1);
}

function columnName(index) {
  let value = index + 1;
  let name = "";

  while (value > 0) {
    const remainder = (value - 1) % 26;
    name = String.fromCharCode(65 + remainder) + name;
    value = Math.floor((value - 1) / 26);
  }

  return name;
}

function getXmlAttribute(attrs, name) {
  return firstMatch(attrs, new RegExp(`\\b${name}="([^"]*)"`, "i"));
}

function firstMatch(text, pattern) {
  const match = text.match(pattern);

  return match ? decodeXml(match[1]) : undefined;
}

function matchAll(text, pattern) {
  return [...text.matchAll(pattern)];
}

function decodeXml(text) {
  return text
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

function escapeMarkdownText(text) {
  return text.replace(/([\\`*_{}[\]()#+\-.!|>])/g, "\\$1");
}

function truncateText(text, maxLength) {
  return text.length > maxLength ? text.slice(0, maxLength) : text;
}

function translate(i18n, key, fallback, replacements = {}) {
  let text = i18n.t(key, fallback);

  for (const [name, value] of Object.entries(replacements)) {
    text = text.split(`{${name}}`).join(String(value));
  }

  return text;
}

function formatBytes(bytes) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KiB`;
  }

  return `${Math.round(bytes / 1024 / 1024)} MiB`;
}
