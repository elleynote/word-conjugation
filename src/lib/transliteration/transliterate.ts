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
  "ես": "Yes",
  "դուն": "Toun",
  "դուք": "Touk",
};

const OU_LOWER = "\uE000";
const OU_TITLE = "\uE001";

function transliterateToken(token: string, dialect: Dialect): string {
  if (dialect === "western" && WESTERN_WORD_OVERRIDES[token]) {
    return WESTERN_WORD_OVERRIDES[token];
  }

  const withDigraphs = token
    .replace(/Ու/g, OU_TITLE)
    .replace(/ու/g, OU_LOWER);

  return Array.from(withDigraphs)
    .map((character) => {
      if (character === OU_LOWER) return "ou";
      if (character === OU_TITLE) return "Ou";
      return (dialect === "western" ? westernOverrides[character] : undefined) ?? commonMap[character] ?? character;
    })
    .join("");
}

export function transliterateArmenian(value: string, dialect: Dialect): string {
  return value
    .split(/(\s+)/)
    .map((part) => (/^\s+$/u.test(part) ? part : transliterateToken(part, dialect)))
    .join("")
    .replace(/\s+/g, " ")
    .trim();
}
