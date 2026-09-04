const MAX_OUTPUT_LENGTH = 10 * 1024 * 1024;

/**
 * Called once when Glimpse loads and trusts the plugin entrypoint.
 * Register actions, viewers, and other runtime hooks here.
 */
export default function activate(ctx) {
  /**
   * Called whenever the Converter tab runs the `convertFile` action.
   * The tab passes a file payload containing `file`, `files`, or a single
   * file-like object, depending on whether one or many files were dropped.
   */
  ctx.registerAction("convertFile", async (input) => {
    const files = normalizeInputFiles(input);
    const outputs = await Promise.all(
      files.map(async (file) => {
        const text = await readText(file);
        const body = `Converted by ${ctx.plugin.id}\n${text}`;

        if (body.length > MAX_OUTPUT_LENGTH) {
          throw new Error("Converted output is too large");
        }

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

  ctx.log.info("file-converter-template-plugin activated");
}

/**
 * Called when Glimpse unloads the plugin, for example during disable,
 * reinstall, or app shutdown. Release long-lived resources here.
 */
export function deactivate(ctx) {
  ctx.log.info("file-converter-template-plugin deactivated");
}

/**
 * Called by the `convertFile` action before conversion starts.
 * It accepts every file payload shape that Glimpse may send from a file tab.
 */
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

  return files.map((file, index) => ({
    ...file,
    name: String(file?.name ?? `dropped-file-${index + 1}.txt`).trim(),
  }));
}

/**
 * Called once per input file by the `convertFile` action.
 * It reads text from the file-like object shape available at runtime.
 */
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

/**
 * Called once per output file by the `convertFile` action.
 * It keeps the original extension and adds `.converted` to the stem.
 */
function convertedFileName(fileName) {
  const extension = fileName.match(/(\.[^.\\/]+)$/)?.[1] ?? ".txt";
  const stem = fileName.replace(/\.[^.\\/]+$/, "") || "converted";

  return `${stem}.converted${extension}`;
}
