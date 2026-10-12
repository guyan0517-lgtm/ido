import { EN_ENTRIES } from './i18n-en.js';
import { scopeStorageKey } from './storage-scope.js';

export const LANGUAGE_KEY = scopeStorageKey('dropped-into-survival-language');
const isLanguage = value => value === 'zh' || value === 'en';
let preference = null;
try { preference = globalThis.localStorage?.getItem(LANGUAGE_KEY); } catch { /* Private browsing can disallow storage. */ }
let language = isLanguage(preference) ? preference : 'zh';
let chosen = isLanguage(preference);
export const getLanguage = () => language;
export const hasLanguagePreference = () => chosen;
export function setLanguage(value) {
  if (!isLanguage(value)) return false;
  language = value;
  chosen = true;
  try { globalThis.localStorage?.setItem(LANGUAGE_KEY, value); } catch { /* Keep the choice for this session. */ }
  return true;
}

const HAN = /[\u3400-\u9fff]/u;
const escapeRegExp = text => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const exact = new Map();
const patterns = [];
for (const [source, english] of EN_ENTRIES) {
  if (!/\{\d+\}/.test(source)) { exact.set(source, english); continue; }
  const keys = [];
  const pieces = source.split(/(\{\d+\})/);
  const expression = pieces.map((piece, index) => {
    if (/^\{\d+\}$/.test(piece)) {
      keys.push(piece);
      // Quantity placeholders must not consume a whole sentence that happens to end in a unit.
      const numeric = /^(?:%|℃|份|点|次|级|格|个夜晚|个浇水日|日|天|\/)/u.test(pieces[index+1] ?? '');
      return numeric ? '([\\d.+−–~到/%-]+)' : '(.*?)';
    }
    return escapeRegExp(piece).replace(/\s+/g, '\\s+');
  }).join('');
  patterns.push({ regex: new RegExp(`^${expression}$`, 'su'), keys, english,
    weight: source.replace(/\{\d+\}/g, '').length });
}
patterns.sort((a,b) => b.weight - a.weight);
const phraseKeys = [...exact.keys()].filter(key => HAN.test(key)).sort((a,b) => b.length-a.length);
const phraseRegex = new RegExp(phraseKeys.map(escapeRegExp).join('|'), 'gu');
const translated = new Map();
const unresolved = new Set();
export const getUntranslatedTexts = () => [...unresolved];
export const clearUntranslatedTexts = () => unresolved.clear();
const punctuation = text => text.replaceAll('。', '. ').replaceAll('！', '! ').replaceAll('？', '? ')
  .replaceAll('；', '; ').replaceAll('、', ', ').replaceAll('，', ', ').replaceAll('：', ': ')
  .replaceAll('（', ' (').replaceAll('）', ')').replaceAll('℃', '°C').replaceAll('～', ' to ');
const formatEnglish = text => punctuation(text)
  .replace(/\b(\d+(?:\.\d+)?)\s+(slots|Letters)\b/g, (match, count, noun) =>
    Number(count) === 1 ? `${count} ${noun.slice(0, -1)}` : match)
  .replace(/(?<=\S)\s*×\s*(?=\d)/gu, ' ×')
  .replace(/·(?=(?:Head|Torso|Legs|Feet|Hands)\b)/g, ' — ');

function translate(text, depth = 0) {
  if (!HAN.test(text)) return punctuation(text);
  if (exact.has(text)) return exact.get(text);
  if (translated.has(text)) return translated.get(text);
  const trimmed = text.trim();
  if (trimmed !== text) return text.slice(0, text.indexOf(trimmed)) + translate(trimmed, depth) + text.slice(text.indexOf(trimmed) + trimmed.length);
  if (depth < 15) {
    for (const pattern of patterns) {
      const match = pattern.regex.exec(text);
      if (!match) continue;
      const values = new Map(pattern.keys.map((key, index) => [key, translate(match[index+1], depth+1)]));
      const result = pattern.english.replace(/\{\d+\}/g, key => values.get(key) ?? key);
      // A broad prefix pattern must not take priority over a complete item name or a more specific sentence.
      if (!HAN.test(result)) { translated.set(text, result); return result; }
    }
    // Translate the complete name before its quantity. Otherwise suffixes such
    // as 种子 are replaced separately and produce "CarrotSeeds" in trade labels.
    const quantities = text.split(/(×\s*[\d.]+)/u);
    if (quantities.length > 1) {
      const result = punctuation(quantities.map(part => translate(part, depth+1)).join(''));
      if (!HAN.test(result)) { translated.set(text, result); return result; }
    }
    const phrases = text.replace(phraseRegex, source => exact.get(source));
    if (!HAN.test(phrases)) { const result = punctuation(phrases); translated.set(text, result); return result; }
    // Lists, names with equipment slots, quantities and independently rendered sentences.
    for (const separator of [/([\n]|\s+·\s*)/u, /([。！？])/u, /([；])/u, /([、：]|\s*[＋／]\s*|×\s*[\d.]+|[（()）])/u]) {
      const parts = text.split(separator);
      if (parts.length > 1) {
        const result = punctuation(parts.map(part => translate(part, depth+1)).join(''));
        if (!HAN.test(result)) { translated.set(text, result); return result; }
      }
    }
  }
  // Covers compact labels such as a material name followed by its numeric cost.
  return text.replace(phraseRegex, source => exact.get(source));
}

export function t(value) {
  const source = String(value ?? '');
  if (language !== 'en') return source;
  if (!HAN.test(source)) return formatEnglish(source);
  const result = translate(source);
  if (HAN.test(result)) unresolved.add(source);
  return formatEnglish(result);
}

const textSources = new WeakMap();
const attributeSources = new WeakMap();
const attributes = ['aria-label', 'title', 'placeholder', 'alt'];
function localizeNode(node) {
  if (node.nodeType === 3) {
    const current = node.nodeValue;
    const saved = textSources.get(node);
    const source = saved && current === saved.result ? saved.source : current;
    let result = t(source);
    if (language === 'en' && node.parentNode?.getAttribute?.('data-i18n-unit') === 'celsius'
      && /^[+−-]?\d+(?:\.\d+)?$/.test(result.trim())) result += '°C';
    if (result !== current) node.nodeValue = result;
    textSources.set(node, { source, result });
    return;
  }
  if (node.nodeType !== 1 && node.nodeType !== 9 && node.nodeType !== 11) return;
  if (node.nodeType === 1) {
    if (['SCRIPT', 'STYLE', 'TEXTAREA'].includes(node.tagName) || node.getAttribute('translate') === 'no') return;
    const saved = attributeSources.get(node) ?? new Map();
    for (const name of attributes) {
      if (!node.hasAttribute(name)) continue;
      const current = node.getAttribute(name);
      const entry = saved.get(name);
      const source = entry && current === entry.result ? entry.source : current;
      const result = t(source);
      if (result !== current) node.setAttribute(name, result);
      saved.set(name, { source, result });
    }
    attributeSources.set(node, saved);
  }
  for (const child of node.childNodes) localizeNode(child);
}

export function localizePage(root = globalThis.document) {
  if (!root) return;
  if (root.nodeType === 1 && root.closest?.('[translate="no"]')) return;
  localizeNode(root);
  const document = root.nodeType === 9 ? root : root.ownerDocument;
  if (document?.documentElement) document.documentElement.lang = language === 'en' ? 'en' : 'zh-CN';
}
