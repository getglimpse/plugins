export default function activate(ctx) {
  ctx.registerPage(
    "plugin:unit-converter-plugin",
    ({ h, components, i18n }) => {
      const { Stack, Text, Section, KeyValueList, ActionPlayground } =
        components;

      return h(
        Stack,
        { gap: "md" },
        h(
          Text,
          { variant: "muted" },
          i18n.t(
            "pages.convert.description",
            "Try unit conversions here, or run one from search with `: unit converter > 10cm to in`.",
          ),
        ),
        h(
          Section,
          { title: i18n.t("pages.convert.playground", "Playground") },
          h(ActionPlayground, {
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
        ),
        h(
          Section,
          { title: i18n.t("pages.convert.details", "Plugin Details") },
          h(KeyValueList, {
            rows: [
              [
                i18n.t("pages.convert.detailLabels.pluginId", "Plugin ID"),
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
      );
    },
  );
}
