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
 * Normalize a hex color to lowercase 6-digit format
 */
export function normalizeColor(color) {
  let hex = color.trim().toLowerCase();
  if (hex.startsWith('#') && hex.length === 4) {
    hex = `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`;
  }
  return hex;
}
