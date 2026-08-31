export default function activate(ctx) {
  ctx.registerPage("plugin:first-glimpse-plugin", ({ h, components, i18n }) => {
    const { Stack, Text, Section, KeyValueList, ActionPlayground } =
      components;

    return h(
      Stack,
      { gap: "md" },
      h(
        Text,
        { variant: "muted" },
        i18n.t(
          "pages.hello.description",
          "Try the hello action here, or run it from search with `: first glimpse > Ada`.",
        ),
      ),
      h(
        Section,
        { title: i18n.t("pages.hello.playground", "Playground") },
        h(ActionPlayground, {
          action: "hello",
          placeholder: i18n.t("pages.hello.inputPlaceholder", "Name to greet"),
          examples: ["Glimpse", "Ada", "Plugin author"],
          submitLabel: i18n.t("pages.hello.submitLabel", "Say hello"),
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
    );
  });
}
