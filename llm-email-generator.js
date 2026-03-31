/**
 * LLM Email Generator - Creates pharma marketing HTML email using Azure OpenAI.
 *
 * Takes the same inputs as email-generator.js (design tokens + module data)
 * but uses an LLM to generate the HTML, enabling context-aware styling.
 *
 * Usage: bun run llm-email-generator.js [design-tokens.json] [moduleData.json]
 */

import { generateText, Output } from 'ai';
import { z } from 'zod';
import { model } from './azure.js';
import { EMAIL_GENERATION_SYSTEM_PROMPT, buildEmailGenerationPrompt } from './prompts/email-generation-prompt.js';
import { readFile, writeFile, mkdir } from 'fs/promises';

const EmailOutputSchema = z.object({
  html: z.string().describe('Complete HTML email document starting with <!doctype html>'),
});

/**
 * Generate a pharma HTML email using the LLM.
 * @param {object} tokens - Design tokens (primitiveTokens, semanticTokens, componentTokens)
 * @param {object|object[]} moduleData - Module data (single object or array)
 * @returns {Promise<string>} Complete HTML email string
 */
export async function generateEmailWithLLM(tokens, moduleData) {
  const prompt = buildEmailGenerationPrompt(tokens, moduleData);

  console.log('Sending design tokens + module data to LLM...');
  const startTime = Date.now();

  const { output } = await generateText({
    model,
    output: Output.object({ schema: EmailOutputSchema }),
    system: EMAIL_GENERATION_SYSTEM_PROMPT,
    prompt,
    temperature: 0,
  });

  const duration = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`LLM response received in ${duration}s`);

  if (!output || !output.html) {
    throw new Error('LLM returned empty or invalid output');
  }

  return output.html;
}

// ─── CLI entry ────────────────────────────────────────────────────────────────

async function main() {
  const tokensPath = process.argv[2] || './output/design-tokens.json';
  const moduleDataPath = process.argv[3] || './moduleData.json';

  // Validate env vars
  if (!process.env.AZURE_RESOURCE_NAME || !process.env.AZURE_API_KEY) {
    console.error('Missing AZURE_RESOURCE_NAME or AZURE_API_KEY in environment.');
    process.exit(1);
  }

  const designToken = JSON.parse(await readFile(tokensPath, 'utf-8'));
  const moduleData = JSON.parse(await readFile(moduleDataPath, 'utf-8'));

  const html = await generateEmailWithLLM(designToken, moduleData);

  await mkdir('./output', { recursive: true });
  const outputPath = './output/generated-email-llm.html';
  await writeFile(outputPath, html, 'utf-8');

  const modules = Array.isArray(moduleData) ? moduleData : [moduleData];
  console.log(`\nGenerated email written to: ${outputPath}`);
  console.log(`Product: ${modules[0]?.productName || 'N/A'}`);
  console.log(`Module: ${modules[0]?.moduleName || 'N/A'}`);
}

if (import.meta.main) {
  main().catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
}
