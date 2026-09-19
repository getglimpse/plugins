const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 128;
const RANDOM_BUFFER_SIZE = 64;
const AMBIGUOUS_CHARACTERS = new Set(["I", "l", "1", "O", "0", "o"]);
const CHARACTER_GROUPS = {
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  numbers: "0123456789",
  symbols: "!@#$%^&*()-_=+[]{};:,.?/",
};

export default function activate(ctx) {
  ctx.registerAction("generatePassword", (input) => {
    const options = normalizeOptions(input, ctx);
    const groups = getEnabledCharacterGroups(options);

    if (groups.length === 0) {
      throw new Error(
        ctx.i18n.t(
          "actions.generatePassword.errors.characterSetRequired",
          "Select at least one character set",
        ),
      );
    }

    if (
      typeof crypto === "undefined" ||
      typeof crypto.getRandomValues !== "function"
    ) {
      throw new Error(
        ctx.i18n.t(
          "actions.generatePassword.errors.secureRandomUnavailable",
          "Secure random generation requires Glimpse 0.2.7 or later",
        ),
      );
    }

    const randomInt = createRandomIntegerGenerator();
    const password = groups.map((group) => pickCharacter(group, randomInt));
    const allCharacters = groups.join("");

    while (password.length < options.length) {
      password.push(pickCharacter(allCharacters, randomInt));
    }

    shuffle(password, randomInt);

    return password.join("");
  });

  ctx.log.info("password-generator-plugin activated");
}

export function deactivate(ctx) {
  ctx.log.info("password-generator-plugin deactivated");
}

function normalizeOptions(input, ctx) {
  const source = input && typeof input === "object" ? input : {};
  const length = Number(source.length);

  if (
    !Number.isInteger(length) ||
    length < MIN_PASSWORD_LENGTH ||
    length > MAX_PASSWORD_LENGTH
  ) {
    throw new Error(
      ctx.i18n
        .t(
          "actions.generatePassword.errors.invalidLength",
          "Password length must be an integer from {min} to {max}",
        )
        .replace("{min}", String(MIN_PASSWORD_LENGTH))
        .replace("{max}", String(MAX_PASSWORD_LENGTH)),
    );
  }

  return {
    length,
    lowercase: source.lowercase === true,
    uppercase: source.uppercase === true,
    numbers: source.numbers === true,
    symbols: source.symbols === true,
    excludeAmbiguous: source.excludeAmbiguous === true,
  };
}

function getEnabledCharacterGroups(options) {
  return Object.entries(CHARACTER_GROUPS).flatMap(([name, characters]) => {
    if (!options[name]) {
      return [];
    }

    const filteredCharacters = options.excludeAmbiguous
      ? [...characters]
          .filter((character) => !AMBIGUOUS_CHARACTERS.has(character))
          .join("")
      : characters;

    return filteredCharacters ? [filteredCharacters] : [];
  });
}

function createRandomIntegerGenerator() {
  let buffer = new Uint8Array(0);
  let offset = 0;

  const nextByte = () => {
    if (offset >= buffer.length) {
      buffer = crypto.getRandomValues(new Uint8Array(RANDOM_BUFFER_SIZE));
      offset = 0;
    }

    const value = buffer[offset];
    offset += 1;

    return value;
  };

  return (maxExclusive) => {
    if (
      !Number.isInteger(maxExclusive) ||
      maxExclusive < 1 ||
      maxExclusive > 256
    ) {
      throw new Error(`Invalid random range: ${maxExclusive}`);
    }

    const rejectionLimit = 256 - (256 % maxExclusive);
    let value = nextByte();

    while (value >= rejectionLimit) {
      value = nextByte();
    }

    return value % maxExclusive;
  };
}

function pickCharacter(characters, randomInt) {
  return characters[randomInt(characters.length)];
}

function shuffle(values, randomInt) {
  for (let index = values.length - 1; index > 0; index -= 1) {
    const swapIndex = randomInt(index + 1);
    const current = values[index];

    values[index] = values[swapIndex];
    values[swapIndex] = current;
  }
}
