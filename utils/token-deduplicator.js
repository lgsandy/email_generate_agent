/**
 * Token deduplication and normalization utilities.
 */

/**
 * Normalize a CSS property value for comparison
 */
function normalizeValue(value) {
  return value
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/!important/g, '')
    .trim();
}

/**
 * Generate a fingerprint for a style combination
 */
function styleFingerprint(style) {
  const entries = Object.entries(style.cssProperties)
    .filter(([key]) => !key.startsWith('mso-') && key !== 'word-break')
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}:${normalizeValue(v)}`);
  return `${style.element}|${style.semanticRole}|${entries.join(';')}`;
}

/**
 * Deduplicate extracted styles, keeping the first occurrence
 */
export function deduplicateStyles(styles) {
  const seen = new Map();

  for (const style of styles) {
    const fp = styleFingerprint(style);
    if (!seen.has(fp)) {
      seen.set(fp, { ...style });
    }
  }

  return [...seen.values()];
}

/**
 * Merge styles from multiple chunk extractions into a single array
 */
export function mergeChunkExtractions(chunkResults) {
  const allStyles = [];
  for (const chunk of chunkResults) {
    allStyles.push(...chunk);
  }
  return deduplicateStyles(allStyles);
}

/**
 * Named CSS colors mapping (common ones used in emails)
 */
const NAMED_COLORS = {
  black: '#000000', white: '#ffffff', red: '#ff0000', blue: '#0000ff',
  green: '#008000', yellow: '#ffff00', orange: '#ffa500', purple: '#800080',
  gray: '#808080', grey: '#808080', transparent: null,
};

/**
 * Normalize a color value to lowercase 6-digit hex format.
 * Handles: hex (#abc, #aabbcc), rgb(r,g,b), and named CSS colors.
 */
export function normalizeColor(color) {
  let val = color.trim().toLowerCase().replace(/!important/g, '').trim();

  // Named color
  if (NAMED_COLORS[val] !== undefined) {
    return NAMED_COLORS[val];
  }

  // rgb(r, g, b)
  const rgbMatch = val.match(/rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)/);
  if (rgbMatch) {
    const r = Math.min(255, parseInt(rgbMatch[1], 10));
    const g = Math.min(255, parseInt(rgbMatch[2], 10));
    const b = Math.min(255, parseInt(rgbMatch[3], 10));
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }

  // 3-digit hex → 6-digit
  if (val.startsWith('#') && val.length === 4) {
    val = `#${val[1]}${val[1]}${val[2]}${val[2]}${val[3]}${val[3]}`;
  }

  return val;
}
