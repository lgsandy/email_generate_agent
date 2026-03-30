/**
 * Regex-based inline style parser for ground-truth extraction.
 * Parses all style="" attributes from HTML to build a validation inventory.
 */

/**
 * Extract all inline style="" attribute values from HTML
 */
export function extractInlineStyles(html) {
  const styleRegex = /style="([^"]*?)"/g;
  const styles = [];
  let match;

  while ((match = styleRegex.exec(html)) !== null) {
    const style = match[1].trim();
    if (style) {
      styles.push(style);
    }
  }

  return styles;
}

/**
 * Parse a CSS style string into key-value pairs
 */
export function parseStyleString(style) {
  const properties = {};
  const declarations = style.split(';');

  for (const decl of declarations) {
    const trimmed = decl.trim();
    if (!trimmed) continue;

    const colonIndex = trimmed.indexOf(':');
    if (colonIndex === -1) continue;

    const prop = trimmed.slice(0, colonIndex).trim().toLowerCase();
    const value = trimmed.slice(colonIndex + 1).trim().replace(/!important/gi, '').trim();

    if (prop && value) {
      properties[prop] = value;
    }
  }

  return properties;
}

/**
 * Extract all hex colors from a string
 */
function extractColors(value) {
  const colorRegex = /#[0-9a-fA-F]{3,8}\b/g;
  return value.match(colorRegex) || [];
}

/**
 * Build a complete style inventory from HTML for ground-truth validation
 */
export function buildStyleInventory(html) {
  const rawStyles = extractInlineStyles(html);
  const seen = new Set();
  const uniqueStyleCombinations = [];

  const inventory = {
    allColors: new Set(),
    allFontSizes: new Set(),
    allFontFamilies: new Set(),
    allFontWeights: new Set(),
    allLineHeights: new Set(),
    allPaddings: new Set(),
    allBorders: new Set(),
    allBackgroundColors: new Set(),
    uniqueStyleCombinations: [],
  };

  // Also extract bgcolor attributes
  const bgcolorRegex = /bgcolor="([^"]+)"/g;
  let bgMatch;
  while ((bgMatch = bgcolorRegex.exec(html)) !== null) {
    const color = bgMatch[1].trim().toLowerCase();
    inventory.allColors.add(color);
    inventory.allBackgroundColors.add(color);
  }

  for (const raw of rawStyles) {
    const properties = parseStyleString(raw);

    // Deduplicate by normalized key-value
    const normalized = Object.entries(properties)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}:${v}`)
      .join(';');

    if (!seen.has(normalized)) {
      seen.add(normalized);
      uniqueStyleCombinations.push({ properties, raw });
    }

    // Collect colors from all properties
    for (const value of Object.values(properties)) {
      for (const color of extractColors(value)) {
        inventory.allColors.add(color.toLowerCase());
      }
    }

    // Collect specific property values
    if (properties['font-size']) inventory.allFontSizes.add(properties['font-size']);
    if (properties['font-family']) inventory.allFontFamilies.add(properties['font-family']);
    if (properties['font-weight']) inventory.allFontWeights.add(properties['font-weight']);
    if (properties['line-height']) inventory.allLineHeights.add(properties['line-height']);
    if (properties['background-color']) {
      inventory.allBackgroundColors.add(properties['background-color'].toLowerCase());
    }
    if (properties['background']) {
      for (const color of extractColors(properties['background'])) {
        inventory.allBackgroundColors.add(color.toLowerCase());
      }
    }

    // Collect padding values
    for (const [key, value] of Object.entries(properties)) {
      if (key.startsWith('padding')) {
        inventory.allPaddings.add(`${key}: ${value}`);
      }
      if (key.startsWith('border') && !key.includes('collapse') && !key.includes('spacing')) {
        inventory.allBorders.add(`${key}: ${value}`);
      }
    }
  }

  inventory.uniqueStyleCombinations = uniqueStyleCombinations;
  return inventory;
}

/**
 * Validate that a color value exists in the ground-truth inventory
 */
export function validateColor(color, inventory) {
  return inventory.allColors.has(color.toLowerCase());
}

/**
 * Generate a validation report comparing LLM output against ground truth
 */
export function generateValidationReport(extractedColors, inventory) {
  const matched = [];
  const unmatched = [];

  for (const color of extractedColors) {
    if (validateColor(color, inventory)) {
      matched.push(color);
    } else {
      unmatched.push(color);
    }
  }

  const extractedSet = new Set(extractedColors.map(c => c.toLowerCase()));
  const missing = [...inventory.allColors].filter(c => !extractedSet.has(c));

  return {
    matched: matched.length,
    unmatched,
    missing,
  };
}
