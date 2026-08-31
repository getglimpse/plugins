export default function activate(ctx) {
  ctx.registerPage("plugin:csv-viewer-plugin", ({ h, components, i18n }) => {
    const { Stack, Text, Section, KeyValueList, Markdown } = components;

    return h(
      Stack,
      { gap: "md" },
      h(
        Text,
        { variant: "muted" },
        i18n.t(
          "pages.main.description",
          "Preview .csv files with plugin-owned parsing. The plugin checks file size, reads small CSV files with ctx.files.readText(), and opens oversized files with the OS default app.",
        ),
      ),
      h(
        Section,
        { title: i18n.t("pages.main.overview", "Overview") },
        h(Markdown, {
          content: i18n.t(
            "pages.main.overviewContent",
            "- Adds preview support for `.csv` files.\n- Keeps CSV parsing in the plugin instead of Core parser/components.\n- Renders tabular data with the shared Core `Table` component.\n- Avoids reading CSV files over 32 MiB in-app.",
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
              "plugin:csv-viewer-plugin",
            ],
            [i18n.t("pages.main.detailLabels.viewer", "Viewer"), "csv"],
            [
              i18n.t("pages.main.detailLabels.extensions", "Extensions"),
              ".csv",
            ],
          ],
        }),
      ),
    );
  });
}
