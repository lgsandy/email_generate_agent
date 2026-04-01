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
 * Extract all colors (hex, rgb, named) from a CSS value string
 */
function extractColors(value) {
  const colors = [];

  // Hex colors
  const hexMatches = value.match(/#[0-9a-fA-F]{3,8}\b/g);
  if (hexMatches) colors.push(...hexMatches);

  // RGB colors
  const rgbRegex = /rgb\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*\)/gi;
  const rgbMatches = value.match(rgbRegex);
  if (rgbMatches) colors.push(...rgbMatches);

  return colors;
}

/**
 * Extract CSS declarations from <style> blocks in the HTML
 */
function extractStyleBlockDeclarations(html) {
  const styleBlockRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
  const declarations = [];
  let match;

  while ((match = styleBlockRegex.exec(html)) !== null) {
    const cssContent = match[1];
    // Extract property declarations from CSS rules (skip @media, selectors, etc.)
    const ruleRegex = /\{([^}]+)\}/g;
    let ruleMatch;
    while ((ruleMatch = ruleRegex.exec(cssContent)) !== null) {
      declarations.push(ruleMatch[1].trim());
    }
  }

  return declarations;
}

/**
 * Check if a CSS value is valid (not containing undefined/null placeholder values)
 */
function isValidCssValue(value) {
  return value && !value.includes('undefined') && !value.includes('null');
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
    if (isValidCssValue(color)) {
      inventory.allColors.add(color);
      inventory.allBackgroundColors.add(color);
    }
  }

  // Extract styles from <style> blocks as well (class-based styles)
  const styleBlockDeclarations = extractStyleBlockDeclarations(html);
  const allStyleStrings = [...rawStyles, ...styleBlockDeclarations];

  for (const raw of allStyleStrings) {
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
      if (!isValidCssValue(value)) continue;
      for (const color of extractColors(value)) {
        inventory.allColors.add(color.toLowerCase());
      }
    }

    // Collect specific property values (skip undefined/invalid values)
    if (properties['font-size'] && isValidCssValue(properties['font-size'])) {
      inventory.allFontSizes.add(properties['font-size']);
    }
    if (properties['font-family'] && isValidCssValue(properties['font-family'])) {
      inventory.allFontFamilies.add(properties['font-family']);
    }
    if (properties['font-weight'] && isValidCssValue(properties['font-weight'])) {
      inventory.allFontWeights.add(properties['font-weight']);
    }
    if (properties['line-height'] && isValidCssValue(properties['line-height'])) {
      inventory.allLineHeights.add(properties['line-height']);
    }
    if (properties['background-color'] && isValidCssValue(properties['background-color'])) {
      inventory.allBackgroundColors.add(properties['background-color'].toLowerCase());
    }
    if (properties['background'] && isValidCssValue(properties['background'])) {
      for (const color of extractColors(properties['background'])) {
        inventory.allBackgroundColors.add(color.toLowerCase());
      }
    }

    // Collect padding and border values
    for (const [key, value] of Object.entries(properties)) {
      if (!isValidCssValue(value)) continue;
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
