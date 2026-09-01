export default function activate(ctx) {
  ctx.registerPage(
    "plugin:date-calculator-plugin",
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
            title: i18n.t("pages.calculate.tabs.playground", "Playground"),
            content: h(ActionPlayground, {
              action: "calculate",
              placeholder: i18n.t(
                "pages.calculate.inputPlaceholder",
                "Date expression",
              ),
              examples: [
                "today",
                "today + 7d",
                "today + 10bd",
                "next monday",
                "weekday(today)",
                "eom(today)",
                "2026-01-31 + 1m",
                "2026-08-10 - 2026-07-30",
              ],
              submitLabel: i18n.t("pages.calculate.submitLabel", "Calculate"),
            }),
          },
          {
            id: "info",
            title: i18n.t("pages.calculate.tabs.info", "Info"),
            content: h(
              Stack,
              { gap: "md" },
              h(
                Section,
                { title: i18n.t("pages.calculate.overview", "Overview") },
                h(
                  Text,
                  { variant: "muted" },
                  i18n.t(
                    "pages.calculate.description",
                    "Try date expressions here, or run one from search with `: date calculator > today + 30d`.",
                  ),
                ),
              ),
              h(
                Section,
                { title: i18n.t("pages.calculate.settings", "Settings") },
                h(ActionSettings, {
                  action: "calculate",
                  copySearchResultLabel: i18n.t(
                    "pages.calculate.settings.copySuccessfulSearchResult",
                    "Copy successful search result",
                  ),
                }),
              ),
              h(
                Section,
                { title: i18n.t("pages.calculate.details", "Plugin Details") },
                h(KeyValueList, {
                  rows: [
                    [
                      i18n.t(
                        "pages.calculate.detailLabels.pluginId",
                        "Plugin ID",
                      ),
                      ctx.plugin.id,
                    ],
                    [
                      i18n.t("pages.calculate.detailLabels.version", "Version"),
                      ctx.plugin.version,
                    ],
                    [
                      i18n.t("pages.calculate.detailLabels.page", "Page"),
                      "plugin:date-calculator-plugin",
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
