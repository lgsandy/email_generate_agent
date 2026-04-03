/**
 * Multi-Version Email Generator - Creates 5 distinct pharma marketing HTML emails.
 *
 * Each version has a unique modern design theme with a fixed color palette.
 * Uses moduleData.json as input (no design tokens needed).
 *
 * Usage: bun run multi-version-email-generator.js [moduleData.json]
 */

import { generateText, Output } from 'ai';
import { z } from 'zod';
import { model } from './azure.js';
import { MULTI_VERSION_SYSTEM_PROMPT, VERSION_THEMES, buildMultiVersionPrompt } from './prompts/multi-version-prompt.js';
import { readFile, writeFile, mkdir } from 'fs/promises';

const EmailOutputSchema = z.object({
  html: z.string().describe('Complete HTML email document starting with <!doctype html>'),
});

/**
 * Generate a single email version.
 * @param {object|object[]} moduleData - Module data (single object or array)
 * @param {number} versionNumber - Version 1-5
 * @returns {Promise<string>} Complete HTML email string
 */
export async function generateEmailVersion(moduleData, versionNumber) {
  const theme = VERSION_THEMES[versionNumber - 1];
  const prompt = buildMultiVersionPrompt(moduleData, versionNumber);

  console.log(`\n--- Generating Version ${versionNumber}: ${theme.name} ---`);
  const startTime = Date.now();

  const { output } = await generateText({
    model,
    output: Output.object({ schema: EmailOutputSchema }),
    system: MULTI_VERSION_SYSTEM_PROMPT,
    prompt,
    temperature: 0.3,
  });

  const duration = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`Version ${versionNumber} generated in ${duration}s`);

  if (!output || !output.html) {
    throw new Error(`LLM returned empty or invalid output for version ${versionNumber}`);
  }

  return output.html;
}

/**
 * Generate all 5 email versions sequentially.
 * @param {object|object[]} moduleData - Module data
 * @returns {Promise<string[]>} Array of 5 HTML strings
 */
export async function generateAllVersions(moduleData) {
  const results = [];

  for (let i = 1; i <= 5; i++) {
    const html = await generateEmailVersion(moduleData, i);
    results.push(html);
  }

  return results;
}

// ─── CLI entry ────────────────────────────────────────────────────────────────

async function main() {
  const moduleDataPath = process.argv[2] || './moduleData.json';

  if (!process.env.AZURE_RESOURCE_NAME || !process.env.AZURE_API_KEY) {
    console.error('Missing AZURE_RESOURCE_NAME or AZURE_API_KEY in environment.');
    process.exit(1);
  }

  console.log(`Reading module data from: ${moduleDataPath}`);
  const moduleData = JSON.parse(await readFile(moduleDataPath, 'utf-8'));

  const modules = Array.isArray(moduleData) ? moduleData : [moduleData];
  console.log(`Product: ${modules[0]?.productName || 'N/A'}`);
  console.log(`Modules: ${modules.length}`);
  console.log(`Generating 5 email versions...\n`);

  const totalStart = Date.now();
  const htmlResults = await generateAllVersions(moduleData);

  await mkdir('./output', { recursive: true });

  for (let i = 0; i < htmlResults.length; i++) {
    const outputPath = `./output/email-version-${i + 1}.html`;
    await writeFile(outputPath, htmlResults[i], 'utf-8');
    console.log(`Written: ${outputPath}`);
  }

  const totalDuration = ((Date.now() - totalStart) / 1000).toFixed(1);
  console.log(`\nAll 5 versions generated in ${totalDuration}s`);
  console.log('Themes:');
  VERSION_THEMES.forEach(t => console.log(`  ${t.versionNumber}. ${t.name}`));
}

if (import.meta.main) {
  main().catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
}
