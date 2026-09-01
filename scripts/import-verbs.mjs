import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const inputPath = resolve(process.argv[2] ?? "data/verbs.example.json");
const outputPath = resolve(process.argv[3] ?? "src/data/generated-verbs.ts");
const source = JSON.parse(await readFile(inputPath, "utf8"));

if (!Array.isArray(source)) throw new Error("Input must be a JSON array of verb records.");

const dialectNames = ["western", "eastern"];
const personKeys = ["firstSingular", "secondSingular", "thirdSingular", "firstPlural", "secondPlural", "thirdPlural"];

function validatePersonForms(value, path) {
  if (value == null) return;
  if (typeof value !== "object" || Array.isArray(value)) throw new Error(`${path} must be an object.`);
  for (const key of Object.keys(value)) {
    if (!personKeys.includes(key) || typeof value[key] !== "string") throw new Error(`${path}.${key} is invalid.`);
  }
}

for (const [index, verb] of source.entries()) {
  if (!verb?.id || !Array.isArray(verb.english) || !Array.isArray(verb.french) || !Array.isArray(verb.aliases) || !verb.dialects) {
    throw new Error(`Invalid verb at index ${index}: id, english[], french[], aliases[] and dialects are required.`);
  }

  for (const dialect of dialectNames) {
    const data = verb.dialects[dialect];
    if (!data) continue;
    for (const field of ["lemma", "transliteration", "group", "root", "class"]) {
      if (typeof data[field] !== "string" || !data[field]) throw new Error(`Verb ${verb.id} ${dialect}.${field} is required.`);
    }
    if (typeof data.isIrregular !== "boolean" || typeof data.participles !== "object") {
      throw new Error(`Verb ${verb.id} ${dialect} requires isIrregular and participles.`);
    }
    validatePersonForms(data.probableFuture, `${verb.id}.${dialect}.probableFuture`);
    validatePersonForms(data.continuousForms, `${verb.id}.${dialect}.continuousForms`);
    validatePersonForms(data.mediativeForms, `${verb.id}.${dialect}.mediativeForms`);
  }
}

const generated = `import type { Verb } from "../types/verb";\n\nexport const generatedVerbs: Verb[] = ${JSON.stringify(source, null, 2)};\n`;
await writeFile(outputPath, generated, "utf8");
console.log(`Generated ${source.length} verb record(s) at ${outputPath}`);
