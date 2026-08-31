export default function activate(ctx) {
  ctx.registerPage("plugin:html-viewer-plugin", ({ h, components, i18n }) => {
    const { Stack, Text, Section, KeyValueList, Markdown } = components;

    return h(
      Stack,
      { gap: "md" },
      h(
        Text,
        { variant: "muted" },
        i18n.t(
          "pages.main.description",
          "Preview .html and .htm files with a plugin-owned WebView frame. The plugin checks file size and delegates rendering to the app WebView without inspecting or sanitizing HTML.",
        ),
      ),
      h(
        Section,
        { title: i18n.t("pages.main.overview", "Overview") },
        h(Markdown, {
          content: i18n.t(
            "pages.main.overviewContent",
            "- Adds preview support for `.html` and `.htm` files.\n- Keeps HTML rendering out of Core parser/components.\n- Does not sanitize, inspect, or rewrite HTML.\n- Requires a manual click before loading the WebView preview.\n- Avoids in-app preview for HTML files over 10 MiB.",
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
              "plugin:html-viewer-plugin",
            ],
            [i18n.t("pages.main.detailLabels.viewer", "Viewer"), "html"],
            [
              i18n.t("pages.main.detailLabels.extensions", "Extensions"),
              ".html, .htm",
            ],
          ],
        }),
      ),
    );
  });
}
