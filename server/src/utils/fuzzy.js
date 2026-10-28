// Small typo-tolerant search for the (small) collections an admin or shopper searches.
// "speeker" finds "Speaker", "led par" finds "LED Par Light", "mic" matches "Microphone".

const words = (s) =>
  String(s ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .split(/[^a-z0-9]+/)
    .filter(Boolean);

// Edit distance where swapping two neighbouring letters ("chiar") counts as one typo
function distance(a, b, max) {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 0; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
    }
  }
  return d[a.length][b.length];
}

const allowedTypos = (len) => (len <= 3 ? 0 : len <= 7 ? 1 : 2);

// How well one query word matches one word of the text (0 = not at all, 1 = exact)
function wordScore(token, word) {
  if (token === word) return 1;
  if (word.startsWith(token)) return 0.9;
  if (token.length >= 3 && word.includes(token)) return 0.7;
  const max = allowedTypos(token.length);
  if (!max) return 0;
  // Compare against the word's start too, so a half-typed, misspelled word still matches
  const d = Math.min(distance(token, word, max), distance(token, word.slice(0, token.length), max));
  return d <= max ? 0.6 - d * 0.1 : 0;
}

// Score of `query` against a list of text fields; 0 means "not a match".
// Every word of the query has to match something, so "led par" needs both.
export function fuzzyScore(query, fields) {
  const tokens = words(query);
  if (tokens.length === 0) return 1;
  const pool = fields.flatMap(words);
  let total = 0;
  for (const token of tokens) {
    const best = Math.max(0, ...pool.map((w) => wordScore(token, w)));
    if (best === 0) return 0;
    total += best;
  }
  return total / tokens.length;
}

// Keeps the matching items, best match first (stable for equal scores)
export function fuzzyFilter(items, query, getFields) {
  if (!words(query).length) return items;
  return items
    .map((item, index) => ({ item, index, score: fuzzyScore(query, getFields(item)) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map((r) => r.item);
}
