export default function activate(ctx) {
  ctx.registerViewer("pdf", async ({ h, components, sourcePath, i18n }) => {
    if (!sourcePath) {
      return h(
        "div",
        { className: "pdf-viewer-plugin-message" },
        i18n.t(
          "viewers.pdf.errors.sourceUnavailable",
          "PDF source path is not available.",
        ),
      );
    }

    const metadata = await ctx.files.getMetadata(sourcePath);
    const title = i18n.t("viewers.pdf.title", "PDF Viewer");
    const assetUrl = ctx.files.toAssetUrl(sourcePath);
    const sizeLabel = formatBytes(metadata.sizeBytes, i18n);
    const externalLimitLabel = formatBytes(PDF_EXTERNAL_ONLY_BYTES, i18n);

    if (metadata.sizeBytes > PDF_EXTERNAL_ONLY_BYTES) {
      return h(
        "div",
        { className: "pdf-viewer-plugin-message" },
        h(
          "div",
          { className: "pdf-viewer-plugin-message-stack" },
          h(
            "p",
            { className: "pdf-viewer-plugin-message-title" },
            i18n.t(
              "viewers.pdf.tooLarge.title",
              "PDF is too large for in-app preview.",
            ),
          ),
          h(
            "p",
            {},
            translate(
              i18n,
              "viewers.pdf.tooLarge.description",
              "This file is {size}. The in-app limit is {limit}.",
              {
                size: sizeLabel,
                limit: externalLimitLabel,
              },
            ),
          ),
          h(components.FileOpenButton, {
            sourcePath,
            label: i18n.t("viewers.pdf.openExternally", "Open Externally"),
          }),
        ),
      );
    }

    if (metadata.sizeBytes > PDF_AUTO_PREVIEW_BYTES) {
      return h(
        "div",
        { className: "pdf-viewer-plugin-frame" },
        h(components.DeferredFrame, {
          src: assetUrl,
          title,
          className: "pdf-viewer-plugin-iframe",
          label: i18n.t("viewers.pdf.large.label", "Large PDF"),
          description: translate(
            i18n,
            "viewers.pdf.large.description",
            "This file is {size}. Loading the preview may use noticeable memory.",
            {
              size: sizeLabel,
            },
          ),
          buttonLabel: i18n.t("viewers.pdf.large.button", "Load Preview"),
        }),
      );
    }

    return h(
      "div",
      { className: "pdf-viewer-plugin-frame" },
      h("iframe", {
        key: sourcePath,
        src: assetUrl,
        title,
        className: "pdf-viewer-plugin-iframe",
      }),
    );
  });

  ctx.log.info("pdf-viewer-plugin activated");
}

export function deactivate(ctx) {
  ctx.log.info("pdf-viewer-plugin deactivated");
}

const PDF_AUTO_PREVIEW_BYTES = 100 * 1024 * 1024;
const PDF_EXTERNAL_ONLY_BYTES = 500 * 1024 * 1024;

const translate = (i18n, key, fallback, replacements = {}) => {
  let text = i18n.t(key, fallback);

  for (const [name, value] of Object.entries(replacements)) {
    text = text.split(`{${name}}`).join(String(value));
  }

  return text;
};

const formatBytes = (bytes, i18n) => {
  if (!Number.isFinite(bytes) || bytes < 0) {
    return i18n.t("viewers.pdf.unknownSize", "unknown size");
  }

  const units = ["B", "KiB", "MiB", "GiB"];
  let value = bytes;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  return `${value.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
};
