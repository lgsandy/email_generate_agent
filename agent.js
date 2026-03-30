/**
 * Agent - orchestrates the multi-pass design token extraction pipeline.
 *
 * Pipeline:
 * 1. Preprocess HTML (strip MSO, chunk, build ground-truth inventory)
 * 2. Pass 1: Extract raw styles per chunk group via LLM
 * 3. Merge and deduplicate extracted styles
 * 4. Pass 2: Classify into semantic design tokens via LLM
 * 5. Validate against ground-truth inventory
 */

import { preprocessEmail } from './extractors/html-preprocessor.js';
import { extractAllStyles } from './extractors/style-extractor.js';
import { classifyTokens } from './extractors/semantic-classifier.js';
import { validateTokens, printValidationReport } from './extractors/token-assembler.js';
import { mergeChunkExtractions } from './utils/token-deduplicator.js';

/**
 * Main extraction pipeline.
 * Takes raw HTML and returns validated design tokens.
 */
export async function extractDesignTokens(html, sourceFilename = 'email.html') {
  console.log(`\nStarting design token extraction for: ${sourceFilename}`);
  console.log('='.repeat(60));

  // Step 1: Preprocess
  console.log('\nStep 1: Preprocessing HTML...');
  const preprocessed = preprocessEmail(html);

  // Step 2: Pass 1 - Extract raw styles per chunk group
  console.log('\nStep 2: LLM Pass 1 - Extracting raw styles...');
  const chunkResults = await extractAllStyles(preprocessed.groups);

  // Step 3: Merge and deduplicate
  console.log('Step 3: Merging and deduplicating styles...');
  const mergedStyles = mergeChunkExtractions(chunkResults);
  console.log(`Merged: ${mergedStyles.length} unique styled elements\n`);

  // Step 4: Pass 2 - Semantic classification
  console.log('Step 4: LLM Pass 2 - Semantic classification...');
  const tokens = await classifyTokens(
    mergedStyles,
    preprocessed.styleInventory,
    sourceFilename
  );

  if (!tokens) {
    console.error('Pass 2 returned no valid tokens. Check LLM output.');
    return { tokens: null, validation: { colorValidation: {}, sectionCoverage: {}, warnings: ['LLM returned no valid JSON'] } };
  }

  // Step 5: Validate
  console.log('Step 5: Validating against ground truth...');
  const validation = validateTokens(tokens, preprocessed.styleInventory);
  printValidationReport(validation);

  console.log('\n' + '='.repeat(60));
  console.log('Extraction complete!');

  return { tokens, validation };
}
