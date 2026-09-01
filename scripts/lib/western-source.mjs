const PERSONS = {
  firstSingular: '1sg',
  secondSingular: '2sg',
  thirdSingular: '3sg',
  firstPlural: '1pl',
  secondPlural: '2pl',
  thirdPlural: '3pl',
};

const PERSON_KEYS = Object.keys(PERSONS);
const ARMENIAN_VOWELS = /^[աեէըիոօու]/u;

function clean(value) {
  return String(value ?? '').replace(/^\uFEFF/u, '').trim();
}

function same(a, b) {
  return clean(a).toLocaleLowerCase() === clean(b).toLocaleLowerCase();
}

export function parseTsv(text) {
  return String(text)
    .replace(/\r\n?/gu, '\n')
    .split('\n')
    .filter((line) => line.length > 0)
    .map((line) => line.split('\t').map((cell) => cell.trim()));
}

export function parseParadigmTable(text) {
  const rows = parseTsv(text);
  if (!rows.length || rows[0][0] !== 'Class number') throw new Error('Unexpected paradigm TSV header.');
  const metadataNames = new Set(['Class number','Subclass','Regularity','Initial segment','Regular category','Example lemma','Example stem','Affix']);
  const rowMap = new Map();
  for (const row of rows) rowMap.set(row[0], row);
  const count = Math.max(...rows.map((row) => row.length)) - 1;
  const paradigms = [];
  for (let col = 1; col <= count; col += 1) {
    const classCell = rowMap.get('Class number')?.[col] ?? '';
    if (!classCell) continue;
    const forms = {};
    for (const row of rows) {
      const label = row[0];
      if (metadataNames.has(label)) continue;
      const value = row[col] ?? '';
      if (!(label in forms)) {
        forms[label] = value;
      } else if (label === 'subjunctive past imperfect 3sg' && !forms['subjunctive past imperfect 2sg']) {
        forms['subjunctive past imperfect 2sg'] = forms[label];
        forms[label] = value;
      } else {
        forms[label] = value;
      }
    }
    paradigms.push({
      classNumber: classCell.replace(/^Class\s+/iu, ''),
      subclass: rowMap.get('Subclass')?.[col] ?? '',
      regularity: rowMap.get('Regularity')?.[col] ?? '',
      initialSegment: rowMap.get('Initial segment')?.[col] ?? '',
      regularCategory: rowMap.get('Regular category')?.[col] ?? '',
      exampleLemma: rowMap.get('Example lemma')?.[col] ?? '',
      stemSpec: rowMap.get('Example stem')?.[col] ?? '',
      affix: rowMap.get('Affix')?.[col] ?? '',
      forms,
    });
  }
  return paradigms;
}

export function parseLexiconTable(text) {
  const rows = parseTsv(text);
  const headers = rows.shift() ?? [];
  return rows.map((cells) => {
    const record = Object.fromEntries(headers.map((header, index) => [header, cells[index] ?? '']));
    return {
      index: record.Index,
      verb: record.Verb,
      classNumber: record['Class number'],
      subclass: record.Subclass,
      exampleLemma: record['Example lemma'],
      stem: record.Stem,
      regularity: record.Regularity,
      initialSegment: record['Initial segment'],
      regularCategory: record['Regular category'],
      affix: record.Affix,
      translation: record.Translation,
      transitivity: record.Transitivity,
    };
  }).filter((row) => row.verb);
}

export function findParadigm(row, paradigms) {
  const candidates = paradigms.filter((item) => same(item.classNumber, row.classNumber));
  if (!candidates.length) throw new Error(`No paradigm for class ${row.classNumber} (${row.verb ?? 'unknown verb'}).`);
  return candidates.map((item) => {
    let score = 0;
    if (same(item.exampleLemma, row.exampleLemma)) score += 16;
    if (same(item.subclass, row.subclass)) score += 8;
    if (same(item.initialSegment, row.initialSegment)) score += 4;
    if (same(item.affix, row.affix)) score += 2;
    if (same(item.regularCategory, row.regularCategory)) score += 1;
    return { item, score };
  }).sort((a,b) => b.score - a.score)[0].item;
}

function parseStemSpec(spec) {
  const result = {};
  const regex = /(<[^>]+>)\s*=\s*([^,]+)/gu;
  let match;
  while ((match = regex.exec(spec)) !== null) result[match[1]] = match[2].trim();
  return result;
}

function deriveStemMap(row, paradigm) {
  const sourceMap = parseStemSpec(paradigm.stemSpec);
  const keys = Object.keys(sourceMap);
  if (!keys.length) return {};
  if (keys.length === 1 && keys[0] === '<X>') return { '<X>': row.stem };

  const primaryKey = sourceMap['<Xprs>'] ? '<Xprs>' : sourceMap['<X>'] ? '<X>' : keys[0];
  const sourcePrimary = sourceMap[primaryKey];
  const actualPrimary = row.stem || sourcePrimary;
  const prefix = sourcePrimary && actualPrimary.endsWith(sourcePrimary)
    ? actualPrimary.slice(0, actualPrimary.length - sourcePrimary.length)
    : '';

  const mapped = {};
  for (const key of keys) {
    const sourceStem = sourceMap[key];
    if (key === primaryKey) mapped[key] = actualPrimary;
    else if (prefix || same(row.verb, paradigm.exampleLemma)) mapped[key] = `${prefix}${sourceStem}`;
    else mapped[key] = sourceStem;
  }
  return mapped;
}

export function instantiateForm(template, row, paradigm) {
  const raw = clean(template);
  if (!raw || raw === 'periphrasis') return raw;
  const stems = deriveStemMap(row, paradigm);
  let result = raw;
  for (const [placeholder, stem] of Object.entries(stems)) result = result.split(placeholder).join(stem);
  return result;
}

function parseSyntheticNegative(text) {
  const rows = parseTsv(text);
  const map = {};
  for (const row of rows.slice(1)) map[row[0]] = row[1];
  return map;
}

function pform(paradigm, row, label) {
  return instantiateForm(paradigm.forms[label] ?? '', row, paradigm);
}

function firstVariant(value) {
  return clean(value).split(/,\s*/u)[0] ?? '';
}

function joinParticipleAux(participle, aux, auxFirst = false) {
  if (!participle || !aux) return '—';
  return auxFirst ? `${aux} ${participle}` : `${participle} ${aux}`;
}

function directOrDash(value) {
  return clean(value) || '—';
}

export function buildWesternForms(row, paradigms, syntheticNegativeTsv) {
  const paradigm = findParadigm(row, paradigms);
  const shortAux = paradigms.find((item) => item.classNumber === '32' && item.exampleLemma === 'եմ')
    ?? paradigms.find((item) => item.classNumber === '32');
  if (!shortAux) throw new Error('Short auxiliary class 32 is missing from paradigms.');
  const synth = parseSyntheticNegative(syntheticNegativeTsv);
  const result = { affirmative: {}, negative: {} };
  const perfectParticiple = pform(paradigm, row, 'perfect participle');
  const presentNegativeParticiple = pform(paradigm, row, 'present negative participle');
  const imperfectNegativeParticiple = pform(paradigm, row, 'past imperfect negative participle');

  for (const person of PERSON_KEYS) {
    const suffix = PERSONS[person];
    for (const polarity of ['affirmative','negative']) {
      for (const tense of ['present','imperfect','preterite','imperative','presentPerfect','pluperfect','future','conditional']) {
        result[polarity][tense] ??= {};
      }
    }

    result.affirmative.present[person] = directOrDash(pform(paradigm, row, `indicative present ${suffix}`));
    result.affirmative.imperfect[person] = directOrDash(pform(paradigm, row, `indicative past imperfect ${suffix}`));
    result.affirmative.preterite[person] = directOrDash(pform(paradigm, row, `indicative past ${suffix}`));
    result.affirmative.future[person] = directOrDash(pform(paradigm, row, `subjunctive present ${suffix}`));
    if (result.affirmative.future[person] !== '—') result.affirmative.future[person] = `պիտի ${result.affirmative.future[person]}`;
    result.affirmative.conditional[person] = directOrDash(pform(paradigm, row, `subjunctive past imperfect ${suffix}`));
    if (result.affirmative.conditional[person] !== '—') result.affirmative.conditional[person] = `պիտի ${result.affirmative.conditional[person]}`;

    const auxPresent = shortAux.forms[`indicative present ${suffix}`] ?? '';
    const auxImperfect = shortAux.forms[`indicative past imperfect ${suffix}`] ?? '';
    result.affirmative.presentPerfect[person] = joinParticipleAux(perfectParticiple, auxPresent);
    result.affirmative.pluperfect[person] = joinParticipleAux(perfectParticiple, auxImperfect);

    if (person === 'secondSingular') {
      result.affirmative.imperative[person] = directOrDash(pform(paradigm, row, 'imperative 2sg'));
      result.negative.imperative[person] = directOrDash(pform(paradigm, row, 'prohibitive 2sg'));
      if (result.negative.imperative[person] !== '—') result.negative.imperative[person] = `մի՛ ${result.negative.imperative[person]}`;
    } else if (person === 'secondPlural') {
      result.affirmative.imperative[person] = directOrDash(pform(paradigm, row, 'imperative 2pl'));
      result.negative.imperative[person] = directOrDash(pform(paradigm, row, 'prohibitive 2pl'));
      if (result.negative.imperative[person] !== '—') result.negative.imperative[person] = `մի՛ ${result.negative.imperative[person]}`;
    } else {
      result.affirmative.imperative[person] = '—';
      result.negative.imperative[person] = '—';
    }

    const directNegPresent = pform(paradigm, row, `negative indicative present ${suffix}`);
    if (directNegPresent && directNegPresent !== 'periphrasis') {
      result.negative.present[person] = directNegPresent;
    } else {
      let auxKey = `present ${suffix}`;
      if (person === 'thirdSingular') {
        const ptcp = firstVariant(presentNegativeParticiple);
        auxKey = ARMENIAN_VOWELS.test(ptcp) ? 'present 3sg (before vowel)' : 'present 3sg (before consonant';
      }
      result.negative.present[person] = joinParticipleAux(presentNegativeParticiple, synth[auxKey] ?? '', true);
    }

    const directNegImperfect = pform(paradigm, row, `negative indicative past imperfect ${suffix}`);
    result.negative.imperfect[person] = directNegImperfect && directNegImperfect !== 'periphrasis'
      ? directNegImperfect
      : joinParticipleAux(imperfectNegativeParticiple, synth[`past imperfect ${suffix}`] ?? '', true);

    result.negative.preterite[person] = directOrDash(pform(paradigm, row, `negative indicative past ${suffix}`));
    const auxNegPresent = shortAux.forms[`negative indicative present ${suffix}`] ?? '';
    const auxNegImperfect = shortAux.forms[`negative indicative past imperfect ${suffix}`] ?? '';
    result.negative.presentPerfect[person] = joinParticipleAux(perfectParticiple, auxNegPresent, true);
    result.negative.pluperfect[person] = joinParticipleAux(perfectParticiple, auxNegImperfect, true);

    result.negative.future[person] = directOrDash(pform(paradigm, row, `negative subjunctive present ${suffix}`));
    if (result.negative.future[person] !== '—') result.negative.future[person] = `պիտի ${result.negative.future[person]}`;
    result.negative.conditional[person] = directOrDash(pform(paradigm, row, `negative subjunctive past imperfect ${suffix}`));
    if (result.negative.conditional[person] !== '—') result.negative.conditional[person] = `պիտի ${result.negative.conditional[person]}`;
  }
  return result;
}

export function englishHeadwords(translation) {
  const text = clean(translation);
  if (!text) return [];
  const match = /\bto\s+([^.;]+)/iu.exec(text);
  if (!match) return [];
  return [...new Set(match[1]
    .split(/,\s*(?:to\s+)?/iu)
    .map((value) => value.replace(/^to\s+/iu, '').replace(/\([^)]*\)/gu, '').trim().replace(/[.!?]+$/gu, ''))
    .filter(Boolean))];
}

export function dialectClassFromAffix(affix, regularity) {
  if (regularity !== 'Regular') return 'irregular';
  if (affix === '-ել') return 'el';
  if (affix === '-ալ') return 'al';
  return 'irregular';
}

export function buildWesternImportRecord(row, transliteration, paradigms, syntheticNegativeTsv) {
  const paradigm = findParadigm(row, paradigms);
  const forms = buildWesternForms(row, paradigms, syntheticNegativeTsv);
  const headwords = englishHeadwords(row.translation);
  const id = `hyw-${String(row.index).padStart(4, '0')}`;
  const translations = headwords.map((value, index) => ({ verb_id: id, language_code: 'en', value, is_primary: index === 0 }));
  if (row.translation && !translations.some((item) => same(item.value, row.translation))) {
    translations.push({ verb_id: id, language_code: 'en', value: row.translation, is_primary: translations.length === 0 });
  }

  const participles = {
    present: pform(paradigm, row, 'subject participle') || undefined,
    perfect: pform(paradigm, row, 'perfect participle') || undefined,
    future: pform(paradigm, row, 'future participle') || undefined,
    negative: pform(paradigm, row, 'present negative participle') || undefined,
  };

  return {
    verb: { id, aliases: [row.verb, transliteration, ...headwords].filter(Boolean) },
    translations,
    dialect: {
      verb_id: id,
      dialect: 'western',
      lemma: row.verb,
      transliteration: transliteration || '',
      conjugation_group: row.regularCategory || `Class ${row.classNumber}`,
      root: row.stem,
      conjugation_class: dialectClassFromAffix(row.affix, row.regularity),
      is_irregular: row.regularity !== 'Regular',
      base: row.verb,
      particule: null,
      present_participle: participles.present ?? null,
      perfect_participle: participles.perfect ?? null,
      past_participle: participles.perfect ?? null,
      mediative_participle: pform(paradigm, row, 'evidential participle') || null,
      future_participle: participles.future ?? null,
      negative_participle: participles.negative ?? null,
      imperfect_non_personal: pform(paradigm, row, 'past imperfect negative participle') || null,
      subject_participle: participles.present ?? null,
      imperative_singular: pform(paradigm, row, 'imperative 2sg') || null,
      imperative_plural: pform(paradigm, row, 'imperative 2pl') || null,
      probable_future: {}, continuous_forms: {}, mediative_forms: {},
      source_name: 'armenian-verbs-2020',
      source_row: Number(row.index) || null,
      class_number: Number(row.classNumber) || null,
      subclass: row.subclass || null,
      regularity: row.regularity || null,
      initial_segment: row.initialSegment || null,
      regular_category: row.regularCategory || null,
      affix: row.affix || null,
      transitivity: row.transitivity || null,
      verified_forms: forms,
      source_metadata: { example_lemma: row.exampleLemma || null, raw_translation: row.translation || null },
    },
  };
}