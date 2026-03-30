/**
 * Build the classification prompt for Pass 2: semantic token mapping
 */
export function buildClassificationPrompt(mergedStyles, inventory, sourceFilename) {
  const stylesJson = JSON.stringify(mergedStyles, null, 2);

  const inventorySummary = {
    allColors: [...inventory.allColors].sort(),
    allFontSizes: [...inventory.allFontSizes].sort(),
    allFontFamilies: [...inventory.allFontFamilies],
    allFontWeights: [...inventory.allFontWeights].sort(),
    allLineHeights: [...inventory.allLineHeights].sort(),
    allBackgroundColors: [...inventory.allBackgroundColors].sort(),
  };

  return `You are given the extracted styles from a pharmaceutical marketing email (${sourceFilename}).

Your task is to classify these styles into a complete design token system with three sections: primitiveTokens, semanticTokens, and componentTokens.

## primitiveTokens
Extract all unique raw CSS values:
- **colors**: Every unique hex color with a descriptive name (e.g., "brand-blue-primary" for #003593)
- **typography**: Every unique font-family/size/weight/line-height combination
- **spacing**: Key padding/margin values used across the email
- **borders**: Every unique border style

## semanticTokens
Map primitive tokens to pharma-email-meaningful names:
- **colors**: brandPrimary, brandSecondary, brandAccent, claimHighlight, claimReference, textPrimary, textSecondary, textInverse, backgroundPrimary, backgroundSecondary, backgroundCallout, backgroundFooterPrimary, backgroundFooterSecondary, linkDefault, linkFooter
- **typography**: heading, subheading, bodyText, claimText, scientificClaim, footnoteText, disclaimerText, referenceText, adverseEventText, legalText, footerText, ctaButtonText, approvalCode

## componentTokens
Build complete component definitions with ALL CSS properties needed to recreate each element:
- **ctaButton**: The primary call-to-action button with all its styles
- **ctaLinks**: Each distinct link style variant (body, footer, AE block)
- **claimBlocks**: Each distinct claim style (efficacy, safety, statistical, indication, etc.)
- **isiBlock**: Important Safety Information section styles
- **adverseEventBlock**: Adverse event reporting box styles
- **referenceBlock**: Reference/citation section styles
- **sectionCallouts**: Highlighted callout/stat blocks
- **preheader**: Preheader/disclaimer section styles
- **footer**: Footer component with address, links, logo, approval code, copyright
- **layout**: Overall email layout dimensions and structure

## Also extract metadata:
- **source**: "${sourceFilename}"
- **extractedAt**: Current ISO timestamp
- **emailType**: The type of pharma email (e.g., "pharma-marketing-hcp")
- **brand**: The drug/brand name identified in the email
- **approvalCode**: The regulatory approval code if found in footer

## Ground-truth color inventory (from regex parsing):
${JSON.stringify(inventorySummary.allColors)}

## Ground-truth font sizes:
${JSON.stringify(inventorySummary.allFontSizes)}

## Ground-truth background colors:
${JSON.stringify(inventorySummary.allBackgroundColors)}

IMPORTANT: Every color in your output MUST exist in the ground-truth inventory above. Do not invent colors.
IMPORTANT: Every font-size in your output MUST exist in the ground-truth inventory. Do not approximate.
IMPORTANT: Use the EXACT extracted CSS property values — do not normalize, round, or simplify them.

## Extracted styles from the email:
${stylesJson}`;
}
