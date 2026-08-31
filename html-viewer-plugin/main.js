export default function activate(ctx) {
  ctx.registerViewer("html", async ({ h, components, sourcePath, i18n }) => {
    if (!sourcePath) {
      return h(
        "div",
        { className: "html-viewer-plugin-message" },
        i18n.t(
          "viewers.html.errors.sourceUnavailable",
          "HTML source path is not available.",
        ),
      );
    }

    const metadata = await ctx.files.getMetadata(sourcePath);
    const title = i18n.t("viewers.html.title", "HTML Viewer");
    const assetUrl = ctx.files.toAssetUrl(normalizeFilePath(sourcePath));
    const sizeLabel = formatBytes(metadata.sizeBytes, i18n);
    const limitLabel = formatBytes(HTML_PREVIEW_MAX_BYTES, i18n);

    if (metadata.sizeBytes > HTML_PREVIEW_MAX_BYTES) {
      return h(
        "div",
        { className: "html-viewer-plugin-message" },
        h(
          "div",
          { className: "html-viewer-plugin-message-stack" },
          h(
            "p",
            { className: "html-viewer-plugin-message-title" },
            i18n.t(
              "viewers.html.tooLarge.title",
              "HTML file is too large for in-app preview.",
            ),
          ),
          h(
            "p",
            {},
            translate(
              i18n,
              "viewers.html.tooLarge.description",
              "This file is {size}. The in-app preview limit is {limit}.",
              {
                size: sizeLabel,
                limit: limitLabel,
              },
            ),
          ),
          h(components.FileOpenButton, {
            sourcePath,
            label: i18n.t("viewers.html.openExternally", "Open Externally"),
          }),
        ),
      );
    }

    const html = await ctx.files.readText(sourcePath);

    return h(
      "div",
      { className: "html-viewer-plugin-frame" },
      h("iframe", {
        key: sourcePath,
        srcDoc: html,
        srcDocBasePath: assetUrl,
        sandbox:
          "allow-scripts allow-forms allow-popups allow-modals allow-downloads",
        title,
        className: "html-viewer-plugin-iframe",
      }),
    );
  });

  ctx.log.info("html-viewer-plugin activated");
}

export function deactivate(ctx) {
  ctx.log.info("html-viewer-plugin deactivated");
}

const HTML_PREVIEW_MAX_BYTES = 10 * 1024 * 1024;

function normalizeFilePath(sourcePath) {
  return sourcePath.replace(/\\/g, "/");
}

function translate(i18n, key, fallback, replacements = {}) {
  let text = i18n.t(key, fallback);

  for (const [name, value] of Object.entries(replacements)) {
    text = text.split(`{${name}}`).join(String(value));
  }

  return text;
}

function formatBytes(bytes, i18n) {
  if (!Number.isFinite(bytes) || bytes < 0) {
    return i18n.t("viewers.html.unknownSize", "unknown size");
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
