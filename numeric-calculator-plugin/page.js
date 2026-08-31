export default function activate(ctx) {
  ctx.registerPage(
    "plugin:numeric-calculator-plugin",
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
            "pages.calculate.description",
            "Try numeric expressions here, or run one from search with `: numeric calculator > sqrt(144)`.",
          ),
        ),
        h(
          Section,
          { title: i18n.t("pages.calculate.playground", "Playground") },
          h(ActionPlayground, {
            action: "calculate",
            placeholder: i18n.t(
              "pages.calculate.inputPlaceholder",
              "Expression",
            ),
            examples: ["1 + 1", "sqrt(144)", "pow(2, 8)", "round(pi, 4)"],
            submitLabel: i18n.t("pages.calculate.submitLabel", "Calculate"),
          }),
        ),
        h(
          Section,
          { title: i18n.t("pages.calculate.details", "Plugin Details") },
          h(KeyValueList, {
            rows: [
              [
                i18n.t("pages.calculate.detailLabels.pluginId", "Plugin ID"),
                ctx.plugin.id,
              ],
              [
                i18n.t("pages.calculate.detailLabels.version", "Version"),
                ctx.plugin.version,
              ],
              [
                i18n.t("pages.calculate.detailLabels.page", "Page"),
                "plugin:numeric-calculator-plugin",
              ],
            ],
          }),
        ),
      );
    },
  );
}
