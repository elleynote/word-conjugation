import {
  buildWesternImportRecord,
  parseLexiconTable,
  parseParadigmTable,
  parseTsv,
} from './lib/western-source.mjs';

const REVISION = 'd6aefd5dabbb6d0ca1c147182bbdf62aa5921153';
const RAW_BASE = `https://raw.githubusercontent.com/jhdeov/ArmenianVerbs/${REVISION}`;
const SOURCE_URLS = {
  lexiconArm: `${RAW_BASE}/verblist/verblist_tsv/verblist_arm.tsv`,
  lexiconTrans: `${RAW_BASE}/verblist/verblist_tsv/verblist_trans.tsv`,
  paradigms: `${RAW_BASE}/paradigms/paradigms_tsv/paradigms_stemmed.tsv`,
  syntheticNegative: `${RAW_BASE}/complex_tenses/complex_tenses_tsv/synthetic_negative.tsv`,
};

const args = new Set(process.argv.slice(2));
const dryRun = args.has('--dry-run');
const limitArg = process.argv.find((arg) => arg.startsWith('--limit='));
const limit = limitArg ? Number(limitArg.split('=')[1]) : null;

function requiredEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required.`);
  return value.replace(/\/$/u, '');
}

async function fetchText(url) {
  const response = await fetch(url, { headers: { 'User-Agent': 'tun-word-conjugation-importer' } });
  if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.status}`);
  return response.text();
}

async function supabaseUpsert(url, serviceKey, table, rows, onConflict) {
  if (!rows.length) return;
  const query = onConflict ? `?on_conflict=${encodeURIComponent(onConflict)}` : '';
  const response = await fetch(`${url}/rest/v1/${table}${query}`, {
    method: 'POST',
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates,return=minimal',
    },
    body: JSON.stringify(rows),
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`${table} upsert failed (${response.status}): ${detail.slice(0, 1000)}`);
  }
}

function chunks(values, size) {
  const result = [];
  for (let index = 0; index < values.length; index += size) result.push(values.slice(index, index + size));
  return result;
}

function transliterationByIndex(tsv) {
  const rows = parseTsv(tsv);
  const headers = rows.shift() ?? [];
  const indexColumn = headers.indexOf('Index');
  const verbColumn = headers.indexOf('Verb');
  if (indexColumn < 0 || verbColumn < 0) throw new Error('Unexpected transliterated lexicon header.');
  return new Map(rows.map((row) => [row[indexColumn], row[verbColumn]]));
}

async function main() {
  const [lexiconArmTsv, lexiconTransTsv, paradigmTsv, syntheticNegativeTsv] = await Promise.all([
    fetchText(SOURCE_URLS.lexiconArm),
    fetchText(SOURCE_URLS.lexiconTrans),
    fetchText(SOURCE_URLS.paradigms),
    fetchText(SOURCE_URLS.syntheticNegative),
  ]);

  const lexicon = parseLexiconTable(lexiconArmTsv);
  const transMap = transliterationByIndex(lexiconTransTsv);
  const paradigms = parseParadigmTable(paradigmTsv);
  if (lexicon.length !== 3257) throw new Error(`Expected 3257 Western verbs, received ${lexicon.length}.`);

  const selected = limit ? lexicon.slice(0, limit) : lexicon;
  const records = selected.map((row) => buildWesternImportRecord(row, transMap.get(row.index) ?? '', paradigms, syntheticNegativeTsv));
  const noEnglish = records.filter((record) => record.translations.length === 0).length;

  console.log(`Prepared ${records.length} Western Armenian verbs from pinned revision ${REVISION}.`);
  console.log(`${noEnglish} records have no normalized English headword and remain searchable by Armenian/transliteration.`);

  if (dryRun) {
    const examples = records.filter((record) => ['գրել','սիրել','կարդալ','ուտել','խաղալ'].includes(record.dialect.lemma));
    console.log(JSON.stringify(examples, null, 2));
    return;
  }

  const supabaseUrl = requiredEnv('NEXT_PUBLIC_SUPABASE_URL');
  const serviceKey = requiredEnv('SUPABASE_SERVICE_ROLE_KEY');

  for (const batch of chunks(records, 100)) {
    await supabaseUpsert(supabaseUrl, serviceKey, 'verbs', batch.map((record) => record.verb), 'id');
    const translations = batch.flatMap((record) => record.translations);
    await supabaseUpsert(supabaseUrl, serviceKey, 'verb_translations', translations, 'verb_id,language_code,value');
    await supabaseUpsert(supabaseUrl, serviceKey, 'verb_dialects', batch.map((record) => record.dialect), 'verb_id,dialect');
    process.stdout.write('.');
  }

  console.log(`\nImported ${records.length} Western Armenian verbs into Supabase.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});