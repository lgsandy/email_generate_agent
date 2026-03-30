/**
 * HTML Preprocessor - orchestrates MSO stripping, style extraction,
 * chunking, and ground-truth style inventory building.
 */

import {
  stripMsoComments,
  extractStyleBlocks,
  compactWhitespace,
  splitIntoSections,
  groupChunks,
} from '../utils/html-chunker.js';
import { buildStyleInventory } from '../utils/style-parser.js';

/**
 * Full preprocessing pipeline for pharma email HTML
 */
export function preprocessEmail(html) {
  const originalLength = html.length;

  // Step 1: Build ground-truth inventory from original HTML (before any stripping)
  const styleInventory = buildStyleInventory(html);

  // Step 2: Extract <style> blocks
  const { styles: styleBlocks, htmlWithoutStyles } = extractStyleBlocks(html);

  // Step 3: Strip MSO/Outlook conditional comments
  const stripped = stripMsoComments(htmlWithoutStyles);

  // Step 4: Compact whitespace
  const cleanedHtml = compactWhitespace(stripped);

  // Step 5: Split into section-based chunks
  const chunks = splitIntoSections(cleanedHtml);

  // Step 6: Group chunks by semantic role
  const groups = groupChunks(chunks);

  console.log(`Preprocessed: ${originalLength} -> ${cleanedHtml.length} chars (${Math.round((1 - cleanedHtml.length / originalLength) * 100)}% reduction)`);
  console.log(`Found ${chunks.length} sections in ${groups.length} groups`);
  console.log(`Ground truth: ${styleInventory.allColors.size} colors, ${styleInventory.allFontSizes.size} font sizes, ${styleInventory.uniqueStyleCombinations.length} unique style combos`);

  return {
    originalLength,
    cleanedLength: cleanedHtml.length,
    styleBlocks,
    chunks,
    groups,
    styleInventory,
    cleanedHtml,
  };
}
