/**
 * LLM-Designed Email Generator - Creates 5 distinct pharma marketing HTML emails
 * where the LLM uses its own frontend design skills to style the email.
 *
 * Unlike cluster-email-generator.js which uses hardcoded design specs,
 * this generator gives the LLM full creative freedom over visual design,
 * constrained only to BRAND_PALETTE colors.
 *
 * Usage: bun run llm-designed-email-generator.js [clusterData.json]
 */

import { generateText, Output } from 'ai';
import { z } from 'zod';
import { model } from './azure.js';
import { LLM_DESIGNED_SYSTEM_PROMPT, buildLlmDesignedClusterPrompt } from './prompts/llm-designed-cluster-prompt.js';
import { readFile, writeFile, mkdir } from 'fs/promises';

const EmailOutputSchema = z.object({
  html: z.string().describe('Complete HTML email document starting with <!doctype html>'),
});

/**
 * Generate a single LLM-designed email version from cluster data.
 * @param {object|object[]} clusterData - Cluster data (single object or array)
 * @param {number} versionNumber - Version 1-5
 * @returns {Promise<string>} Complete HTML email string
 */
export async function generateEmailVersion(clusterData, versionNumber) {
  const prompt = buildLlmDesignedClusterPrompt(clusterData, versionNumber);

  console.log(`\n--- Generating LLM-Designed Version ${versionNumber} ---`);
  const startTime = Date.now();

  const { output } = await generateText({
    model,
    output: Output.object({ schema: EmailOutputSchema }),
    system: LLM_DESIGNED_SYSTEM_PROMPT,
    prompt,
    temperature: 0.7,
  });

  const duration = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`Version ${versionNumber} generated in ${duration}s`);

  if (!output || !output.html) {
    throw new Error(`LLM returned empty or invalid output for version ${versionNumber}`);
  }

  return output.html;
}

/**
 * Generate all 5 LLM-designed email versions sequentially.
 * @param {object|object[]} clusterData - Cluster data
 * @returns {Promise<string[]>} Array of 5 HTML strings
 */
export async function generateAllVersions(clusterData) {
  const results = [];

  for (let i = 1; i <= 5; i++) {
    const html = await generateEmailVersion(clusterData, i);
    results.push(html);
  }

  return results;
}

// ─── CLI entry ────────────────────────────────────────────────────────────────

async function main() {
  const clusterDataPath = process.argv[2] || './clusterData.json';

  if (!process.env.AZURE_RESOURCE_NAME || !process.env.AZURE_API_KEY) {
    console.error('Missing AZURE_RESOURCE_NAME or AZURE_API_KEY in environment.');
    process.exit(1);
  }

  console.log(`Reading cluster data from: ${clusterDataPath}`);
  const clusterData = JSON.parse(await readFile(clusterDataPath, 'utf-8'));

  const clusters = Array.isArray(clusterData) ? clusterData : [clusterData];
  console.log(`Clusters: ${clusters.length}`);
  console.log(`Categories: ${clusters.map(c => c.category).join(', ')}`);
  console.log(`Generating 5 LLM-designed email versions...\n`);

  const totalStart = Date.now();
  const htmlResults = await generateAllVersions(clusterData);

  await mkdir('./output', { recursive: true });

  for (let i = 0; i < htmlResults.length; i++) {
    const outputPath = `./output/llm-designed-email-version-${i + 1}.html`;
    await writeFile(outputPath, htmlResults[i], 'utf-8');
    console.log(`Written: ${outputPath}`);
  }

  const totalDuration = ((Date.now() - totalStart) / 1000).toFixed(1);
  console.log(`\nAll 5 LLM-designed versions generated in ${totalDuration}s`);
  console.log('Design directions:');
  console.log('  1. Clean & Structured');
  console.log('  2. Bold & Editorial');
  console.log('  3. Elegant & Refined');
  console.log('  4. Modern & Card-based');
  console.log('  5. Dynamic & Asymmetric');
}

if (import.meta.main) {
  main().catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
}
