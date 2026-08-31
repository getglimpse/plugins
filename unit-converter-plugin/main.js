const MAX_EXPRESSION_LENGTH = 96;
const MAX_ABSOLUTE_VALUE = 1e15;
const MAX_RESULT_LENGTH = 128;

const UNIT_DEFINITIONS = {
  nm: ["length", 1e-9],
  um: ["length", 1e-6],
  mm: ["length", 0.001],
  cm: ["length", 0.01],
  m: ["length", 1],
  km: ["length", 1000],
  in: ["length", 0.0254],
  ft: ["length", 0.3048],
  yd: ["length", 0.9144],
  mi: ["length", 1609.344],

  mm2: ["area", 0.001 ** 2],
  cm2: ["area", 0.01 ** 2],
  m2: ["area", 1],
  km2: ["area", 1000 ** 2],
  in2: ["area", 0.0254 ** 2],
  ft2: ["area", 0.3048 ** 2],
  yd2: ["area", 0.9144 ** 2],
  mi2: ["area", 1609.344 ** 2],

  ml: ["volume", 0.000001],
  l: ["volume", 0.001],
  m3: ["volume", 1],
  tsp: ["volume", 0.00000492892159375],
  tbsp: ["volume", 0.00001478676478125],
  floz: ["volume", 0.0000295735295625],
  cup: ["volume", 0.0002365882365],
  pt: ["volume", 0.000473176473],
  qt: ["volume", 0.000946352946],
  gal: ["volume", 0.003785411784],

  mg: ["mass", 0.001],
  g: ["mass", 1],
  kg: ["mass", 1000],
  oz: ["mass", 28.349523125],
  lb: ["mass", 453.59237],
  t: ["mass", 1000000],

  b: ["data", 1],
  byte: ["data", 1],
  kb: ["data", 1024],
  mb: ["data", 1024 ** 2],
  gb: ["data", 1024 ** 3],
  tb: ["data", 1024 ** 4],
  kib: ["data", 1024],
  mib: ["data", 1024 ** 2],
  gib: ["data", 1024 ** 3],
  tib: ["data", 1024 ** 4],

  ms: ["time", 0.001],
  s: ["time", 1],
  min: ["time", 60],
  h: ["time", 3600],
  day: ["time", 86400],
  week: ["time", 604800],

  "m/s": ["speed", 1],
  "km/h": ["speed", 1000 / 3600],
  mph: ["speed", 1609.344 / 3600],
  knot: ["speed", 1852 / 3600],
};

const UNIT_ALIASES = new Map(
  Object.entries({
    nanometer: "nm",
    nanometers: "nm",
    micrometer: "um",
    micrometers: "um",
    micron: "um",
    microns: "um",
    "µm": "um",
    millimeter: "mm",
    millimeters: "mm",
    centimeter: "cm",
    centimeters: "cm",
    meter: "m",
    meters: "m",
    metre: "m",
    metres: "m",
    kilometer: "km",
    kilometers: "km",
    kilometre: "km",
    kilometres: "km",
    inch: "in",
    inches: "in",
    foot: "ft",
    feet: "ft",
    yard: "yd",
    yards: "yd",
    mile: "mi",
    miles: "mi",

    "sqmm": "mm2",
    "sqcm": "cm2",
    "sqm": "m2",
    "sqkm": "km2",
    "sqft": "ft2",
    "sqyd": "yd2",
    "sqmi": "mi2",

    milliliter: "ml",
    milliliters: "ml",
    millilitre: "ml",
    millilitres: "ml",
    liter: "l",
    liters: "l",
    litre: "l",
    litres: "l",
    gallon: "gal",
    gallons: "gal",
    quart: "qt",
    quarts: "qt",
    pint: "pt",
    pints: "pt",
    ounce: "oz",
    ounces: "oz",
    "fluidounce": "floz",
    "fluidounces": "floz",
    teaspoon: "tsp",
    teaspoons: "tsp",
    tablespoon: "tbsp",
    tablespoons: "tbsp",

    milligram: "mg",
    milligrams: "mg",
    gram: "g",
    grams: "g",
    kilogram: "kg",
    kilograms: "kg",
    pound: "lb",
    pounds: "lb",
    lbs: "lb",
    ton: "t",
    tonne: "t",
    tonnes: "t",

    bytes: "byte",
    kbyte: "kb",
    kbytes: "kb",
    kilobyte: "kb",
    kilobytes: "kb",
    mbyte: "mb",
    mbytes: "mb",
    megabyte: "mb",
    megabytes: "mb",
    gbyte: "gb",
    gbytes: "gb",
    gigabyte: "gb",
    gigabytes: "gb",

    second: "s",
    seconds: "s",
    sec: "s",
    secs: "s",
    minute: "min",
    minutes: "min",
    mins: "min",
    hr: "h",
    hrs: "h",
    hour: "h",
    hours: "h",
    days: "day",
    weeks: "week",

    "mps": "m/s",
    "meter/second": "m/s",
    "meters/second": "m/s",
    "kmh": "km/h",
    "kph": "km/h",
    "kilometer/hour": "km/h",
    "kilometers/hour": "km/h",
    "mile/hour": "mph",
    "miles/hour": "mph",
    knots: "knot",

    celsius: "c",
    fahrenheit: "f",
    kelvin: "k",
  }),
);

const normalizeUnit = (unit) => {
  const normalized = unit
    .trim()
    .toLowerCase()
    .replaceAll("²", "2")
    .replaceAll("³", "3")
    .replace(/\s+/g, "");

  return UNIT_ALIASES.get(normalized) ?? normalized;
};

const formatNumber = (value) => {
  if (!Number.isFinite(value)) {
    throw new Error("Invalid result");
  }

  if (Object.is(value, -0)) {
    return "0";
  }

  if (Number.isInteger(value) && Math.abs(value) < 1e15) {
    return String(value);
  }

  const rounded = Number(value.toPrecision(12));

  return rounded.toString();
};

const formatResult = (value, unit, ctx) => {
  const result = `${formatNumber(value)} ${unit}`;

  if (result.length > MAX_RESULT_LENGTH) {
    throw new Error(
      ctx.i18n.t(
        "pages.convert.errors.resultTooLong",
        `Result is too large to display; limit is ${MAX_RESULT_LENGTH} characters`,
      ),
    );
  }

  return result;
};

const temperatureToCelsius = (value, unit) => {
  switch (unit) {
    case "c":
      return value;
    case "f":
      return (value - 32) / 1.8;
    case "k":
      return value - 273.15;
    default:
      return null;
  }
};

const celsiusToTemperature = (value, unit) => {
  switch (unit) {
    case "c":
      return value;
    case "f":
      return value * 1.8 + 32;
    case "k":
      return value + 273.15;
    default:
      return null;
  }
};

const convertTemperature = (value, fromUnit, toUnit, ctx) => {
  const celsius = temperatureToCelsius(value, fromUnit);
  const converted = celsius === null ? null : celsiusToTemperature(celsius, toUnit);

  if (converted === null) {
    return null;
  }

  if (toUnit === "k" && converted < 0) {
    throw new Error(
      ctx.i18n.t(
        "pages.convert.errors.invalidTemperature",
        "Temperature is below absolute zero",
      ),
    );
  }

  return formatResult(converted, toUnit, ctx);
};

const parseConversion = (source) => {
  const match = source.match(
    /^(-?(?:\d+(?:\.\d+)?|\.\d+))\s*([a-zA-Zµ²³/]+)\s*(?:to|->|in)\s*([a-zA-Zµ²³/]+)$/i,
  );

  if (!match) {
    return null;
  }

  return {
    value: Number(match[1]),
    fromUnit: normalizeUnit(match[2]),
    toUnit: normalizeUnit(match[3]),
  };
};

export default function activate(ctx) {
  ctx.registerAction("convert", (expression) => {
    const source = String(expression ?? "").trim();

    if (!source) {
      throw new Error(
        ctx.i18n.t(
          "pages.convert.errors.required",
          "Conversion expression is required",
        ),
      );
    }

    if (source.length > MAX_EXPRESSION_LENGTH) {
      throw new Error(
        ctx.i18n.t(
          "pages.convert.errors.expressionTooLong",
          `Conversion expression must be ${MAX_EXPRESSION_LENGTH} characters or less`,
        ),
      );
    }

    const parsed = parseConversion(source);

    if (!parsed) {
      throw new Error(
        ctx.i18n.t(
          "pages.convert.errors.unsupportedConversion",
          "Unsupported conversion",
        ),
      );
    }

    const { value, fromUnit, toUnit } = parsed;

    if (!Number.isFinite(value) || Math.abs(value) > MAX_ABSOLUTE_VALUE) {
      throw new Error(
        ctx.i18n.t(
          "pages.convert.errors.valueOutOfRange",
          `Value is out of range; maximum absolute value is ${MAX_ABSOLUTE_VALUE}`,
        ),
      );
    }

    const temperature = convertTemperature(value, fromUnit, toUnit, ctx);

    if (temperature) {
      return temperature;
    }

    const fromDefinition = UNIT_DEFINITIONS[fromUnit];
    const toDefinition = UNIT_DEFINITIONS[toUnit];

    if (!fromDefinition || !toDefinition) {
      throw new Error(
        ctx.i18n.t("pages.convert.errors.unsupportedUnit", "Unsupported unit"),
      );
    }

    const [fromGroup, fromFactor] = fromDefinition;
    const [toGroup, toFactor] = toDefinition;

    if (fromGroup !== toGroup) {
      throw new Error(
        ctx.i18n.t(
          "pages.convert.errors.incompatibleUnits",
          "Incompatible units",
        ),
      );
    }

    return formatResult((value * fromFactor) / toFactor, toUnit, ctx);
  });

  ctx.log.info("unit-converter-plugin activated");
}

export function deactivate(ctx) {
  ctx.log.info("unit-converter-plugin deactivated");
}
