/**
 * Email Generator - Creates pharma marketing HTML email from design tokens + module data.
 *
 * Data placement order (top to bottom):
 *   1. Module claims[].matchText
 *   2. Module claims[].relatedClaims[].matchText
 *   3. Module reusableTexts[].matchText
 *   4. Module components[0].componentUrl (image)
 *   5. Module components[0].relatedClaims[].matchText
 *   6. Module components[0].relatedReusableTexts[].matchText
 *   (repeat for each component)
 *   Footer: all footnotes from claims
 *
 * Usage: bun run email-generator.js [design-tokens.json] [moduleData.json]
 */

import { readFile, writeFile, mkdir } from 'fs/promises';

// ─── Helpers to resolve token values ──────────────────────────────────────────

function resolveColor(tokens, ref) {
  if (!ref) return '#000000';
  // If it's already a hex value
  if (ref.startsWith('#')) return ref;
  // Resolve from tier1 primitives
  const colors = tokens?.tier1?.primitives?.colors || {};
  return colors[ref] || ref;
}

function resolveTypography(tokens, ref) {
  if (!ref) return {};
  const typo = tokens?.tier1?.primitives?.typography || {};
  return typo[ref] || {};
}

function getComponent(tokens, path) {
  const components = tokens?.tier3?.components || {};
  const parts = path.split('.');
  let obj = components;
  for (const p of parts) {
    obj = obj?.[p];
    if (!obj) return {};
  }
  return obj;
}

function getSemanticTypo(tokens, name) {
  return tokens?.tier2?.semantic?.typography?.[name] || {};
}

function getSemanticColor(tokens, name) {
  return tokens?.tier2?.semantic?.colors?.[name] || null;
}

function styleStr(obj) {
  if (!obj || typeof obj !== 'object') return '';
  return Object.entries(obj)
    .filter(([k]) => !k.startsWith('mso-') && !k.startsWith('-webkit-') && k !== 'element')
    .map(([k, v]) => `${k}: ${v}`)
    .join('; ');
}

// ─── Section builders ─────────────────────────────────────────────────────────

function buildEmailWrapper(tokens) {
  const layout = getComponent(tokens, 'layout');
  const wrapperStyle = styleStr(layout.emailWrapper || { margin: '0px auto', 'max-width': '600px' });
  return { wrapperStyle, maxWidth: layout.emailWrapper?.['max-width'] || '600px' };
}

function buildSectionOpen(tokens, bg = 'white') {
  const layout = getComponent(tokens, 'layout');
  const sectionStyle = bg === 'grey'
    ? styleStr(layout.sectionGrey || { background: '#e4e4e4', margin: '0px auto', 'max-width': '600px' })
    : styleStr(layout.sectionWhite || { background: '#ffffff', margin: '0px auto', 'max-width': '600px' });
  const tableStyle = bg === 'grey'
    ? styleStr(layout.fullWidthTableGrey || { background: '#e4e4e4', width: '100%' })
    : styleStr(layout.fullWidthTableWhite || { background: '#ffffff', width: '100%' });

  return `<div style="${sectionStyle}">
  <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="${tableStyle}">
    <tbody><tr><td style="${styleStr(layout.columnFull || {})}">
      <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%"><tbody>`;
}

function buildSectionOpenCustom(tokens, bgColor) {
  return `<div style="background: ${bgColor}; background-color: ${bgColor}; margin: 0px auto; max-width: 600px;">
  <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background: ${bgColor}; background-color: ${bgColor}; width: 100%;">
    <tbody><tr><td style="direction: ltr; font-size: 0px; padding: 0; text-align: center;">
      <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%"><tbody>`;
}

function buildSectionClose() {
  return `</tbody></table></td></tr></tbody></table></div>`;
}

function buildCell(tokens, cellStyleOverride, innerHtml) {
  const baseCell = getComponent(tokens, 'layout.cellBase');
  const cellStyle = cellStyleOverride ? styleStr(cellStyleOverride) : styleStr(baseCell);
  return `<tr><td align="left" style="${cellStyle}">${innerHtml}</td></tr>`;
}

function buildTextBlock(text, typoStyle) {
  const s = styleStr(typoStyle);
  return `<div style="${s}"><p style="margin: 0;">${escapeHtml(text)}</p></div>`;
}

function buildImageBlock(url, alt, width = '100%') {
  return `<img src="${url}" alt="${escapeHtml(alt)}" width="${width}" style="border: 0; display: block; outline: none; text-decoration: none; height: auto; width: 100%; font-size: 13px;" />`;
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ─── Red top rule divider ─────────────────────────────────────────────────────

function buildRedTopRule(tokens) {
  const rule = getComponent(tokens, 'sectionCallouts.redTopRule.p');
  const ruleStyle = Object.keys(rule).length
    ? styleStr(rule)
    : 'border-top: solid 10px #cf0a2b; font-size: 1px; margin: 0px auto; width: 100%';
  return `<tr><td style="${styleStr(getComponent(tokens, 'layout.cellBase'))}"><p style="${ruleStyle}">&nbsp;</p></td></tr>`;
}

// ─── CTA Button ───────────────────────────────────────────────────────────────

function buildCtaButton(tokens, href, label) {
  const ctaWrapper = getComponent(tokens, 'ctaButton.cell');
  const ctaLink = getComponent(tokens, 'ctaButton.link');
  const ctaSpan = getComponent(tokens, 'ctaButton.labelSpan');

  const wrapperBg = ctaWrapper.background || '#CF0A2C';
  const btnRadius = ctaWrapper['border-radius'] || '3px';

  return `<tr><td align="center" style="font-size: 0px; padding: 10px 25px; word-break: break-word;">
  <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse: separate; line-height: 100%;">
    <tbody><tr>
      <td align="center" bgcolor="${wrapperBg}" role="presentation" style="${styleStr(ctaWrapper)}" valign="middle">
        <a href="${href}" target="_blank" style="${styleStr(ctaLink)}">
          <span style="${styleStr(ctaSpan)}">${escapeHtml(label)}</span>
        </a>
      </td>
    </tr></tbody>
  </table>
</td></tr>`;
}

// ─── Main generator ───────────────────────────────────────────────────────────

export function generateEmail(tokens, moduleData) {
  const mod = Array.isArray(moduleData) ? moduleData[0] : moduleData;
  if (!mod) throw new Error('moduleData is empty');

  const { wrapperStyle, maxWidth } = buildEmailWrapper(tokens);

  // Resolve key typography styles from tier2 semantic (stable keys)
  const claimTypo = getSemanticTypo(tokens, 'claimText');
  const bodyTypo = getSemanticTypo(tokens, 'bodyText');
  const reusableTypo = getSemanticTypo(tokens, 'bodyText');
  const footnoteTypo = getSemanticTypo(tokens, 'footnoteText');
  const componentClaimTypo = getSemanticTypo(tokens, 'scientificClaim');
  const referenceTypo = getSemanticTypo(tokens, 'referenceText');
  const approvalCodeTypo = getSemanticTypo(tokens, 'approvalCode');

  // Collect all footnotes and deduplicated references
  const allFootnotes = [];
  const referenceMap = new Map(); // documentName -> reference number (1-based)
  const allReferences = []; // ordered unique reference strings

  function getRefNumber(documentName) {
    if (referenceMap.has(documentName)) return referenceMap.get(documentName);
    const num = allReferences.length + 1;
    referenceMap.set(documentName, num);
    allReferences.push(documentName);
    return num;
  }

  // ─── Gather content in placement order ──────────────────────────────────────

  const sections = [];

  // 1. Claims from module
  if (mod.claims && mod.claims.length > 0) {
    for (const claim of mod.claims) {
      // Claim matchText
      const claimStyle = { ...claimTypo };
      // Override with claim-level style if provided
      if (claim['font-size']) claimStyle['font-size'] = claim['font-size'];
      if (claim['line-height']) claimStyle['line-height'] = claim['line-height'];
      if (claim['font-weight']) claimStyle['font-weight'] = claim['font-weight'];
      if (claim.color) claimStyle.color = claim.color;
      if (claim.align) claimStyle['text-align'] = claim.align;

      // Collect footnote markers and reference numbers for superscript
      const supParts = [];
      if (claim.footnotes) {
        allFootnotes.push(claim.footnotes);
        supParts.push('*');
      }
      const claimRefNums = [];
      if (claim.references && claim.references.length > 0) {
        for (const ref of claim.references) {
          claimRefNums.push(getRefNumber(ref.documentName));
        }
        supParts.push(claimRefNums.join(','));
      }
      const superscript = supParts.length > 0 ? supParts.join(',') : '';

      sections.push({ type: 'claim', text: claim.matchText, style: claimStyle, padding: claim['padding-bottom'], superscript });

      // 2. Related claims from this claim
      if (claim.relatedClaims && claim.relatedClaims.length > 0) {
        for (const rc of claim.relatedClaims) {
          const rcRefNums = [];
          if (rc.references) {
            for (const ref of rc.references) {
              rcRefNums.push(getRefNumber(ref.documentName));
            }
          }
          const rcSup = rcRefNums.length > 0 ? rcRefNums.join(',') : '';
          sections.push({ type: 'related-claim', text: rc.matchText, style: componentClaimTypo, superscript: rcSup });
        }
      }
    }
  }

  // 3. Reusable texts from module
  if (mod.reusableTexts && mod.reusableTexts.length > 0) {
    for (const rt of mod.reusableTexts) {
      sections.push({ type: 'reusable-text', text: rt.matchText, style: bodyTypo });
    }
  }

  // 4-6. Components
  if (mod.components && mod.components.length > 0) {
    for (const comp of mod.components) {
      // Component image
      sections.push({ type: 'component-image', url: comp.componentUrl, alt: comp.title || comp.componentName || 'Component' });

      // Component related claims
      if (comp.relatedClaims && comp.relatedClaims.length > 0) {
        for (const rc of comp.relatedClaims) {
          const rcRefNums = [];
          if (rc.references) {
            for (const ref of rc.references) {
              rcRefNums.push(getRefNumber(ref.documentName));
            }
          }
          const rcSup = rcRefNums.length > 0 ? rcRefNums.join(',') : '';
          sections.push({ type: 'component-claim', text: rc.matchText, style: componentClaimTypo, superscript: rcSup });
          if (rc.abbreviation) {
            sections.push({ type: 'abbreviation', text: rc.abbreviation, style: footnoteTypo });
          }
        }
      }

      // Component related reusable texts
      if (comp.relatedReusableTexts && comp.relatedReusableTexts.length > 0) {
        for (const rt of comp.relatedReusableTexts) {
          sections.push({ type: 'component-reusable', text: rt.matchText, style: bodyTypo });
        }
      }
    }
  }

  // ─── Build HTML ──────────────────────────────────────────────────────────────

  let html = `<!doctype html>
<html xmlns="http://www.w3.org/1999/xhtml" lang="${mod.languageName === 'Spanish' ? 'es' : 'en'}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(mod.moduleName || mod.productName || 'Email')}</title>
  <style type="text/css">
    body { margin: 0; padding: 0; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; }
    p { display: block; margin: 0; }
    @media only screen and (max-width: 480px) {
      table.full-width { width: 100% !important; }
      td.full-width { width: 100% !important; }
    }
  </style>
</head>
<body style="word-spacing: normal; background-color: #ffffff;">
<div style="background-color: #ffffff;">
`;

  // ── Red top rule ──
  html += buildSectionOpen(tokens, 'white');
  html += buildRedTopRule(tokens);
  html += buildSectionClose();


  // ── Content sections ──
  for (const section of sections) {
    html += buildSectionOpen(tokens, 'white');

    switch (section.type) {
      case 'claim': {
        const cellPadding = {
          'font-size': '0px',
          'padding': '10px 25px',
          'padding-top': '5px',
          'padding-right': '25px',
          'padding-bottom': section.padding || '20px',
          'padding-left': '25px',
          'word-break': 'break-word',
        };
        const claimHtml = escapeHtml(section.text) + (section.superscript ? `<sup>${escapeHtml(section.superscript)}</sup>` : '');
        html += buildCell(tokens, cellPadding, `<div style="${styleStr(section.style)}"><p style="margin: 0;">${claimHtml}</p></div>`);
        break;
      }

      case 'related-claim':
      case 'component-claim': {
        const cellPadding = {
          'font-size': '0px',
          'padding': '10px 25px',
          'padding-top': '5px',
          'padding-right': '25px',
          'padding-bottom': '5px',
          'padding-left': '25px',
          'word-break': 'break-word',
        };
        const rcHtml = escapeHtml(section.text) + (section.superscript ? `<sup>${escapeHtml(section.superscript)}</sup>` : '');
        html += buildCell(tokens, cellPadding, `<div style="${styleStr(section.style)}"><p style="margin: 0;">${rcHtml}</p></div>`);
        break;
      }

      case 'reusable-text':
      case 'component-reusable': {
        html += buildCell(tokens, null, buildTextBlock(section.text, section.style));
        break;
      }

      case 'component-image': {
        const cellPadding = {
          'font-size': '0px',
          'padding': '10px 25px',
          'word-break': 'break-word',
        };
        html += buildCell(tokens, cellPadding, buildImageBlock(section.url, section.alt));
        break;
      }

      case 'abbreviation': {
        const cellPadding = {
          'font-size': '0px',
          'padding': '5px 25px',
          'word-break': 'break-word',
        };
        html += buildCell(tokens, cellPadding, buildTextBlock(section.text, section.style));
        break;
      }
    }

    html += buildSectionClose();
  }

  // ── CTA Button ──
  const ctaHref = mod.moduleDamUrl || mod.cmsdDocUrl || '#';
  const ctaLabel = 'Learn more';
  html += buildSectionOpen(tokens, 'white');
  html += buildCtaButton(tokens, ctaHref, ctaLabel);
  html += buildSectionClose();

  // ── References section ──
  if (allReferences.length > 0) {
    html += buildSectionOpen(tokens, 'white');
    const refCell = {
      'font-size': '0px',
      'padding': '5px 25px',
      'padding-bottom': '10px',
      'word-break': 'break-word',
    };
    const refLines = allReferences.map((r, i) => `${i + 1}. ${r}`).join('<br/>');
    html += buildCell(tokens, refCell, `<div style="${styleStr(referenceTypo)}"><p style="margin: 0;">${refLines}</p></div>`);
    html += buildSectionClose();
  }

  // ── Footer section (with footnotes) ──
  const footerBg = getSemanticColor(tokens, 'backgroundFooterPrimary') || '#9baab1';
  const footerAddressCell = getComponent(tokens, 'footer.addressCell');
  const footerCellStyle = Object.keys(footerAddressCell).length
    ? footerAddressCell
    : { 'font-size': '0px', 'padding': '10px 25px', 'word-break': 'break-word' };
  html += buildSectionOpenCustom(tokens, footerBg);
  const approvalCode = mod.approvalCode || tokens?.metadata?.approvalCode || '';
  if (approvalCode) {
    html += buildCell(tokens, footerCellStyle, buildTextBlock(approvalCode, approvalCodeTypo));
  }
  // Footnotes in footer
  if (allFootnotes.length > 0) {
    const fnCell = {
      'font-size': '0px',
      'padding': '5px 25px',
      'padding-top': '10px',
      'padding-bottom': '5px',
      'word-break': 'break-word',
    };
    for (const fn of allFootnotes) {
      const fnHtml = `<sup>*</sup> ${escapeHtml(fn)}`;
      html += buildCell(tokens, fnCell, `<div style="${styleStr(footnoteTypo)}"><p style="margin: 0;">${fnHtml}</p></div>`);
    }
  }
  html += buildSectionClose();

  // Close wrapper
  html += `</div>
</body>
</html>`;

  return html;
}

// ─── CLI entry ────────────────────────────────────────────────────────────────

async function main() {
  const tokensPath = process.argv[2] || './output/design-tokens.json';
  const moduleDataPath = process.argv[3] || './moduleData.json';

  const designToken = JSON.parse(await readFile(tokensPath, 'utf-8'));
  const moduleData = JSON.parse(await readFile(moduleDataPath, 'utf-8'));

  const html = generateEmail(designToken, moduleData);

  await mkdir('./output', { recursive: true });
  const outputPath = './output/generated-email.html';
  await writeFile(outputPath, html, 'utf-8');

  console.log(`\nGenerated email written to: ${outputPath}`);
  console.log(`Product: ${moduleData[0]?.productName || 'N/A'}`);
  console.log(`Module: ${moduleData[0]?.moduleName || 'N/A'}`);
}

// Only run CLI when executed directly, not when imported
if (import.meta.main) {
  main().catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
}
