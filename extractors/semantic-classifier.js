/**
 * Pass 2: Semantic classification.
 * Takes merged raw styles and classifies them into the full DesignTokenOutput schema.
 */

import { generateText, Output } from 'ai';
import { model } from '../azure.js';
import { SYSTEM_PROMPT } from '../prompts/system-prompt.js';
import { buildClassificationPrompt } from '../prompts/classification-prompt.js';
import { DesignTokenOutput } from '../schemas/index.js';

/**
 * Run Pass 2: classify merged styles into the full design token hierarchy
 */
export async function classifyTokens(mergedStyles, inventory, sourceFilename) {
  console.log('Pass 2: Classifying into semantic design tokens...');

  const prompt = buildClassificationPrompt(mergedStyles, inventory, sourceFilename);

  const { output } = await generateText({
    model,
    output: Output.object({
      schema: DesignTokenOutput,
    }),
    system: SYSTEM_PROMPT,
    prompt,
    temperature: 0,
  });

  console.log('Pass 2 complete: Design tokens classified\n');
  return output;
}