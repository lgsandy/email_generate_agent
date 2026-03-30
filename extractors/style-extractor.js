/**
 * Pass 1: Per-chunk LLM style extraction.
 * Sends each chunk group to the LLM and extracts raw styled elements.
 */

import { generateText, Output } from 'ai';
import { z } from 'zod';
import { model } from '../azure.js';
import { SYSTEM_PROMPT } from '../prompts/system-prompt.js';
import { buildExtractionPrompt } from '../prompts/extraction-prompt.js';

/** Schema for a single extracted element from Pass 1 */
const ExtractedElementSchema = z.object({
  element: z.string().describe('HTML element type: div, td, a, span, img, table'),
  cssProperties: z.array(z.object({
    property: z.string().describe('CSS property name'),
    value: z.string().describe('CSS property value'),
  })).describe('All CSS properties from the style attribute'),
  textContent: z.string().describe('First 100 chars of visible text content'),
  semanticRole: z.string().describe('Pharma email semantic role classification'),
  approved: z.boolean().describe('Has approved="true" attribute'),
  hasCitations: z.boolean().describe('Contains <sup> citation references'),
});

/**
 * Extract styles from a single chunk group via LLM
 */
async function extractFromGroup(group) {
  const prompt = buildExtractionPrompt(group);

  console.log(`  Extracting styles from "${group.name}" (${group.chunks.length} sections)...`);

  const { output } = await generateText({
    model,
    output: Output.array({
      element: ExtractedElementSchema,
    }),
    system: SYSTEM_PROMPT,
    prompt,
    temperature: 0,
  });
  return output.map((el) => ({
    element: el.element,
    cssProperties: Object.fromEntries(el.cssProperties.map(p => [p.property, p.value])),
    textContent: el.textContent,
    semanticRole: el.semanticRole,
    approved: el.approved,
    hasCitations: el.hasCitations,
    sectionId: group.name,
  }));
}

/**
 * Run Pass 1 extraction across all chunk groups.
 * Groups are processed in parallel for speed.
 */
export async function extractAllStyles(groups) {
  console.log(`\nPass 1: Extracting styles from ${groups.length} groups...`);

  const results = await Promise.all(
    groups.map((group) => extractFromGroup(group))
  );

  const totalElements = results.reduce((sum, r) => sum + r.length, 0);
  console.log(`Pass 1 complete: ${totalElements} elements extracted across ${groups.length} groups\n`);

  return results;
}
