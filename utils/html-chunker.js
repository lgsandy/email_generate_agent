/**
 * HTML chunker for splitting pharma email HTML into section-based chunks.
 * Splits by section_* class divs for manageable LLM processing.
 */

/**
 * Strip MSO/Outlook conditional comments from HTML to reduce noise.
 */
export function stripMsoComments(html) {
  let result = html.replace(/<!--\[if\s+(?:mso|!mso|lte\s+mso\s+\d+|mso\s*\|\s*IE)\]>[\s\S]*?<!\[endif\]-->/gi, '');
  result = result.replace(/<!--\[if\s+!mso\]><!-->/gi, '');
  result = result.replace(/<!--<!\[endif\]-->/gi, '');
  return result;
}

/**
 * Extract <style> blocks from HTML
 */
export function extractStyleBlocks(html) {
  const styles = [];
  const htmlWithoutStyles = html.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, (_match, content) => {
    styles.push(content.trim());
    return '';
  });
  return { styles, htmlWithoutStyles };
}

/**
 * Compact whitespace in HTML while preserving content
 */
export function compactWhitespace(html) {
  return html
    .replace(/\n\s*\n/g, '\n')
    .replace(/^\s+$/gm, '')
    .replace(/\t/g, ' ')
    .replace(/ {2,}/g, ' ');
}

/**
 * Extract text content preview from an HTML chunk
 */
function getTextPreview(html, maxLength = 120) {
  const text = html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
}

/**
 * Extract background color from a section div
 */
function extractBgColor(html) {
  const bgMatch = html.match(/background-color:\s*([#\w]+)/i)
    || html.match(/background:\s*([#\w]+)/i)
    || html.match(/bgcolor="([^"]+)"/i);
  return bgMatch?.[1];
}

/**
 * Split HTML body content into section-based chunks.
 */
export function splitIntoSections(html) {
  const chunks = [];
  const sectionStarts = [];
  const sectionStartRegex = /<div\s+[^>]*class="(section_[a-z0-9]+)"/gi;
  let match;

  while ((match = sectionStartRegex.exec(html)) !== null) {
    sectionStarts.push({
      index: match.index,
      className: match[1],
      tag: match[0],
    });
  }

  for (let i = 0; i < sectionStarts.length; i++) {
    const start = sectionStarts[i];
    const endIndex = i < sectionStarts.length - 1
      ? sectionStarts[i + 1].index
      : html.length;

    const sectionHtml = html.slice(start.index, endIndex);
    const bgColor = extractBgColor(sectionHtml);
    const textPreview = getTextPreview(sectionHtml);

    chunks.push({
      id: `chunk_${i}`,
      sectionClass: start.className,
      html: sectionHtml,
      backgroundColor: bgColor,
      textPreview,
    });
  }

  // If no sections found, return the whole body as one chunk
  if (chunks.length === 0) {
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
    const bodyContent = bodyMatch ? bodyMatch[1] : html;
    chunks.push({
      id: 'chunk_0',
      sectionClass: 'full_body',
      html: bodyContent,
      textPreview: getTextPreview(bodyContent),
    });
  }

  return chunks;
}

/**
 * Group chunks into semantic categories for batched LLM processing
 */
export function groupChunks(chunks) {
  const groups = [];

  const preheader = [];
  const hero = [];
  const bodyContent = [];
  const darkBgSections = [];
  const footerSections = [];

  for (const chunk of chunks) {
    const lowerText = chunk.textPreview.toLowerCase();
    const bg = chunk.backgroundColor?.toLowerCase();

    if (lowerText.includes('promotional email') || (lowerText.includes('prescribing information') && bg === '#e9e9e9')) {
      preheader.push(chunk);
    } else if (chunk.html.includes('<img') && chunk.html.includes('width="600"') && !chunk.html.includes('logo')) {
      hero.push(chunk);
    } else if (bg === '#000000') {
      footerSections.push(chunk);
    } else if (bg === '#50504f') {
      darkBgSections.push(chunk);
    } else {
      bodyContent.push(chunk);
    }
  }

  if (preheader.length) groups.push({ name: 'preheader', description: 'Preheader/disclaimer section', chunks: preheader });
  if (hero.length) groups.push({ name: 'hero', description: 'Hero image section', chunks: hero });
  if (bodyContent.length) groups.push({ name: 'body', description: 'Main body content: claims, text, CTAs', chunks: bodyContent });
  if (darkBgSections.length) groups.push({ name: 'references', description: 'Reference/PI sections on dark background', chunks: darkBgSections });
  if (footerSections.length) groups.push({ name: 'footer', description: 'Footer sections', chunks: footerSections });

  return groups;
}
