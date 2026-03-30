/**
 * Build the extraction prompt for Pass 1: raw style extraction per chunk
 */
export function buildExtractionPrompt(group) {
  const chunksHtml = group.chunks
    .map(c => `<!-- Section: ${c.sectionClass} | Background: ${c.backgroundColor || 'none'} -->\n${c.html}`)
    .join('\n\n');

  return `Extract every unique styled element from this "${group.name}" section of a pharma marketing email.

For each uniquely-styled element, report:
1. **element**: The HTML element type (div, td, a, span, img, table)
2. **cssProperties**: Every CSS property and its exact value from the style="" attribute. Include ALL properties — font-family, font-size, font-weight, line-height, color, background, padding (all sides), margin, text-align, text-decoration, display, border, border-radius, cursor, direction, vertical-align, width, max-width, etc.
3. **textContent**: First 100 characters of the visible text content for context
4. **semanticRole**: Your classification of what this element is in a pharma email. Use one of:
   - "preheader-disclaimer" — promotional disclaimer text
   - "hero-image" — main banner/hero image
   - "greeting" — salutation text (Dear HCP)
   - "body-text" — informational body copy
   - "heading" — section heading
   - "subheading" — section subheading
   - "claim-text" — approved marketing claim
   - "scientific-claim" — statistical or efficacy claim with data
   - "claim-callout" — highlighted claim in a callout block
   - "bullet-point" — list item text
   - "cta-button" — call-to-action button
   - "cta-link" — inline or standalone link
   - "pi-reference" — prescribing information reference
   - "isi-text" — important safety information
   - "indication-text" — licensed indication text
   - "adverse-event-header" — AE reporting section header
   - "adverse-event-body" — AE reporting body text
   - "adverse-event-link" — AE reporting link
   - "reference-text" — numbered citation/reference
   - "footer-address" — company address
   - "footer-link" — footer navigation link
   - "footer-logo" — company logo
   - "approval-code" — regulatory approval/job code
   - "copyright" — copyright text
   - "divider" — visual divider/spacer
   - "layout-wrapper" — structural layout element
5. **approved**: true if the element has approved="true" attribute, false otherwise
6. **hasCitations**: true if the element contains <sup> citation references

Focus on content-carrying elements (text, links, buttons, images). Skip empty structural wrappers unless they have meaningful background colors or borders.

HTML content:
${chunksHtml}`;
}
