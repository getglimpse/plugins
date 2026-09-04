/**
 * Called once when Glimpse loads and trusts the plugin entrypoint.
 * Register actions, viewers, and other runtime hooks here.
 */
export default function activate(ctx) {
  /**
   * Called whenever the Playground tab runs the `hello` action.
   * The tab passes the current input text as `name`.
   */
  ctx.registerAction("hello", (name = "Glimpse") => {
    const value = String(name || "Glimpse").trim();

    return ctx.i18n.t("actions.hello.result", "Hello, {name}!").replace(
      "{name}",
      value,
    );
  });

  ctx.log.info("basic-action-template-plugin activated");
}

/**
 * Called when Glimpse unloads the plugin, for example during disable,
 * reinstall, or app shutdown. Release long-lived resources here.
 */
export function deactivate(ctx) {
  ctx.log.info("basic-action-template-plugin deactivated");
}
