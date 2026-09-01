import fs from 'node:fs';

function expect(condition, message) {
  if (!condition) throw new Error(message);
}

const read = (path) => fs.readFileSync(path, 'utf8');

const legacy = read('src/components/LegacyOptions.tsx');
const explorer = read('src/components/VerbExplorer.tsx');
const page = read('src/app/page.tsx');
const layout = read('src/app/layout.tsx');
const css = read('src/app/globals.css');

expect(legacy.includes('dialect: Dialect'), 'LegacyOptions must receive the active dialect');
expect(legacy.includes('getDialectPresentation'), 'LegacyOptions must use dialect presentation policy');
expect(explorer.includes('data-dialect={dialect}'), 'Explorer root must expose active dialect for theme CSS');
expect(!explorer.includes('corpus-notice'), 'Public starter-corpus notice must be removed');
expect(!page.includes('site-header'), 'Standalone TUN site header must be removed for original layout parity');
expect(explorer.includes('applyLegacyDisplayOptions'), 'Legacy display toggles must affect the main conjugation table');
expect(!explorer.includes('<ExtraForms'), 'Original layout must not render separate extra-form cards');
expect(layout.includes('fonts.googleapis.com'), 'Layout must reference the approved web fonts');
expect(css.includes('[data-dialect="western"]'), 'CSS must include Western dialect theme selector');
expect(css.includes('[data-dialect="eastern"]'), 'CSS must include Eastern dialect theme selector');
expect(css.includes("'Fraunces'"), 'CSS must use Fraunces for display title');
expect(css.includes("'Noto Serif Armenian'"), 'CSS must use Noto Serif Armenian for Armenian text');
expect(css.includes('.keyboard-actions { display: none; }'), 'Original-style keyboard must not show extra action buttons');
expect(css.includes('margin-top: -55px'), 'Tool panel must overlap the hero like the original layout');

console.log('layout parity source assertions passed');
