import type { Dialect } from "../../types/verb";

const commonMap: Record<string, string> = {
  Ա: "A", ա: "a", Բ: "B", բ: "b", Գ: "G", գ: "g", Դ: "D", դ: "d",
  Ե: "Ye", ե: "e", Զ: "Z", զ: "z", Է: "E", է: "e", Ը: "Ë", ը: "ë",
  Թ: "T'", թ: "t'", Ժ: "Zh", ժ: "zh", Ի: "I", ի: "i", Լ: "L", լ: "l",
  Խ: "Kh", խ: "kh", Ծ: "Ts", ծ: "ts", Կ: "K", կ: "k", Հ: "H", հ: "h",
  Ձ: "Dz", ձ: "dz", Ղ: "Gh", ղ: "gh", Ճ: "Ch", ճ: "ch", Մ: "M", մ: "m",
  Յ: "Y", յ: "y", Ն: "N", ն: "n", Շ: "Sh", շ: "sh", Ո: "Vo", ո: "o",
  Չ: "Ch'", չ: "ch'", Պ: "P", պ: "p", Ջ: "J", ջ: "j", Ռ: "R", ռ: "r",
  Ս: "S", ս: "s", Վ: "V", վ: "v", Տ: "T", տ: "t", Ր: "R", ր: "r",
  Ց: "Ts'", ց: "ts'", Ւ: "W", ւ: "w", Փ: "P'", փ: "p'", Ք: "K'", ք: "k'",
  Օ: "O", օ: "o", Ֆ: "F", ֆ: "f", և: "ev", "՛": "", "՜": "", "՝": "", "՞": "",
};

const westernOverrides: Record<string, string> = {
  բ: "p", Բ: "P", գ: "k", Գ: "K", դ: "t", Դ: "T", ձ: "ts", Ձ: "Ts",
  ջ: "ch", Ջ: "Ch", պ: "b", Պ: "B", կ: "g", Կ: "G", տ: "d", Տ: "D",
};

const WESTERN_WORD_OVERRIDES: Record<string, string> = {
  "դուն": "Toun",
  "դուք": "Touk",
};

const OU_LOWER = "\uE000";
const OU_TITLE = "\uE001";
const ARMENIAN_WORD = /[Ա-Ֆա-ֆև]+/u;
const SENTENCE_END = /[.!?։՞՜]\s*$/u;

function transliterateWesternCore(core: string, sentenceInitial: boolean): string {
  if (core === "ես") {
    return sentenceInitial ? "Yes" : "es";
  }

  if (core === "եմ") {
    return "em";
  }

  if (WESTERN_WORD_OVERRIDES[core]) {
    return WESTERN_WORD_OVERRIDES[core];
  }

  const withDigraphs = core
    .replace(/Ու/g, OU_TITLE)
    .replace(/ու/g, OU_LOWER);

  return Array.from(withDigraphs)
    .map((character, index) => {
      if (character === OU_LOWER) return "ou";
      if (character === OU_TITLE) return "Ou";
      if (index === 0 && character === "ե") return "ye";
      if (index === 0 && character === "Ե") return "Ye";
      if (index === 0 && character === "ո") return "vo";
      if (index === 0 && character === "Ո") return "Vo";
      return westernOverrides[character] ?? commonMap[character] ?? character;
    })
    .join("");
}

function transliterateToken(token: string, dialect: Dialect, sentenceInitial: boolean): string {
  const match = token.match(ARMENIAN_WORD);

  if (!match) {
    return token;
  }

  const core = match[0];
  const start = match.index ?? 0;
  const prefix = token.slice(0, start);
  const suffix = token.slice(start + core.length);

  if (dialect === "western") {
    return `${prefix}${transliterateWesternCore(core, sentenceInitial)}${suffix}`;
  }

  const withDigraphs = core
    .replace(/Ու/g, OU_TITLE)
    .replace(/ու/g, OU_LOWER);

  const transliterated = Array.from(withDigraphs)
    .map((character) => {
      if (character === OU_LOWER) return "ou";
      if (character === OU_TITLE) return "Ou";
      return commonMap[character] ?? character;
    })
    .join("");

  return `${prefix}${transliterated}${suffix}`;
}

export function transliterateArmenian(value: string, dialect: Dialect): string {
  let sentenceInitial = true;

  const output = value
    .split(/(\s+)/)
    .map((part) => {
      if (/^\s+$/u.test(part)) {
        return part;
      }

      const transliterated = transliterateToken(part, dialect, sentenceInitial);

      if (ARMENIAN_WORD.test(part)) {
        sentenceInitial = SENTENCE_END.test(part);
      }

      return transliterated;
    })
    .join("")
    .replace(/\s+/g, " ")
    .trim();

  return output;
}
