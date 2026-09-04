const MAX_PREVIEW_LENGTH = 20000;

/**
 * Called once when Glimpse loads and trusts the plugin entrypoint.
 * Register actions, viewers, and other runtime hooks here.
 */
export default function activate(ctx) {
  /**
   * Called whenever Glimpse needs to render this plugin's `text` viewer.
   * This happens after a supported file is opened in a preview/viewer surface.
   */
  ctx.registerViewer("text", async ({ h, components, sourcePath, i18n }) => {
    const { Stack, Text, Section } = components;

    if (!sourcePath) {
      return h(
        Text,
        { variant: "muted" },
        i18n.t("viewers.text.errors.sourceUnavailable", "Source path is not available."),
      );
    }

    const text = await ctx.files.readText(sourcePath);
    const truncated = text.length > MAX_PREVIEW_LENGTH;
    const preview = truncated
      ? `${text.slice(0, MAX_PREVIEW_LENGTH)}\n...`
      : text;

    return h(
      "div",
      { className: "file-viewer-template" },
      h(
        Stack,
        { gap: "md" },
        h(
          Text,
          { variant: "muted" },
          truncated
            ? i18n.t("viewers.text.truncated", "Preview was truncated.")
            : i18n.t("viewers.text.loaded", "Preview loaded."),
        ),
        h(
          Section,
          { title: i18n.t("viewers.text.preview", "Preview") },
          h("pre", { className: "file-viewer-template-pre" }, preview),
        ),
      ),
    );
  });

  ctx.log.info("file-viewer-template-plugin activated");
}

/**
 * Called when Glimpse unloads the plugin, for example during disable,
 * reinstall, or app shutdown. Release long-lived resources here.
 */
export function deactivate(ctx) {
  ctx.log.info("file-viewer-template-plugin deactivated");
}
