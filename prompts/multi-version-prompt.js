/**
 * Prompts for multi-version pharma email generation.
 * 5 distinct LAYOUT designs, all using the same Biktarvy brand color scheme.
 * Design patterns based on real pharmaceutical HCP marketing email research.
 */

// Shared Biktarvy brand palette (from design-tokens.json)
const BRAND_PALETTE = {
  primary: '#cf0a2c',
  secondary: '#c00000',
  accent: '#6ecbb8',
  highlight: '#cf0a2c',
  textPrimary: '#000000',
  textSecondary: '#707070',
  background: '#ffffff',
  footerBackground: '#e4e4e4',
  footerSecondary: '#e4e4e4',
  footerText: '#000000',
  ctaBackground: '#cf0a2c',
  ctaText: '#ffffff',
  calloutBorder: '#6ecbb8',
  brandDivider: '#cf0a2b',
};

export const VERSION_THEMES = [
  {
    versionNumber: 1,
    name: 'Classic Grid',
    description: `Standard pharma grid layout — structured, clinical, card-based.
HEADER: Full-width palette.primary (#cf0a2c) background, 50px tall, product name centered in white 18px Arial bold.
HERO CLAIM: Full-width palette.primary background, white text 14px bold, center-aligned, padding 20px 25px, line-height 17px.
MIDDLE CLAIMS: White background, standard body text — Arial 12px, #000000, line-height 14px, padding 5px 25px. No card borders.
LAST CLAIM: Bordered card — 3px solid palette.calloutBorder (#6ecbb8), border-radius 10px, padding 5px 15px, white background.
CTA: Rounded-rectangle (3px radius), palette.ctaBackground (#cf0a2c), white text 13px, padding 10px 25px.
COMPONENTS: Standard placement — Photo/Illustration as 80/20 two-column, Data Charts full-width.
REFERENCES: White background, Arial 10px, #707070, line-height 13px.
FOOTER: #e4e4e4 background, approval code + footnotes, brand divider 10px solid #cf0a2b.`,
    palette: { ...BRAND_PALETTE },
  },
  {
    versionNumber: 2,
    name: 'Left-Accent Cards',
    description: `Modern card layout with left accent borders on claims.
HEADER: palette.primary (#cf0a2c) background, 50px tall, product name LEFT-aligned in white 18px Arial bold, padding-left 25px.
HERO CLAIM: Tinted card — palette accent tint background (#f0faf7, very light teal), palette.primary text 14px bold, 4px solid palette.primary LEFT border, padding 15px 20px 15px 22px, line-height 17px.
MIDDLE CLAIMS: Each claim has 4px solid palette.accent (#6ecbb8) LEFT border, padding 10px 20px 10px 22px. Arial 12px, #000000, line-height 14px. White background. 8px space between claims.
LAST CLAIM: Card with 3px solid palette.calloutBorder (#6ecbb8) full border, border-radius 10px, 4px solid palette.primary LEFT border inside, padding 10px 20px.
CTA: Pill shape (20px radius), palette.ctaBackground, white text 13px bold, padding 12px 35px.
COMPONENTS: Photo/Illustration as 80/20 two-column, Data Charts full-width.
REFERENCES: Light teal tint background (#f0faf7), Arial 10px, #707070, line-height 13px, padding 10px 25px.
FOOTER: #e4e4e4 background, brand divider 10px solid #cf0a2b.`,
    palette: { ...BRAND_PALETTE },
  },
  {
    versionNumber: 3,
    name: 'Elegant Inverse',
    description: `Premium pharma feel with inverse (colored background) blocks and elegant spacing.
HEADER: palette.primary (#cf0a2c) background, 55px tall, product name centered in white Georgia 20px bold.
HERO CLAIM: INVERSE BLOCK — Full-width palette.primary (#cf0a2c) background, cream/white text (#edebe3) 14px Georgia bold, center-aligned, padding 20px 25px, line-height 17px. This is the efficacy callout.
MIDDLE CLAIMS: Elegant quote style — 3px solid palette.accent (#6ecbb8) left border, padding 8px 20px 8px 22px. Arial 12px, #000000, line-height 14px. No background. 12px space between claims.
LAST CLAIM: Card with palette.accent (#6ecbb8) as 3px solid border, border-radius 10px, light teal tint background (#f0faf7), padding 10px 20px.
CTA: Rounded-rectangle (6px radius), palette.ctaBackground, white text Georgia 14px bold, padding 12px 36px, letter-spacing 0.5px.
COMPONENTS: Photo/Illustration as 80/20 two-column, Data Charts full-width.
REFERENCES: Separated by thin 1px #6ecbb8 top line. White background. Arial 10px, #707070.
FOOTER: #e4e4e4 background, brand divider 10px solid #cf0a2b.`,
    palette: { ...BRAND_PALETTE },
  },
  {
    versionNumber: 4,
    name: 'Soft Rounded Cards',
    description: `Approachable design with soft rounded card containers for each claim.
HEADER: Light teal tint (#f0faf7) background, 50px tall, product name CENTER-aligned in palette.primary (#cf0a2c) 18px Arial bold. 3px solid palette.primary top accent bar above header.
HERO CLAIM: Rounded card (10px radius) with light teal tint background (#f0faf7), palette.primary text 14px bold, center-aligned, padding 18px 22px, line-height 17px.
MIDDLE CLAIMS: Each claim in a soft rounded card (8px radius) — 1px solid #E0E0E0 border, border-bottom 2px solid #D0D0D0, white background, padding 14px 18px. Arial 12px, #000000, line-height 14px. 10px space between cards.
LAST CLAIM: Rounded card (10px radius), 3px solid palette.calloutBorder (#6ecbb8), white background, padding 14px 20px.
CTA: Pill shape (24px radius), palette.ctaBackground, white text 13px bold, padding 12px 40px.
COMPONENTS: Photo/Illustration as 80/20 two-column, Data Charts full-width.
REFERENCES: Rounded card (8px radius) with light teal tint background (#f0faf7), padding 14px 25px. Arial 10px, #707070.
FOOTER: #e4e4e4 background, brand divider 10px solid #cf0a2b.`,
    palette: { ...BRAND_PALETTE },
  },
  {
    versionNumber: 5,
    name: 'Bold Editorial',
    description: `High-impact editorial layout — sharp edges, top-border cards, dense data-forward.
HEADER: 8px solid palette.primary (#cf0a2c) bar at very top of email. Then product name in palette.primary 18px Arial extra-bold on white background, padding 12px 25px.
HERO CLAIM: Full-width dark block — palette.secondary (#c00000) background, white text 14px extra-bold (800), center-aligned, padding 18px 25px, line-height 17px, 0px radius. Maximum impact.
MIDDLE CLAIMS: Sharp cards (0px radius) — white background, 3px solid palette.primary (#cf0a2c) TOP border only, padding 10px 18px, 6px space between cards. Arial 12px, #000000, line-height 14px.
LAST CLAIM: Sharp card (0px radius), 3px solid palette.calloutBorder (#6ecbb8) full border, light gray (#f5f5f5) background, padding 10px 18px.
CTA: Sharp rectangle (0px radius), palette.ctaBackground, white text 13px bold uppercase, letter-spacing 1px, padding 14px 40px.
COMPONENTS: Photo/Illustration as 80/20 two-column, Data Charts full-width.
REFERENCES: #f5f5f5 background, sharp corners, compact padding 10px 25px. Arial 10px, #707070.
FOOTER: #e4e4e4 background, brand divider 10px solid #cf0a2b.`,
    palette: { ...BRAND_PALETTE },
  },
];

export const MULTI_VERSION_SYSTEM_PROMPT = `You are a pharmaceutical HCP marketing email HTML generator. You produce polished, email-client-compatible HTML emails.

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
As described in version description. Product name from first module's productName.

### 2. Module Claims (for EACH module)

**FIRST claim (Hero):** Follow version description's hero styling exactly.
**MIDDLE claims:** Follow version description's middle claim styling.
**LAST claim:** Follow version description's last claim callout styling.
**If only ONE claim:** Apply hero styling + callout border.

**Superscript citations:** \`<sup style="line-height:0;font-size:8px;vertical-align:4px;">*,1,2</sup>\`
- Footnotes → "*", References → running number deduplicated by documentName, Combined: "*,1,2"
- Collect abbreviations from each claim into a deduplicated set.

### 3. Related Claims (claims[].relatedClaims[])
Body text (Arial 12px, #000000, line-height 14px, padding 5px 25px). Add superscript citations.

### 4. Reusable Texts (reusableTexts[])
Body text (Arial 13px, #000000, line-height 15px, padding 10px 25px).

### 5. Components (components[]) — CRITICAL: MUST RENDER IMAGES

**IMPORTANT: Every component has a \`componentUrl\` field. You MUST render an <img> tag using this URL. Do NOT skip components. Do NOT omit images.**

For each component in the module's components[] array:

**Step 1: Deduplication** — Check if the component's relatedClaims were already rendered in the module's claims[] section. Skip duplicates. If relatedClaims is empty, do NOT invent text.

**Step 2: Determine layout based on classification/subType:**

**A) Data Infographic / Data Chart / Data Graphic → FULL-WIDTH image:**
\`\`\`html
<tr>
  <td align="center" style="font-size:0px;padding:10px 25px;word-break:break-word;">
    <img src="{component.componentUrl}" alt="{component.componentName}" style="border:0;display:block;outline:none;text-decoration:none;height:auto;-ms-interpolation-mode:bicubic;width:100%;max-width:550px;" />
  </td>
</tr>
\`\`\`
Then render any non-duplicate relatedClaims below the image.

**B) Photo / Illustration / other → TWO-COLUMN (80% text, 20% image):**
\`\`\`html
<tr>
  <td style="direction:ltr;font-size:0px;padding:0px;text-align:center;">
    <!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td style="vertical-align:top;width:480px;"><![endif]-->
    <div class="mj-column-per-80 mj-outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:80%;">
      <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
        <tbody><tr>
          <td style="vertical-align:top;padding:10px 25px;">
            <div style="font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:400;line-height:15px;text-align:left;color:#000000;">
              {component.componentName or non-duplicate relatedClaims text}
            </div>
          </td>
        </tr></tbody>
      </table>
    </div>
    <!--[if mso | IE]></td><td style="vertical-align:top;width:120px;"><![endif]-->
    <div class="mj-column-per-20 mj-outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:20%;">
      <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
        <tbody><tr>
          <td style="vertical-align:top;padding:10px 25px;">
            <img src="{component.componentUrl}" alt="{component.componentName}" style="border:0;display:block;outline:none;text-decoration:none;height:auto;-ms-interpolation-mode:bicubic;width:100%;max-width:100%;" />
          </td>
        </tr></tbody>
      </table>
    </div>
    <!--[if mso | IE]></td></tr></table><![endif]-->
  </td>
</tr>
\`\`\`

**Step 3:** After each component, render its relatedReusableTexts using body text styling.

### 6. CTA Button
Single CTA, center-aligned. Style per version description.
- Link: first module's moduleDamUrl
- Label: "Learn more"
- Include Outlook VML fallback

### 7. References Section
- Style per version description
- Header: **Referencias** (bold)
- Format: "1. {documentName}" per line, <br/> separated, deduplicated

### 8. Abbreviations Section
- Same style as references
- Header: **Abreviaturas** (bold)
- Sorted alphabetically, joined with "; "

### 9. Footer Section
- Background: #e4e4e4
- Approval code (from first module's approvalCode): 10px, left-aligned
- Footnotes: prefixed with superscript "*", 10px
- Brand Bottom Rule: border-top: 10px solid #cf0a2b

## Inline Keyword Highlighting
- **Brand names**: \`<span style="color:#cf0a2c;font-weight:bold;">Biktarvy<sup style="line-height:0;font-size:8px;vertical-align:4px;">&reg;</sup></span>\`
- **IMPORTANT**: \u00AE symbol MUST ALWAYS be superscript: \`<sup style="line-height:0;font-size:8px;vertical-align:4px;">&reg;</sup>\`
- **Statistics**: \`<span style="color:#cf0a2c;"><b>60%</b></span>\`
- **Key medical terms**: \`<span style="color:#cf0a2c;">term</span>\`
- Do NOT highlight entire sentences — only specific key phrases
- On dark/red backgrounds (hero), use <b> for emphasis but keep text white — do NOT apply red highlight on red backgrounds

## Text Handling
- matchText VERBATIM (MLR-approved). May add <span>/<b>/<sup> highlighting.
- HTML-escape: <, >, &, "
- Preserve line breaks as <br/>.
- html lang from languageName ("Spanish"→"es", default "en").
- <title> = first module's productName.

## Output Format
Return ONLY the complete HTML starting with <!doctype html> ending with </html>. No markdown, no code fences.`;


/**
 * Build the user prompt with version theme and trimmed module data.
 */
export function buildMultiVersionPrompt(moduleData, versionNumber) {
  const theme = VERSION_THEMES[versionNumber - 1];
  if (!theme) {
    throw new Error(`Invalid version number: ${versionNumber}. Must be 1-5.`);
  }

  const modules = Array.isArray(moduleData) ? moduleData : [moduleData];

  // Trim non-essential fields from module data to reduce token usage
  // IMPORTANT: Keep componentUrl inside components[] — only delete module-level componentUrl (thumbnail)
  const trimmedModules = modules.map(mod => {
    const trimmed = { ...mod };
    delete trimmed.logos;
    delete trimmed.moduleDamId;
    delete trimmed.moduleDamName;
    delete trimmed.productDamId;
    delete trimmed.countryDamId;
    delete trimmed.topicDamId;
    delete trimmed.subtopicDamId;
    delete trimmed.languageDamId;
    delete trimmed.therapeuticAreaDamId;
    delete trimmed.audienceDamId;
    delete trimmed.creativeAgencyDamId;
    delete trimmed.contentToneDamId;
    delete trimmed.sourceModuleDamName;
    delete trimmed.sourceModuleMlrStatus;
    delete trimmed.sourceModuleDamUrl;
    delete trimmed.sourceModuleId;
    delete trimmed.moduleDraftElementIncluded;
    delete trimmed.businessRulePublished;
    delete trimmed.hasUnpublishedBusinessRules;
    delete trimmed.buisnessRuleSaved;
    delete trimmed.strategicObjectives;
    delete trimmed.segments;
    delete trimmed.indications;
    delete trimmed.businessRules;
    delete trimmed.componentThumbnailUrl;
    delete trimmed.componentUrl; // module-level thumbnail only

    if (trimmed.claims) {
      trimmed.claims = trimmed.claims.map(claim => {
        const c = { ...claim };
        delete c.matchTextVariants;
        delete c.claimDamId;
        delete c.topicDamId;
        return c;
      });
    }

    // KEEP componentUrl inside each component — this is the image URL to render
    if (trimmed.components) {
      trimmed.components = trimmed.components.map(comp => {
        const c = { ...comp };
        delete c.componentDamId;
        delete c.topicDamId;
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

## Module Data
\`\`\`json
${JSON.stringify(trimmedModules, null, 2)}
\`\`\`

Generate the complete HTML email. CRITICAL requirements:
1. Follow the version description above for all styling (header, hero, claims, CTA, references, footer)
2. MUST render ALL components as <img> tags using each component's componentUrl field
3. Data Infographic/Data Chart components → full-width image
4. Photo/Illustration components → 80/20 two-column layout (text left, image right)
5. Use the Biktarvy brand color palette values as inline styles
6. Return only the HTML.`;
}
