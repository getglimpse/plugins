export default function activate(ctx) {
  ctx.registerViewer("csv", async ({ h, components, sourcePath, i18n }) => {
    const { Stack, Text, Section, Table } = components;

    if (!sourcePath) {
      return h(
        Text,
        { variant: "muted" },
        i18n.t(
          "viewers.csv.errors.sourceUnavailable",
          "CSV source path is not available.",
        ),
      );
    }

    const metadata = await ctx.files.getMetadata(sourcePath);
    const sizeLabel = formatBytes(metadata.sizeBytes, i18n);
    const limitLabel = formatBytes(CSV_PREVIEW_MAX_BYTES, i18n);

    if (metadata.sizeBytes > CSV_PREVIEW_MAX_BYTES) {
      return h(
        "div",
        { className: "csv-viewer-plugin-message" },
        h(
          "div",
          { className: "csv-viewer-plugin-message-stack" },
          h(
            "p",
            { className: "csv-viewer-plugin-message-title" },
            i18n.t(
              "viewers.csv.tooLarge.title",
              "CSV is too large for in-app preview.",
            ),
          ),
          h(
            "p",
            {},
            translate(
              i18n,
              "viewers.csv.tooLarge.description",
              "This file is {size}. The in-app text preview limit is {limit}.",
              {
                size: sizeLabel,
                limit: limitLabel,
              },
            ),
          ),
          h(components.FileOpenButton, {
            sourcePath,
            label: i18n.t("viewers.csv.openExternally", "Open Externally"),
          }),
        ),
      );
    }

    const text = await ctx.files.readText(sourcePath);
    const maxRows = 1000;
    const parsed = parseCsvText(text, maxRows + 2);

    if (parsed.rows.length === 0) {
      return h(
        Text,
        { variant: "muted" },
        i18n.t("viewers.csv.emptyFile", "Empty CSV file."),
      );
    }

    const columns = normalizeHeader(parsed.rows[0] ?? []);
    const dataRows = parsed.rows
      .slice(1, maxRows + 1)
      .map((row) =>
        Object.fromEntries(
          columns.map((column, index) => [column.key, row[index] ?? ""]),
        ),
      );

    return h(
      "div",
      { className: "csv-viewer-plugin-scroll" },
      h(
        Stack,
        { gap: "md" },
        h(
          Text,
          { variant: "muted" },
          translate(
            i18n,
            "viewers.csv.stats",
            "{rows} rows / {columns} columns{truncated}",
            {
              rows: dataRows.length,
              columns: columns.length,
              truncated: parsed.truncated ? "+" : "",
            },
          ),
        ),
        h(
          Section,
          { title: i18n.t("viewers.csv.preview", "Preview") },
          h(
            "div",
            { className: "csv-viewer-plugin-table" },
            h(Table, {
              columns,
              rows: dataRows,
              empty: i18n.t("viewers.csv.emptyRows", "No rows"),
            }),
          ),
        ),
      ),
    );
  });

  ctx.log.info("csv-viewer-plugin activated");
}

export function deactivate(ctx) {
  ctx.log.info("csv-viewer-plugin deactivated");
}

const CSV_PREVIEW_MAX_BYTES = 32 * 1024 * 1024;

function translate(i18n, key, fallback, replacements = {}) {
  let text = i18n.t(key, fallback);

  for (const [name, value] of Object.entries(replacements)) {
    text = text.split(`{${name}}`).join(String(value));
  }

  return text;
}

function formatBytes(bytes, i18n) {
  if (!Number.isFinite(bytes) || bytes < 0) {
    return i18n.t("viewers.csv.unknownSize", "unknown size");
  }

  const units = ["B", "KiB", "MiB", "GiB"];
  let value = bytes;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  return `${value.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

function parseCsvText(text, rowLimit) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  let truncated = false;

  const pushField = () => {
    row.push(field);
    field = "";
  };
  const pushRow = () => {
    pushField();

    if (row.length > 1 || row[0] !== "") {
      rows.push(row);
    }

    row = [];

    if (rows.length >= rowLimit) {
      truncated = true;
    }
  };

  for (let index = 0; index < text.length; index += 1) {
    if (truncated) {
      break;
    }

    const character = text[index];
    const nextCharacter = text[index + 1];

    if (character === '"') {
      if (inQuotes && nextCharacter === '"') {
        field += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (character === "," && !inQuotes) {
      pushField();
      continue;
    }

    if ((character === "\n" || character === "\r") && !inQuotes) {
      if (character === "\r" && nextCharacter === "\n") {
        index += 1;
      }
      pushRow();
      continue;
    }

    field += character;
  }

  if (!truncated && (field !== "" || row.length > 0)) {
    pushRow();
  }

  return { rows, truncated };
}

function normalizeHeader(row) {
  const seen = new Map();

  return row.map((rawColumn, index) => {
    const fallback = `Column ${index + 1}`;
    const title = rawColumn.trim() || fallback;
    const count = seen.get(title) ?? 0;

    seen.set(title, count + 1);

    return {
      key: count === 0 ? title : `${title} ${count + 1}`,
      title: count === 0 ? title : `${title} ${count + 1}`,
    };
  });
}
