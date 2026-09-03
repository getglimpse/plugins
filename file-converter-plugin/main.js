const MAX_OUTPUT_LENGTH = 10 * 1024 * 1024;
const SUCCESS_PREFIX = "Success Converted!";

export default function activate(ctx) {
  ctx.registerAction("convertFile", async (input) => {
    const files = normalizeInputFiles(input);
    const outputs = await Promise.all(
      files.map(async (file) => {
        const text = await readText(file);
        const body = `${SUCCESS_PREFIX}\n${text}`;

        ensureOutputLength(body);

        return {
          type: "file",
          fileName: convertedFileName(file.name),
          contentType: file.contentType || file.type || "text/plain",
          body,
        };
      }),
    );

    return input?.files ? outputs : outputs[0];
  });

  ctx.log.info("file-converter-plugin activated");
}

export function deactivate(ctx) {
  ctx.log.info("file-converter-plugin deactivated");
}

function normalizeInputFiles(input) {
  if (!input || typeof input !== "object") {
    throw new Error("File payload is required");
  }

  const files = Array.isArray(input.files)
    ? input.files
    : input.file
      ? [input.file]
      : [input];

  if (files.length === 0) {
    throw new Error("File payload is required");
  }

  return files.map((file, index) => {
    const name = String(file?.name ?? `dropped-file-${index + 1}.txt`).trim();

    if (!isSupportedTextFile(name, file?.type)) {
      throw new Error("Only text and Markdown files are supported");
    }

    return {
      ...file,
      name: name || `dropped-file-${index + 1}.txt`,
    };
  });
}

async function readText(file) {
  if (typeof file.text === "function") {
    return file.text();
  }

  if (typeof file.text === "string") {
    return file.text;
  }

  if (typeof file.content === "string") {
    return file.content;
  }

  if (typeof file.body === "string") {
    return file.body;
  }

  throw new Error("Text file content is required");
}

function isSupportedTextFile(fileName, type) {
  return (
    /\.(txt|md|markdown)$/i.test(fileName) ||
    ["text/plain", "text/markdown"].includes(String(type ?? "").toLowerCase())
  );
}

function convertedFileName(fileName) {
  const extension = fileName.match(/(\.[^.\\/]+)$/)?.[1] ?? ".txt";
  const stem = fileName.replace(/\.[^.\\/]+$/, "") || "converted";

  return `${stem}.converted${extension}`;
}

function ensureOutputLength(body) {
  if (body.length > MAX_OUTPUT_LENGTH) {
    throw new Error("Converted output is too large");
  }
}
