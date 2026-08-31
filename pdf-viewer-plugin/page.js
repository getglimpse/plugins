export default function activate(ctx) {
  ctx.registerPage("plugin:pdf-viewer-plugin", ({ h, components, i18n }) => {
    const { Stack, Text, Section, KeyValueList, Markdown } = components;

    return h(
      Stack,
      { gap: "md" },
      h(
        Text,
        { variant: "muted" },
        i18n.t(
          "pages.main.description",
          "Preview .pdf files with a plugin-owned iframe viewer. The plugin checks file size, defers large previews, and converts local paths with ctx.files.toAssetUrl().",
        ),
      ),
      h(
        Section,
        { title: i18n.t("pages.main.overview", "Overview") },
        h(Markdown, {
          content: i18n.t(
            "pages.main.overviewContent",
            "- Adds preview support for `.pdf` files.\n- Keeps PDF rendering in the plugin instead of Core parser/components.\n- Uses the WebView built-in PDF display through an iframe.",
          ),
        }),
      ),
      h(
        Section,
        { title: i18n.t("pages.main.details", "Plugin Details") },
        h(KeyValueList, {
          rows: [
            [
              i18n.t("pages.main.detailLabels.pluginId", "Plugin ID"),
              ctx.plugin.id,
            ],
            [
              i18n.t("pages.main.detailLabels.version", "Version"),
              ctx.plugin.version,
            ],
            [
              i18n.t("pages.main.detailLabels.page", "Page"),
              "plugin:pdf-viewer-plugin",
            ],
            [i18n.t("pages.main.detailLabels.viewer", "Viewer"), "pdf"],
            [
              i18n.t("pages.main.detailLabels.extensions", "Extensions"),
              ".pdf",
            ],
          ],
        }),
      ),
    );
  });
}
