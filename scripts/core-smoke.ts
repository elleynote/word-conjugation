import { verbs } from "../src/data/verbs";
import { getVisibleExtraSections } from "../src/lib/options/displayOptions";
import { applyLegacyDisplayOptions } from "../src/lib/options/applyLegacyDisplayOptions";
import { conjugateVerb } from "../src/lib/conjugation/conjugate";
import { copyFor, localizedVerbTranslation } from "../src/lib/i18n/copy";
import { getCorpusStats } from "../src/lib/corpus/stats";
import { getVerbMetadata } from "../src/lib/metadata/metadata";
import { backspaceAtSelection } from "../src/lib/keyboard/insertAtSelection";
import { applyTextCase, visibleTranscription } from "../src/lib/presentation/format";
import { getDialectPresentation } from "../src/lib/presentation/dialectPresentation";
import { transliterateArmenian } from "../src/lib/transliteration/transliterate";
import { englishSentenceFor } from "../src/lib/sentences/englishSentence";

const write = verbs.find((verb) => verb.id === "write");
function expect(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}
function equal<T>(actual: T, expected: T, message?: string) {
  if (actual !== expected) throw new Error(message ?? `Expected ${String(expected)}, got ${String(actual)}`);
}
function deepEqual(actual: unknown, expected: unknown, message?: string) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) throw new Error(message ?? `Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
}

expect(write, "starter corpus must contain write");
deepEqual(getDialectPresentation("western").optionKeys, ["transcription", "continuousForm", "mediativeForm"]);
deepEqual(getDialectPresentation("eastern").optionKeys, ["transcription", "probableFuture"]);
const eastern = write.dialects.eastern;
expect(eastern, "write must have eastern data");
const easternProbable = applyLegacyDisplayOptions(conjugateVerb(write, "eastern", "affirmative"), eastern, "eastern", { transcription: true, probableFuture: true, continuousForm: false, mediativeForm: false, textCase: "title" });
equal(easternProbable.tenses.future.forms.firstSingular.armenian, eastern.probableFuture?.firstSingular);
const western = write.dialects.western;
expect(western, "write must have western data");
const westernMediative = applyLegacyDisplayOptions(conjugateVerb(write, "western", "affirmative"), western, "western", { transcription: true, probableFuture: false, continuousForm: false, mediativeForm: true, textCase: "title" });
equal(westernMediative.tenses.presentPerfect.forms.firstSingular.armenian, western.mediativeForms?.firstSingular);

equal(copyFor("ru").searchButton, "ОК");
equal(localizedVerbTranslation(write, "ru"), "писать");

const stats = getCorpusStats(verbs);
expect(stats.western > 0 && stats.eastern > 0, "dialect stats are derived from corpus");
expect(stats.english >= verbs.length, "english stats count actual bundled translations");
expect(stats.russian >= verbs.length, "russian stats count actual bundled translations");

const metadata = getVerbMetadata(write, "eastern");
equal(metadata.length, 10);
equal(metadata[0].label, "Name");
equal(metadata[3].label, "Irregular");
equal(metadata[4].label, "Root");
equal(metadata[9].label, "Future.P");
const westernMetadata = getVerbMetadata(write, "western");
equal(westernMetadata.length, 12);
equal(westernMetadata[5].label, "Particule");
equal(westernMetadata[7].label, "Mediative.P");
equal(getVerbMetadata(write, "western", "ru")[0].label, "Глагол");

deepEqual(backspaceAtSelection("գրել", 2, 2), { value: "գել", caret: 1 });
deepEqual(backspaceAtSelection("գրել", 1, 3), { value: "գլ", caret: 1 });

equal(applyTextCase("գրել", "upper"), "ԳՐԵԼ");
equal(applyTextCase("ԳՐԵԼ", "lower"), "գրել");
equal(visibleTranscription("grel", false), "");
equal(visibleTranscription("grel", true), "grel");

equal(transliterateArmenian("ես", "western"), "Yes");
equal(transliterateArmenian("դուն", "western"), "Toun");
equal(transliterateArmenian("դուք", "western"), "Touk");
expect(transliterateArmenian("սիրում", "western").includes("ou"), "ու is rendered as ou");

equal(englishSentenceFor("love", "present", "affirmative", "firstSingular"), "I love");
equal(englishSentenceFor("love", "present", "affirmative", "thirdSingular"), "He/She loves");
equal(englishSentenceFor("go", "preterite", "affirmative", "firstSingular"), "I went");
equal(englishSentenceFor("write", "future", "negative", "thirdPlural"), "They will not write");

equal(getVisibleExtraSections(eastern, {
  transcription: true,
  probableFuture: false,
  continuousForm: false,
  mediativeForm: false,
  textCase: "title",
}).length, 0);

const enabled = getVisibleExtraSections(eastern, {
  transcription: true,
  probableFuture: true,
  continuousForm: true,
  mediativeForm: true,
  textCase: "title",
});
expect(enabled.some((section) => section.key === "probableFuture"), "probable future section visible");
expect(enabled.some((section) => section.key === "continuous"), "continuous section visible");
expect(enabled.some((section) => section.key === "mediative"), "mediative section visible");

console.log("core smoke assertions passed");
