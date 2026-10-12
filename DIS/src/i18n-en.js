import { EN_NAMES } from './i18n-en-names.js';
import { EN_DESCRIPTIONS } from './i18n-en-descriptions.js';
import { EN_MAILS } from './i18n-en-mails.js';
import { EN_UI } from './i18n-en-ui.js';

const blueprintNames = EN_NAMES.filter(([name]) => !name.includes('{')).map(([name, english]) => [`${name}蓝图`, `${english} Blueprint`]);
const entries = [...EN_NAMES, ...blueprintNames, ...EN_DESCRIPTIONS, ...EN_MAILS, ...EN_UI];
// A sentence can be followed by another UI fragment in the same text node.
// Keep a punctuation-free form so sentence splitting still finds its complete translation.
const sentences = entries.filter(([source]) => /[。！？]$/.test(source))
  .map(([source, english]) => [source.slice(0, -1), english.replace(/[.!?]$/, '')]);
export const EN_ENTRIES = [...sentences, ...entries];
