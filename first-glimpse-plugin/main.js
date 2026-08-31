export default function activate(ctx) {
  ctx.registerAction("hello", (name = "Glimpse") => {
    const value = String(name || "Glimpse").trim();

    return ctx.i18n.t("actions.hello.result", "Hello, {name}!").replace(
      "{name}",
      value,
    );
  });

  ctx.log.info("first-glimpse-plugin activated");
}

export function deactivate(ctx) {
  ctx.log.info("first-glimpse-plugin deactivated");
}
