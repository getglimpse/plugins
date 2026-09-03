const MAX_EXPRESSION_LENGTH = 96;
const MAX_AMOUNT_BY_UNIT = {
  bd: 26000,
  d: 36500,
  w: 5214,
  m: 1200,
  y: 100,
};
const MS_PER_DAY = 24 * 60 * 60 * 1000;
const WEEKDAY_NAMES = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];
const WEEKDAY_ALIASES = new Map([
  ["sun", 0],
  ["sunday", 0],
  ["mon", 1],
  ["monday", 1],
  ["tue", 2],
  ["tues", 2],
  ["tuesday", 2],
  ["wed", 3],
  ["wednesday", 3],
  ["thu", 4],
  ["thur", 4],
  ["thurs", 4],
  ["thursday", 4],
  ["fri", 5],
  ["friday", 5],
  ["sat", 6],
  ["saturday", 6],
]);

const formatDate = (date) => date.toISOString().slice(0, 10);

const utcDate = (year, month, day) =>
  new Date(Date.UTC(year, month - 1, day));

const todayDate = () => {
  const now = new Date();

  return utcDate(now.getFullYear(), now.getMonth() + 1, now.getDate());
};

const isValidDate = (date) =>
  date instanceof Date && Number.isFinite(date.getTime());

const daysInMonth = (year, month) =>
  new Date(Date.UTC(year, month, 0)).getUTCDate();

const addDays = (date, days) => {
  const next = new Date(date);

  next.setUTCDate(next.getUTCDate() + days);

  return next;
};

const isBusinessDay = (date) => {
  const weekday = date.getUTCDay();

  return weekday !== 0 && weekday !== 6;
};

const addBusinessDays = (date, days) => {
  const direction = days >= 0 ? 1 : -1;
  let remaining = Math.abs(days);
  let next = new Date(date);

  while (remaining > 0) {
    next = addDays(next, direction);

    if (isBusinessDay(next)) {
      remaining -= 1;
    }
  }

  return next;
};

const addMonths = (date, months) => {
  const sourceYear = date.getUTCFullYear();
  const sourceMonth = date.getUTCMonth();
  const sourceDay = date.getUTCDate();
  const targetMonthIndex = sourceYear * 12 + sourceMonth + months;
  const targetYear = Math.floor(targetMonthIndex / 12);
  const targetMonth = ((targetMonthIndex % 12) + 12) % 12;
  const targetDay = Math.min(
    sourceDay,
    daysInMonth(targetYear, targetMonth + 1),
  );

  return utcDate(targetYear, targetMonth + 1, targetDay);
};

const parseDateValue = (source) => {
  if (source === "today") {
    return todayDate();
  }

  const match = source.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = utcDate(year, month, day);

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() + 1 !== month ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return date;
};

const assertSupportedAmount = (amount, unit, ctx) => {
  const maxAmount = MAX_AMOUNT_BY_UNIT[unit];

  if (!Number.isInteger(amount) || amount < 0 || amount > maxAmount) {
    throw new Error(
      ctx.i18n.t(
        "actions.calculate.errors.amountOutOfRange",
        `Amount is out of range for ${unit}; maximum is ${maxAmount}`,
      ),
    );
  }
};

const calculateOffset = (date, sign, amount, unit) => {
  const direction = sign === "+" ? 1 : -1;

  switch (unit) {
    case "bd":
      return addBusinessDays(date, direction * amount);
    case "d":
      return addDays(date, direction * amount);
    case "w":
      return addDays(date, direction * amount * 7);
    case "m":
      return addMonths(date, direction * amount);
    case "y":
      return addMonths(date, direction * amount * 12);
    default:
      return null;
  }
};

const parseDateExpression = (source, ctx) => {
  const baseDate = parseDateValue(source);

  if (baseDate) {
    return baseDate;
  }

  const offsetMatch = source.match(
    /^(today|\d{4}-\d{2}-\d{2})\s*([+-])\s*(\d{1,5})\s*(bd|[dwmy])$/,
  );

  if (!offsetMatch) {
    return null;
  }

  const date = parseDateValue(offsetMatch[1]);
  const sign = offsetMatch[2];
  const amount = Number(offsetMatch[3]);
  const unit = offsetMatch[4];

  if (!date) {
    return null;
  }

  assertSupportedAmount(amount, unit, ctx);

  const result = calculateOffset(date, sign, amount, unit);

  return isValidDate(result) ? result : null;
};

const diffDays = (left, right) =>
  Math.round((left.getTime() - right.getTime()) / MS_PER_DAY);

const startOfMonth = (date) =>
  utcDate(date.getUTCFullYear(), date.getUTCMonth() + 1, 1);

const endOfMonth = (date) =>
  utcDate(
    date.getUTCFullYear(),
    date.getUTCMonth() + 1,
    daysInMonth(date.getUTCFullYear(), date.getUTCMonth() + 1),
  );

const nextWeekday = (baseDate, targetWeekday) => {
  const delta = (targetWeekday - baseDate.getUTCDay() + 7) % 7 || 7;

  return addDays(baseDate, delta);
};

const lastWeekday = (baseDate, targetWeekday) => {
  const delta = (baseDate.getUTCDay() - targetWeekday + 7) % 7 || 7;

  return addDays(baseDate, -delta);
};

export default function activate(ctx) {
  ctx.registerAction("calculate", (expression) => {
    const source = String(expression ?? "").trim().toLowerCase();

    if (!source) {
      throw new Error(
        ctx.i18n.t(
          "actions.calculate.errors.required",
          "Date expression is required",
        ),
      );
    }

    if (source.length > MAX_EXPRESSION_LENGTH) {
      throw new Error(
        ctx.i18n.t(
          "actions.calculate.errors.expressionTooLong",
          `Date expression must be ${MAX_EXPRESSION_LENGTH} characters or less`,
        ),
      );
    }

    const functionMatch = source.match(
      /^(startofmonth|som|endofmonth|eom|weekday|wd)\((.+)\)$/,
    );

    if (functionMatch) {
      const functionName = functionMatch[1];
      const date = parseDateExpression(functionMatch[2].trim(), ctx);

      if (!date) {
        throwUnsupportedExpression(ctx);
      }

      switch (functionName) {
        case "startofmonth":
        case "som":
          return formatDate(startOfMonth(date));
        case "endofmonth":
        case "eom":
          return formatDate(endOfMonth(date));
        case "weekday":
        case "wd":
          return WEEKDAY_NAMES[date.getUTCDay()];
        default:
          throwUnsupportedExpression(ctx);
      }
    }

    const weekdayMatch = source.match(/^(next|last)\s+([a-z]+)$/);

    if (weekdayMatch) {
      const direction = weekdayMatch[1];
      const targetWeekday = WEEKDAY_ALIASES.get(weekdayMatch[2]) ?? -1;

      if (targetWeekday < 0) {
        throwUnsupportedExpression(ctx);
      }

      return formatDate(
        direction === "next"
          ? nextWeekday(todayDate(), targetWeekday)
          : lastWeekday(todayDate(), targetWeekday),
      );
    }

    const calculatedDate = parseDateExpression(source, ctx);

    if (calculatedDate) {
      return formatDate(calculatedDate);
    }

    const diffMatch = source.match(
      /^(today|\d{4}-\d{2}-\d{2})\s*-\s*(today|\d{4}-\d{2}-\d{2})$/,
    );

    if (diffMatch) {
      const left = parseDateValue(diffMatch[1]);
      const right = parseDateValue(diffMatch[2]);

      if (!left || !right) {
        throwUnsupportedExpression(ctx);
      }

      return `${diffDays(left, right)}d`;
    }

    throwUnsupportedExpression(ctx);
  });

  ctx.log.info("date-calculator-plugin activated");
}

export function deactivate(ctx) {
  ctx.log.info("date-calculator-plugin deactivated");
}

function throwUnsupportedExpression(ctx) {
  throw new Error(
    ctx.i18n.t(
      "actions.calculate.errors.unsupportedExpression",
      "Unsupported date expression",
    ),
  );
}
