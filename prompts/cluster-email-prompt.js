/**
 * Prompts for cluster-based pharma email generation.
 * Uses clusterData.json as input with different content placement rules.
 * 5 distinct LAYOUT designs, all using the same Biktarvy brand color scheme.
 */

import { BRAND_PALETTE, VERSION_THEMES } from './multi-version-prompt.js';

export { VERSION_THEMES, BRAND_PALETTE };

export const CLUSTER_EMAIL_SYSTEM_PROMPT = `You are a pharmaceutical HCP marketing email HTML generator. You produce polished, email-client-compatible HTML emails.

## HTML Constraints
- TABLE-based layout only. Divs only for text wrappers inside table cells.
- ALL styles INLINE. Only a <style> block in <head> for resets + responsive @media queries.
- Standard email DOCTYPE, charset, viewport meta.
- Outlook/MSO: xmlns:v, xmlns:o on <html>. X-UA-Compatible meta. OfficeDocumentSettings XML. mj-outlook-group-fix class.
- role="presentation" border="0" cellpadding="0" cellspacing="0" on all layout tables.
- Images: border:0; display:block; outline:none; text-decoration:none; height:auto; -ms-interpolation-mode:bicubic.
- Max-width: 600px wrapper.
- Responsive @media: min-width:480px (column width classes), max-width:480px (mobile stacking + font overrides).
- Reset styles in <head>:
  #outlook a{padding:0} body{margin:0;padding:0;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%} table,td{border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt} img{border:0;height:auto;line-height:100%;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic} p{display:block;margin:0} sup{line-height:0;font-size:8px;vertical-align:4px} sub{line-height:0;font-size:8px;vertical-align:-4px}

## Color Palette
All 5 versions use the SAME Biktarvy brand colors. Use ONLY these palette values:
- primary (#cf0a2c): Brand red — header bar, hero claim background, CTA, keyword highlights
- secondary (#c00000): Dark red — used in some hero variants
- accent (#6ecbb8): Teal — callout borders, decorative accents, tinted backgrounds
- highlight (#cf0a2c): Keyword highlighting in claim text
- textPrimary (#000000): Body text
- textSecondary (#707070): References, abbreviations
- background (#ffffff): Page background
- footerBackground (#e4e4e4): Footer background
- ctaBackground (#cf0a2c) / ctaText (#ffffff): CTA button
- calloutBorder (#6ecbb8): Last-claim border
- brandDivider (#cf0a2b): 10px bottom border

## Content Placement Order

### 1. Brand Header Bar
As described in version description. Product name: "BIKTARVY\u00AE".

### 2. Email Body Text Section (for EACH cluster entry in the data array)

Render a visual grouping per cluster. Use the cluster's \`category\` as a section subheading (Arial 14px bold, palette.primary, padding 10px 25px).

**Key Claims (key_claims[]):**
- Render each key claim's \`content\` field
- FIRST key claim \u2192 Hero styling (per version description)
- MIDDLE key claims \u2192 Middle claim styling (per version description)
- LAST key claim \u2192 Last-claim callout styling (per version description)
- If only ONE key claim \u2192 Apply hero styling + callout border

**Supporting Claims (supporting_claims[]):**
- Render AFTER all key claims
- Each supporting claim's \`content\` field as body text: Arial 12px, #000000, line-height 14px, padding 5px 25px
- Add superscript citations for any trailing reference numbers in the content text

**Reusable Texts (reusable_texts[]):**
- Render AFTER all supporting claims
- Each reusable text's \`content\` field as body text: Arial 13px, #000000, line-height 15px, padding 10px 25px

**Superscript citations:** \`<sup style="line-height:0;font-size:8px;vertical-align:4px;">*,1,2</sup>\`
- Footnotes \u2192 "*,\u2020,\u2021", References \u2192 running number deduplicated by content

### 3. Components Section (for EACH cluster entry, AFTER the text sections above)

**IMPORTANT: Every component has an \`image_url\` field. You MUST render an <img> tag using this URL. Do NOT skip components. Do NOT omit images.**

For each component in the cluster's components[] array:

**A) If \`component_type == "logo"\` \u2192 TWO-COLUMN layout (content text + image):**
- First column (left, ~60%): render the component's \`content\` text
- Second column (right, ~40%): render \`<img src="{component.image_url}" ...>\`
\`\`\`html
<tr>
  <td style="direction:ltr;font-size:0px;padding:0px;text-align:center;">
    <!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td style="vertical-align:top;width:360px;"><![endif]-->
    <div class="mj-column-per-60 mj-outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:60%;">
      <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
        <tbody><tr><td style="vertical-align:top;padding:10px 25px;">
          <div style="font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:15px;color:#000000;">
            {component.content}
          </div>
        </td></tr></tbody>
      </table>
    </div>
    <!--[if mso | IE]></td><td style="vertical-align:top;width:240px;"><![endif]-->
    <div class="mj-column-per-40 mj-outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:40%;">
      <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
        <tbody><tr><td style="vertical-align:top;padding:10px 25px;">
          <img src="{component.image_url}" alt="{component.name}" style="border:0;display:block;outline:none;text-decoration:none;height:auto;-ms-interpolation-mode:bicubic;width:100%;max-width:100%;" />
        </td></tr></tbody>
      </table>
    </div>
    <!--[if mso | IE]></td></tr></table><![endif]-->
  </td>
</tr>
\`\`\`

**B) Else (figure, or any other component_type) \u2192 SINGLE-COLUMN layout:**
- First: full-width \`<img src="{component.image_url}" ...>\`
- Then: \`content\` text below the image
\`\`\`html
<tr>
  <td align="center" style="font-size:0px;padding:10px 25px;word-break:break-word;">
    <img src="{component.image_url}" alt="{component.name}" style="border:0;display:block;outline:none;text-decoration:none;height:auto;-ms-interpolation-mode:bicubic;width:100%;max-width:550px;" />
  </td>
</tr>
<tr>
  <td style="padding:5px 25px;">
    <div style="font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:14px;color:#000000;">
      {component.content}
    </div>
  </td>
</tr>
\`\`\`

### 4. CTA Button
Single CTA, center-aligned. Style per version description.
- Link: "#"
- Label: "Learn more"
- Include Outlook VML fallback

### 5. References Section (Bottom \u2014 aggregated across ALL clusters)
- Collect ALL \`references[]\` from ALL cluster entries
- Deduplicate by \`id\` field (same reference ID appears across clusters)
- Style per version description
- Header: **References** (bold)
- Format: numbered list, each reference \`content\` on its own line, <br/> separated
- Add superscript numbers in claim text that link to these references

### 6. Footnotes Section (Bottom \u2014 after References, aggregated across ALL clusters)
- Collect ALL \`footnotes[]\` from ALL cluster entries
- Deduplicate by \`id\` field
- Render with superscript symbols (*, \u2020, \u2021, \u00a7) matching the markers in claim text
- Each footnote \`content\` on its own line

### 7. Abbreviations Section
- Parse each cluster's \`glossary\` string (pipe-delimited, e.g. "3TC, lamivudine | ABC, abacavir | ...")
- Also include entries from \`glossaries[]\` array
- Merge and deduplicate across all clusters
- Sort alphabetically
- Same style as references
- Header: **Abbreviations** (bold), joined with "; "

### 8. Footer Section
- Background: #e4e4e4
- Brand Bottom Rule: border-top: 10px solid #cf0a2b

## Inline Keyword Highlighting
- **Brand names**: \`<span style="color:#cf0a2c;font-weight:bold;">Biktarvy<sup style="line-height:0;font-size:8px;vertical-align:4px;">&reg;</sup></span>\`
- **IMPORTANT**: \u00AE symbol MUST ALWAYS be superscript: \`<sup style="line-height:0;font-size:8px;vertical-align:4px;">&reg;</sup>\`
- **Statistics**: \`<span style="color:#cf0a2c;"><b>60%</b></span>\`
- **Key medical terms**: \`<span style="color:#cf0a2c;">term</span>\`
- Do NOT highlight entire sentences \u2014 only specific key phrases
- On dark/red backgrounds (hero), use <b> for emphasis but keep text white \u2014 do NOT apply red highlight on red backgrounds

## Text Handling
- Render content text VERBATIM (MLR-approved). May add <span>/<b>/<sup> highlighting.
- HTML-escape: <, >, &, "
- Preserve line breaks as <br/>.
- html lang="en".
- <title>BIKTARVY\u00AE</title>

## Output Format
Return ONLY the complete HTML starting with <!doctype html> ending with </html>. No markdown, no code fences.`;


/**
 * Build the user prompt with version theme and trimmed cluster data.
 */
export function buildClusterEmailPrompt(clusterData, versionNumber) {
  const theme = VERSION_THEMES[versionNumber - 1];
  if (!theme) {
    throw new Error(`Invalid version number: ${versionNumber}. Must be 1-5.`);
  }

  const clusters = Array.isArray(clusterData) ? clusterData : [clusterData];

  // Trim non-essential fields to reduce token usage
  const trimmedClusters = clusters.map(cluster => {
    const trimmed = { ...cluster };
    delete trimmed.asset_id;
    delete trimmed.id;
    delete trimmed.similarity;
    delete trimmed.type;
    delete trimmed.page_number;
    delete trimmed.claims;        // redundant with key_claims + supporting_claims
    delete trimmed.reference;     // redundant with references[]
    delete trimmed.reusable_text; // redundant with reusable_texts[]

    // Remove bbox and component_index from components (layout metadata not needed)
    if (trimmed.components) {
      trimmed.components = trimmed.components.map(comp => {
        const c = { ...comp };
        delete c.bbox;
        delete c.component_index;
        return c;
      });
    }

    return trimmed;
  });

  return `## Version ${theme.versionNumber}: ${theme.name}
${theme.description}

## Color Palette
\`\`\`json
${JSON.stringify(theme.palette, null, 2)}
\`\`\`

## Cluster Data
\`\`\`json
${JSON.stringify(trimmedClusters, null, 2)}
\`\`\`

Generate the complete HTML email. CRITICAL requirements:
1. Follow the version description above for all styling (header, hero, claims, CTA, references, footer)
2. MUST render ALL components as <img> tags using each component's image_url field
3. Logo components (component_type=="logo") → 2-column layout: content text in left column, image in right column
4. Figure/other components → single-column: image on top, content text below
5. Content order: key_claims → supporting_claims → reusable_texts → components → references → footnotes
6. Collect and deduplicate references and footnotes across all clusters for bottom sections
7. Add superscript numbers linking claims to references/footnotes at the bottom
8. Use the Biktarvy brand color palette values as inline styles
9. Return only the HTML.`;
}
