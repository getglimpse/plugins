export default function activate(ctx) {
  ctx.registerPage(
    "plugin:unit-converter-plugin",
    ({ h, components, i18n }) => {
      const {
        Stack,
        Text,
        Section,
        KeyValueList,
        Tabs,
        ActionPlayground,
        ActionSettings,
      } = components;

      return h(Tabs, {
        items: [
          {
            id: "playground",
            title: i18n.t("pages.convert.tabs.playground", "Playground"),
            content: h(ActionPlayground, {
              action: "convert",
              placeholder: i18n.t(
                "pages.convert.inputPlaceholder",
                "Conversion expression",
              ),
              examples: [
                "10cm to inches",
                "5mi to km",
                "2l to ml",
                "100km/h to mph",
                "1gb to mib",
                "300k to c",
              ],
              submitLabel: i18n.t("pages.convert.submitLabel", "Convert"),
            }),
          },
          {
            id: "info",
            title: i18n.t("pages.convert.tabs.info", "Info"),
            content: h(
              Stack,
              { gap: "md" },
              h(
                Section,
                { title: i18n.t("pages.convert.overview", "Overview") },
                h(
                  Text,
                  { variant: "muted" },
                  i18n.t(
                    "pages.convert.description",
                    "Try unit conversions here, or run one from search with `: unit converter > 10cm to in`.",
                  ),
                ),
              ),
              h(
                Section,
                { title: i18n.t("pages.convert.settings", "Settings") },
                h(ActionSettings, {
                  action: "convert",
                  copySearchResultLabel: i18n.t(
                    "pages.convert.settings.copySuccessfulSearchResult",
                    "Copy successful search result",
                  ),
                }),
              ),
              h(
                Section,
                { title: i18n.t("pages.convert.details", "Plugin Details") },
                h(KeyValueList, {
                  rows: [
                    [
                      i18n.t(
                        "pages.convert.detailLabels.pluginId",
                        "Plugin ID",
                      ),
                      ctx.plugin.id,
                    ],
                    [
                      i18n.t("pages.convert.detailLabels.version", "Version"),
                      ctx.plugin.version,
                    ],
                    [
                      i18n.t("pages.convert.detailLabels.page", "Page"),
                      "plugin:unit-converter-plugin",
                    ],
                  ],
                }),
              ),
            ),
          },
        ],
      });
    },
  );
}
