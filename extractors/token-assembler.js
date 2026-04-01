/**
 * Token Assembler - cross-validates LLM output against ground truth.
 */

import { generateValidationReport } from '../utils/style-parser.js';
import { normalizeColor } from '../utils/token-deduplicator.js';

/**
 * Extract all color values from the design token output.
 * Supports both schema shapes: direct (primitiveTokens.*) and tiered (tier1.primitives.*)
 */
function extractOutputColors(tokens) {
  if (!tokens || typeof tokens !== "object") return [];

  const colors = [];

  // Primitive colors — try both paths
  const primitiveColors = tokens?.primitiveTokens?.colors
    || tokens?.tier1?.primitives?.colors;

  if (Array.isArray(primitiveColors)) {
    primitiveColors.forEach((c) => {
      if (c?.value) colors.push(c.value);
    });
  } else if (primitiveColors && typeof primitiveColors === "object") {
    Object.values(primitiveColors).forEach((c) => {
      if (c?.value) colors.push(c.value);
    });
  }

  // Semantic colors — try both paths
  const semanticColors = tokens?.semanticTokens?.colors
    || tokens?.tier2?.semantic?.colors;

  if (semanticColors && typeof semanticColors === "object") {
    Object.values(semanticColors).forEach((val) => {
      if (typeof val === "string") {
        colors.push(val);
      } else if (val?.value) {
        colors.push(val.value);
      }
    });
  }

  // Also extract colors from componentTokens (CTA, claims, reference, footer, etc.)
  const components = tokens?.componentTokens || tokens?.tier3?.components || {};
  function collectComponentColors(obj) {
    if (!obj || typeof obj !== 'object') return;
    for (const [key, val] of Object.entries(obj)) {
      if (typeof val === 'string' && (key.toLowerCase().includes('color') || key.toLowerCase().includes('background'))) {
        if (val.startsWith('#') || val.startsWith('rgb')) colors.push(val);
      } else if (Array.isArray(val)) {
        val.forEach(item => collectComponentColors(item));
      } else if (typeof val === 'object') {
        collectComponentColors(val);
      }
    }
  }
  collectComponentColors(components);

  // Normalize + dedupe
  return [...new Set(colors.map(c => normalizeColor(c)).filter(Boolean))];
}

/**
 * Validate the extracted design tokens against ground-truth inventory
 */
export function validateTokens(tokens, inventory) {
  const warnings = [];

  // Color validation
  const outputColors = extractOutputColors(tokens);
  const colorReport = generateValidationReport(outputColors, inventory);

  const colorValidation = {
    matched: colorReport.matched,
    unmatched: colorReport.unmatched,
    missingFromOutput: colorReport.missing,
    totalInHtml: inventory.allColors.size,
    totalInOutput: outputColors.length,
    matchPercentage: Math.round((colorReport.matched / outputColors.length) * 100) || 0,
  };

  if (colorReport.unmatched.length > 0) {
    warnings.push(`${colorReport.unmatched.length} colors in output not found in HTML: ${colorReport.unmatched.join(', ')}`);
  }
  if (colorReport.missing.length > 0) {
    warnings.push(`${colorReport.missing.length} colors in HTML missing from output: ${colorReport.missing.join(', ')}`);
  }

  // Section coverage — handle both schema shape (componentTokens.*) and LLM shape (tier3.components.*)
  const components = tokens?.componentTokens || tokens?.tier3?.components || tokens?.tier3 || {};

  function has(obj, key) {
    if (!obj || typeof obj !== 'object') return false;
    const val = obj[key];
    if (!val) return false;
    if (Array.isArray(val)) return val.length > 0;
    if (typeof val === 'object') return Object.keys(val).length > 0;
    return !!val;
  }

  const sectionCoverage = {
    hasPreheader: has(components, 'preheader') || !!components?.preheader?.backgroundColor,
    hasCtaButton: has(components, 'ctaButton') || !!components?.ctaButton?.background,
    hasClaimBlocks: Array.isArray(components?.claimBlocks) ? components.claimBlocks.length > 0 : has(components, 'claimBlocks'),
    hasIsiBlock: has(components, 'isiBlock') || !!components?.isiBlock?.backgroundColor,
    hasAdverseEventBlock: has(components, 'adverseEventBlock') || !!components?.adverseEventBlock?.containerBorder,
    hasReferenceBlock: has(components, 'referenceBlock') || !!components?.referenceBlock?.backgroundColor,
    hasFooter: has(components, 'footer') || !!components?.footer?.backgroundColor,
    hasSectionCallouts: Array.isArray(components?.sectionCallouts) ? components.sectionCallouts.length > 0 : has(components, 'sectionCallouts'),
    missingExpected: [],
  };

  const expectedSections = [
    ['hasPreheader', 'Preheader'],
    ['hasCtaButton', 'CTA Button'],
    ['hasClaimBlocks', 'Claim Blocks'],
    ['hasIsiBlock', 'ISI Block'],
    ['hasAdverseEventBlock', 'Adverse Event Block'],
    ['hasReferenceBlock', 'Reference Block'],
    ['hasFooter', 'Footer'],
  ];

  for (const [key, name] of expectedSections) {
    if (!sectionCoverage[key]) {
      sectionCoverage.missingExpected.push(name);
      warnings.push(`Missing expected section: ${name}`);
    }
  }

  return { colorValidation, sectionCoverage, warnings };
}

/**
 * Print a human-readable validation report
 */
export function printValidationReport(result) {
  console.log('=== Validation Report ===\n');

  console.log('Color Validation:');
  console.log(`  Colors in HTML: ${result.colorValidation.totalInHtml}`);
  console.log(`  Colors in output: ${result.colorValidation.totalInOutput}`);
  console.log(`  Matched: ${result.colorValidation.matched} (${result.colorValidation.matchPercentage}%)`);
  if (result.colorValidation.unmatched.length > 0) {
    console.log(`  Unmatched (in output but not HTML): ${result.colorValidation.unmatched.join(', ')}`);
  }
  if (result.colorValidation.missingFromOutput.length > 0) {
    console.log(`  Missing (in HTML but not output): ${result.colorValidation.missingFromOutput.join(', ')}`);
  }

  console.log('\nSection Coverage:');
  console.log(`  Preheader: ${result.sectionCoverage.hasPreheader ? 'YES' : 'MISSING'}`);
  console.log(`  CTA Button: ${result.sectionCoverage.hasCtaButton ? 'YES' : 'MISSING'}`);
  console.log(`  Claim Blocks: ${result.sectionCoverage.hasClaimBlocks ? 'YES' : 'MISSING'}`);
  console.log(`  ISI Block: ${result.sectionCoverage.hasIsiBlock ? 'YES' : 'MISSING'}`);
  console.log(`  Adverse Event: ${result.sectionCoverage.hasAdverseEventBlock ? 'YES' : 'MISSING'}`);
  console.log(`  Reference Block: ${result.sectionCoverage.hasReferenceBlock ? 'YES' : 'MISSING'}`);
  console.log(`  Footer: ${result.sectionCoverage.hasFooter ? 'YES' : 'MISSING'}`);
  console.log(`  Section Callouts: ${result.sectionCoverage.hasSectionCallouts ? 'YES' : 'MISSING'}`);

  if (result.warnings.length > 0) {
    console.log('\nWarnings:');
    for (const w of result.warnings) {
      console.log(`  - ${w}`);
    }
  }

  console.log('\n=========================');
}
