export default function activate(ctx) {
  const math = ctx.math.create(ctx.math.all, {});

  math.import(
    {
      import: () => {
        throw new Error(
          ctx.i18n.t(
            "pages.calculate.errors.importDisabled",
            "import is disabled",
          ),
        );
      },
      createUnit: () => {
        throw new Error(
          ctx.i18n.t(
            "pages.calculate.errors.createUnitDisabled",
            "createUnit is disabled",
          ),
        );
      },
    },
    { override: true },
  );

  ctx.registerAction("calculate", (expression) => {
    const source = String(expression ?? "").trim();

    if (!source) {
      throw new Error(
        ctx.i18n.t(
          "pages.calculate.errors.required",
          "Expression is required",
        ),
      );
    }

    if (source.length > MAX_EXPRESSION_LENGTH) {
      throw new Error(
        ctx.i18n.t(
          "pages.calculate.errors.expressionTooLong",
          `Expression must be ${MAX_EXPRESSION_LENGTH} characters or less`,
        ),
      );
    }

    assertSafeExpression(math.parse(source), ctx);

    const result = math.evaluate(source);

    if (typeof result === "number" && !Number.isFinite(result)) {
      throw new Error(
        ctx.i18n.t("pages.calculate.errors.invalidResult", "Invalid result"),
      );
    }

    const resultText = String(result);

    if (resultText.length > MAX_RESULT_LENGTH) {
      throw new Error(
        ctx.i18n.t(
          "pages.calculate.errors.resultTooLong",
          `Result is too large to display; limit is ${MAX_RESULT_LENGTH} characters`,
        ),
      );
    }

    return resultText;
  });

  ctx.log.info("numeric-calculator-plugin activated");
}

export function deactivate(ctx) {
  ctx.log.info("numeric-calculator-plugin deactivated");
}

const MAX_EXPRESSION_LENGTH = 512;
const MAX_RESULT_LENGTH = 4096;
const BLOCKED_NODE_TYPES = new Set([
  "AssignmentNode",
  "FunctionAssignmentNode",
]);
const BLOCKED_FUNCTIONS = new Set([
  "compile",
  "config",
  "createUnit",
  "evaluate",
  "import",
  "parse",
  "parser",
]);

function assertSafeExpression(node, ctx) {
  node.traverse((child) => {
    if (BLOCKED_NODE_TYPES.has(child.type)) {
      throw new Error(
        ctx.i18n.t(
          "pages.calculate.errors.statefulExpressionDisabled",
          "Assignments and function definitions are disabled",
        ),
      );
    }

    if (child.type !== "FunctionNode") {
      return;
    }

    const functionName = child.fn?.name;

    if (typeof functionName === "string" && BLOCKED_FUNCTIONS.has(functionName)) {
      throw new Error(
        ctx.i18n.t(
          "pages.calculate.errors.environmentFunctionDisabled",
          `${functionName} is disabled`,
        ),
      );
    }
  });
}
