export default function activate(ctx) {
  ctx.registerPage("plugin:first-glimpse-plugin", ({ h, components, i18n }) => {
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
          title: i18n.t("pages.hello.tabs.playground", "Playground"),
          content: h(ActionPlayground, {
            action: "hello",
            placeholder: i18n.t("pages.hello.inputPlaceholder", "Name to greet"),
            examples: ["Glimpse", "Ada", "Plugin author"],
            submitLabel: i18n.t("pages.hello.submitLabel", "Say hello"),
          }),
        },
        {
          id: "info",
          title: i18n.t("pages.hello.tabs.info", "Info"),
          content: h(
            Stack,
            { gap: "md" },
            h(
              Section,
              { title: i18n.t("pages.hello.overview", "Overview") },
              h(
                Text,
                { variant: "muted" },
                i18n.t(
                  "pages.hello.description",
                  "Try the hello action here, or run it from search with `: first glimpse > Ada`.",
                ),
              ),
            ),
            h(
              Section,
              { title: i18n.t("pages.hello.settings", "Settings") },
              h(ActionSettings, {
                action: "hello",
                copySearchResultLabel: i18n.t(
                  "pages.hello.settings.copySuccessfulSearchResult",
                  "Copy successful search result",
                ),
              }),
            ),
            h(
              Section,
              { title: i18n.t("pages.hello.details", "Plugin Details") },
              h(KeyValueList, {
                rows: [
                  [
                    i18n.t("pages.hello.detailLabels.pluginId", "Plugin ID"),
                    ctx.plugin.id,
                  ],
                  [
                    i18n.t("pages.hello.detailLabels.version", "Version"),
                    ctx.plugin.version,
                  ],
                  [
                    i18n.t("pages.hello.detailLabels.page", "Page"),
                    "plugin:first-glimpse-plugin",
                  ],
                ],
              }),
            ),
          ),
        },
      ],
    });
  });
}
