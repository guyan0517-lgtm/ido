export function hash32(value) {
  let hash = 2166136261;
  const text = String(value);
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function randomFromKey(seed, key) {
  let state = hash32(`${seed}:${key}`) || 0x6d2b79f5;
  state += 0x6d2b79f5;
  let value = state;
  value = Math.imul(value ^ (value >>> 15), value | 1);
  value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
  return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
}

export function pickFromKey(items, seed, key) {
  if (!items.length) return undefined;
  return items[Math.floor(randomFromKey(seed, key) * items.length)];
}

export function weightedPick(entries, seed, key) {
  const total = entries.reduce((sum, entry) => sum + entry.weight, 0);
  if (total <= 0) return undefined;
  let roll = randomFromKey(seed, key) * total;
  for (const entry of entries) {
    roll -= entry.weight;
    if (roll < 0) return entry.value;
  }
  return entries.at(-1)?.value;
}
