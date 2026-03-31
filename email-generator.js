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
  if (ref.startsWith('#')) return ref;
  const colors = tokens?.primitiveTokens?.colors || [];
  const found = colors.find(c => c.name === ref);
  return found?.value || ref;
}

function getComponent(tokens, name) {
  return tokens?.componentTokens?.[name] || {};
}

function getSemanticTypo(tokens, name) {
  const typo = tokens?.semanticTokens?.typography?.[name] || {};
  // Convert TypographyToken fields to CSS properties
  const css = {};
  if (typo.fontFamily) css['font-family'] = typo.fontFamily;
  if (typo.fontSize) css['font-size'] = typo.fontSize;
  if (typo.fontWeight) css['font-weight'] = typo.fontWeight;
  if (typo.lineHeight) css['line-height'] = typo.lineHeight;
  if (typo.letterSpacing) css['letter-spacing'] = typo.letterSpacing;
  if (typo.textTransform) css['text-transform'] = typo.textTransform;
  return css;
}

function getSemanticColor(tokens, name) {
  return tokens?.semanticTokens?.colors?.[name] || null;
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
  const maxWidth = layout.maxWidth || '600px';
  const wrapperStyle = `margin: 0px auto; max-width: ${maxWidth}`;
  return { wrapperStyle, maxWidth };
}

function buildSectionOpen(tokens, bg = 'white') {
  const layout = getComponent(tokens, 'layout');
  const maxWidth = layout.maxWidth || '600px';
  const bgColor = bg === 'grey' ? '#e4e4e4' : '#ffffff';
  const sectionStyle = `background: ${bgColor}; background-color: ${bgColor}; margin: 0px auto; max-width: ${maxWidth}`;
  const tableStyle = `background: ${bgColor}; background-color: ${bgColor}; width: 100%`;
  const cellStyle = `direction: ${layout.direction || 'ltr'}; font-size: 0px; padding: 0; text-align: center`;

  return `<div style="${sectionStyle}">
  <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="${tableStyle}">
    <tbody><tr><td style="${cellStyle}">
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
  const layout = getComponent(tokens, 'layout');
  const baseStyle = { 'font-size': '0px', 'padding': layout.sectionPadding || '10px 25px', 'word-break': 'break-word' };
  const cellStyle = cellStyleOverride ? styleStr(cellStyleOverride) : styleStr(baseStyle);
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
  const brandAccent = getSemanticColor(tokens, 'brandAccent') || getSemanticColor(tokens, 'brandPrimary') || '#cf0a2c';
  const ruleStyle = `border-top: solid 10px ${brandAccent}; font-size: 1px; margin: 0px auto; width: 100%`;
  const layout = getComponent(tokens, 'layout');
  const cellStyle = `font-size: 0px; padding: ${layout.sectionPadding || '10px 25px'}; word-break: break-word`;
  return `<tr><td style="${cellStyle}"><p style="${ruleStyle}">&nbsp;</p></td></tr>`;
}

// ─── CTA Button ───────────────────────────────────────────────────────────────

function buildCtaButton(tokens, href, label) {
  const cta = getComponent(tokens, 'ctaButton');
  const bgColor = cta.background || '#CF0A2C';
  const borderRadius = cta.borderRadius || '3px';
  const cellStyle = `background: ${bgColor}; border-radius: ${borderRadius}; border: ${cta.border || 'none'}; padding: ${cta.padding || '10px 25px'}; cursor: pointer`;
  const linkStyle = `color: ${cta.color || '#ffffff'}; font-family: ${cta.fontFamily || 'Arial'}; font-size: ${cta.fontSize || '13px'}; font-weight: ${cta.fontWeight || 'normal'}; line-height: ${cta.lineHeight || '120%'}; text-decoration: ${cta.textDecoration || 'none'}; text-transform: ${cta.textTransform || 'none'}; display: ${cta.display || 'inline-block'}`;

  return `<tr><td align="center" style="font-size: 0px; padding: 10px 25px; word-break: break-word;">
  <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse: separate; line-height: 100%;">
    <tbody><tr>
      <td align="center" bgcolor="${bgColor}" role="presentation" style="${cellStyle}" valign="middle">
        <a href="${href}" target="_blank" style="${linkStyle}">
          ${escapeHtml(label)}
        </a>
      </td>
    </tr></tbody>
  </table>
</td></tr>`;
}

// ─── Main generator ───────────────────────────────────────────────────────────

export function generateEmail(tokens, moduleData) {
  const modules = Array.isArray(moduleData) ? moduleData : [moduleData];
  if (modules.length === 0) throw new Error('moduleData is empty');

  const { wrapperStyle, maxWidth } = buildEmailWrapper(tokens);

  // Resolve key typography styles from tier2 semantic (stable keys)
  const claimTypo = getSemanticTypo(tokens, 'claimText');
  const bodyTypo = getSemanticTypo(tokens, 'bodyText');
  const reusableTypo = getSemanticTypo(tokens, 'bodyText');
  const footnoteTypo = getSemanticTypo(tokens, 'footnoteText');
  const componentClaimTypo = getSemanticTypo(tokens, 'scientificClaim');
  const referenceTypo = getSemanticTypo(tokens, 'referenceText');
  const approvalCodeTypo = getSemanticTypo(tokens, 'approvalCode');

  // Use claimBlocks component tokens for richer claim styling (bold, color, alignment)
  const claimBlocks = tokens?.componentTokens?.claimBlocks || [];

  // Build a style object for each claimBlock variant
  function buildClaimBlockStyle(block) {
    return {
      'font-family': block.fontFamily || claimTypo['font-family'] || 'Arial',
      'font-size': block.fontSize || claimTypo['font-size'] || '12px',
      'font-weight': block.fontWeight || claimTypo['font-weight'] || '400',
      'line-height': block.lineHeight || claimTypo['line-height'] || '14px',
      'color': block.color || claimTypo['color'],
      'text-align': block.textAlign || claimTypo['text-align'] || 'left',
    };
  }

  // Resolve the callout border (only if a claim-related border exists in design tokens)
  const calloutBorder = (tokens?.primitiveTokens?.borders || []).find(b => b.name.includes('claim'));
  const calloutBorderStyle = calloutBorder
    ? `border: ${calloutBorder.width} ${calloutBorder.style} ${calloutBorder.color}; border-radius: ${calloutBorder.radius}`
    : '';

  // Collect all footnotes, deduplicated references, and abbreviations
  const allFootnotes = [];
  const referenceMap = new Map(); // documentName -> reference number (1-based)
  const allReferences = []; // ordered unique reference strings
  const abbreviationSet = new Set(); // deduplicated abbreviation entries

  function getRefNumber(documentName) {
    if (referenceMap.has(documentName)) return referenceMap.get(documentName);
    const num = allReferences.length + 1;
    referenceMap.set(documentName, num);
    allReferences.push(documentName);
    return num;
  }

  // ─── Gather content in placement order from ALL modules ─────────────────────

  const sections = [];

  let moduleIndex = 0;
  for (const mod of modules) {
    // 1. Claims from module
    if (mod.claims && mod.claims.length > 0) {
      const totalClaims = mod.claims.length;
      for (let claimIdx = 0; claimIdx < totalClaims; claimIdx++) {
        const claim = mod.claims[claimIdx];
        const isFirstClaim = claimIdx === 0;
        const isLastClaim = claimIdx === totalClaims - 1;

        // First claim: cycle through claimBlocks per module; rest get regular claimText
        let claimStyle;
        let cellBgColor = null;
        if (isFirstClaim && claimBlocks.length > 0) {
          const block = claimBlocks[moduleIndex % claimBlocks.length];
          claimStyle = { ...buildClaimBlockStyle(block) };
          if (block.backgroundColor) cellBgColor = block.backgroundColor;
        } else {
          claimStyle = { ...claimTypo };
        }

        // Override with claim-level style if provided
        if (claim['font-size']) claimStyle['font-size'] = claim['font-size'];
        if (claim['line-height']) claimStyle['line-height'] = claim['line-height'];
        if (claim['font-weight']) claimStyle['font-weight'] = claim['font-weight'];
        if (claim.color) claimStyle.color = claim.color;
        if (claim.align) claimStyle['text-align'] = claim.align;

        // Last claim of each module gets the callout border
        const border = isLastClaim && calloutBorderStyle ? calloutBorderStyle : null;

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

        sections.push({ type: 'claim', text: claim.matchText, style: claimStyle, padding: claim['padding-bottom'], superscript, cellBgColor, border });
        if (claim.abbreviation) {
          claim.abbreviation.split(',').forEach(a => abbreviationSet.add(a.trim()));
        }

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
            if (rc.abbreviation) {
              rc.abbreviation.split(',').forEach(a => abbreviationSet.add(a.trim()));
            }
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
        const isDataVisual = comp.classification === 'Data Infographic'
          || comp.classification === 'Data Chart'
          || comp.subType === 'Data Graphic';

        // Build related claims data for this component
        const compRelatedClaims = [];
        if (comp.relatedClaims && comp.relatedClaims.length > 0) {
          for (const rc of comp.relatedClaims) {
            const rcRefNums = [];
            if (rc.references) {
              for (const ref of rc.references) {
                rcRefNums.push(getRefNumber(ref.documentName));
              }
            }
            const rcSup = rcRefNums.length > 0 ? rcRefNums.join(',') : '';
            compRelatedClaims.push({ text: rc.matchText, style: componentClaimTypo, superscript: rcSup });
            if (rc.abbreviation) {
              rc.abbreviation.split(',').forEach(a => abbreviationSet.add(a.trim()));
            }
          }
        }

        if (isDataVisual) {
          // 1-column layout: full-width image then related claims below
          sections.push({ type: 'component-image', url: comp.componentUrl, alt: comp.title || comp.componentName || 'Component' });
          for (const rc of compRelatedClaims) {
            sections.push({ type: 'component-claim', ...rc });
          }
        } else {
          // 2-column layout: related claims (80%) | image (20%)
          sections.push({
            type: 'component-two-col',
            url: comp.componentUrl,
            alt: comp.title || comp.componentName || 'Component',
            relatedClaims: compRelatedClaims,
          });
        }

        // Component related reusable texts
        if (comp.relatedReusableTexts && comp.relatedReusableTexts.length > 0) {
          for (const rt of comp.relatedReusableTexts) {
            sections.push({ type: 'component-reusable', text: rt.matchText, style: bodyTypo });
          }
        }
      }
    }
    moduleIndex++;
  } // end for each module

  // ─── Build HTML ──────────────────────────────────────────────────────────────

  const firstMod = modules[0];

  let html = `<!doctype html>
<html xmlns="http://www.w3.org/1999/xhtml" lang="${firstMod.languageName === 'Spanish' ? 'es' : 'en'}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(firstMod.moduleName || firstMod.productName || 'Email')}</title>
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
          'padding-right': section.border ? '0px' : '25px',
          'padding-bottom': section.border ? '5px' : (section.padding || '20px'),
          'padding-left': section.border ? '0px' : '25px',
          'word-break': 'break-word',
        };
        // Add cell background color if present (e.g. efficacy claimBlock)
        if (section.cellBgColor) cellPadding['background'] = section.cellBgColor;
        const claimHtml = escapeHtml(section.text) + (section.superscript ? `<sup>${escapeHtml(section.superscript)}</sup>` : '');
        const innerDiv = `<div style="${styleStr(section.style)}"><p style="margin: 0;">${claimHtml}</p></div>`;

        if (section.border) {
          // Wrap in a bordered container (teal callout border)
          const borderWrapperStyle = `${section.border}; padding: 0px 10px`;
          html += `<tr><td align="left" style="font-size: 0px; padding: 5px 25px; word-break: break-word;"><table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%" style="border-collapse: separate;"><tbody><tr><td style="${borderWrapperStyle}"><table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%"><tbody>`;
          html += buildCell(tokens, cellPadding, innerDiv);
          html += `</tbody></table></td></tr></tbody></table></td></tr>`;
        } else {
          html += buildCell(tokens, cellPadding, innerDiv);
        }
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

      case 'component-two-col': {
        // 2-column layout: 80% relatedClaims text (left) | 20% image (right)
        const claimTexts = (section.relatedClaims || []).map(rc => {
          const rcHtml = escapeHtml(rc.text) + (rc.superscript ? `<sup>${escapeHtml(rc.superscript)}</sup>` : '');
          return `<div style="${styleStr(rc.style)}"><p style="margin: 0;">${rcHtml}</p></div>`;
        });
        const leftContent = claimTexts.length > 0
          ? claimTexts.join('')
          : `<div style="font-family: Arial; font-size: 12px; line-height: 14px; text-align: left; color: #000000;"><div>${escapeHtml(section.alt)}</div></div>`;

        html += `<tr><td style="direction: ltr; font-size: 0px; padding: 0; text-align: center;">
      <div style="font-size: 0px; text-align: left; direction: ltr; display: inline-block; vertical-align: middle; width: 80%;">
        <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align: middle;" width="100%"><tbody>
          <tr><td align="left" style="font-size: 0px; padding: 10px 25px; padding-right: 0px; word-break: break-word;">
            ${leftContent}
          </td></tr>
        </tbody></table>
      </div>
      <div style="font-size: 0px; text-align: left; direction: ltr; display: inline-block; vertical-align: middle; width: 20%;">
        <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align: middle;" width="100%"><tbody>
          <tr><td align="center" style="font-size: 0px; padding: 5px 20px 5px 0px; word-break: break-word;">
            <img src="${section.url}" alt="${escapeHtml(section.alt)}" width="100" style="border: 0; display: block; outline: none; text-decoration: none; height: auto; width: 100%; font-size: 13px;" />
          </td></tr>
        </tbody></table>
      </div>
    </td></tr>`;
        break;
      }

    }

    html += buildSectionClose();
  }

  // ── CTA Button ──
  const ctaHref = firstMod.moduleDamUrl || firstMod.cmsdDocUrl || '#';
  const ctaLabel = 'Learn more';
  html += buildSectionOpen(tokens, 'white');
  html += buildCtaButton(tokens, ctaHref, ctaLabel);
  html += buildSectionClose();

  // ── References section ──
  if (allReferences.length > 0) {
    const refBlock = getComponent(tokens, 'referenceBlock');
    const refBg = refBlock.backgroundColor || '#ffffff';
    html += buildSectionOpenCustom(tokens, refBg);
    const refCell = {
      'font-size': '0px',
      'padding': refBlock.padding || '5px 25px',
      'word-break': 'break-word',
    };
    const refStyle = {
      'font-family': refBlock.fontFamily || referenceTypo['font-family'],
      'font-size': refBlock.fontSize || referenceTypo['font-size'],
      'font-weight': refBlock.fontWeight || referenceTypo['font-weight'],
      'line-height': refBlock.lineHeight || referenceTypo['line-height'],
      'color': refBlock.color || referenceTypo['color'] || '#707070',
      'text-align': refBlock.textAlign || 'left',
    };
    const refLines = allReferences.map((r, i) => `${i + 1}. ${r}`).join('<br/>');
    html += buildCell(tokens, refCell, `<div style="${styleStr(refStyle)}"><p style="margin: 0;">${refLines}</p></div>`);
    html += buildSectionClose();
  }

  // ── Abbreviations section ──
  if (abbreviationSet.size > 0) {
    const refBlock = getComponent(tokens, 'referenceBlock');
    const abbrevBg = refBlock.backgroundColor || '#ffffff';
    html += buildSectionOpenCustom(tokens, abbrevBg);
    const abbrevCell = {
      'font-size': '0px',
      'padding': refBlock.padding || '5px 25px',
      'word-break': 'break-word',
    };
    const abbrevStyle = {
      'font-family': refBlock.fontFamily || referenceTypo['font-family'] || 'Arial',
      'font-size': refBlock.fontSize || referenceTypo['font-size'] || '10px',
      'font-weight': refBlock.fontWeight || referenceTypo['font-weight'] || '400',
      'line-height': refBlock.lineHeight || referenceTypo['line-height'] || '13px',
      'color': refBlock.color || referenceTypo['color'] || '#707070',
      'text-align': refBlock.textAlign || 'left',
    };
    const abbrevLines = [...abbreviationSet].sort().join('; ');
    html += buildCell(tokens, abbrevCell, `<div style="${styleStr(abbrevStyle)}"><p style="margin: 0;">${escapeHtml(abbrevLines)}</p></div>`);
    html += buildSectionClose();
  }

  // ── Footer section (with footnotes) ──
  const footer = getComponent(tokens, 'footer');
  const footerBg = footer.backgroundColor || getSemanticColor(tokens, 'backgroundFooterPrimary') || '#9baab1';
  const footerCellStyle = {
    'font-size': '0px',
    'padding': '10px 25px',
    'word-break': 'break-word',
  };
  const footerTextStyle = {
    'font-family': footer.addressFontFamily || 'Arial',
    'font-size': footer.addressFontSize || '13px',
    'font-weight': footer.addressFontWeight || '400',
    'line-height': footer.addressLineHeight || '15px',
    'color': footer.addressColor || '#000000',
    'text-align': footer.addressTextAlign || 'left',
  };
  html += buildSectionOpenCustom(tokens, footerBg);

  const approvalCode = firstMod.approvalCode || tokens?.metadata?.approvalCode || '';
  if (approvalCode) {
    const approvalStyle = {
      ...footerTextStyle,
      'font-size': footer.approvalCodeFontSize || approvalCodeTypo['font-size'] || '10px',
      'color': footer.approvalCodeColor || approvalCodeTypo['color'] || '#707070',
    };
    html += buildCell(tokens, footerCellStyle, buildTextBlock(approvalCode, approvalStyle));
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
