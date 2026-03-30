/**
 * CLI entry point for pharma email design token extraction.
 *
 * Usage: bun run index.js [path-to-email.html]
 * Output: ./output/design-tokens.json
 */

import { readFile, writeFile, mkdir } from 'fs/promises';
import { basename } from 'path';
import { extractDesignTokens } from './agent.js';

async function main() {
  const htmlPath = process.argv[2] || './ModCon TRO Emailer.html';

  // Validate env vars
  if (!process.env.AZURE_RESOURCE_NAME || !process.env.AZURE_API_KEY) {
    console.error('Missing required environment variables:');
    console.error('  AZURE_RESOURCE_NAME - Your Azure OpenAI resource name');
    console.error('  AZURE_API_KEY       - Your Azure OpenAI API key');
    console.error('  AZURE_DEPLOYMENT_NAME (optional) - Deployment name (defaults to "gpt-4o")');
    console.error('\nSet them in a .env file or export them in your shell.');
    process.exit(1);
  }

  // Read HTML file
  let html;
  try {
    html = await readFile(htmlPath, 'utf-8');
    console.log(`Read ${html.length} characters from ${htmlPath}`);
  } catch (err) {
    console.error(`Failed to read file: ${htmlPath}`);
    console.error(err);
    process.exit(1);
  }

  const filename = basename(htmlPath);

  // Run extraction pipeline
  const startTime = Date.now();
  const { tokens, validation } = await extractDesignTokens(html, filename);
  const duration = ((Date.now() - startTime) / 1000).toFixed(1);

  // Ensure output directory exists
  await mkdir('./output', { recursive: true });

  // Write design tokens JSON
  const outputPath = './output/design-tokens.json';
  await writeFile(outputPath, JSON.stringify(tokens, null, 2), 'utf-8');
  console.log(`\nDesign tokens written to: ${outputPath}`);

  // Write validation report
  const reportPath = './output/validation-report.json';
  await writeFile(reportPath, JSON.stringify(validation, null, 2), 'utf-8');
  console.log(`Validation report written to: ${reportPath}`);

  // Summary
  console.log('\nSummary:');
  const meta = tokens?.metadata || {};
  const primitives = tokens?.primitiveTokens || tokens?.tier1?.primitives || {};
  const components = tokens?.componentTokens || tokens?.tier3?.components || tokens?.tier3 || {};

  console.log(`  Brand: ${meta.brand || 'N/A'}`);
  console.log(`  Email type: ${meta.emailType || meta.email_type || 'N/A'}`);
  console.log(`  Approval code: ${meta.approvalCode || meta.approval_code || 'N/A'}`);
  console.log(`  Primitive colors: ${Array.isArray(primitives.colors) ? primitives.colors.length : Object.keys(primitives.colors || {}).length}`);
  console.log(`  Typography styles: ${Array.isArray(primitives.typography) ? primitives.typography.length : Object.keys(primitives.typography || {}).length}`);
  console.log(`  Color match: ${validation.colorValidation?.matchPercentage || 0}%`);
  console.log(`  Warnings: ${validation.warnings?.length || 0}`);
  console.log(`  Duration: ${duration}s`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
