import { z } from 'zod';

export const CTAButtonToken = z.object({
  background: z.string().describe('Button background color'),
  color: z.string().describe('Button text color'),
  fontFamily: z.string().describe('Button font family'),
  fontSize: z.string().describe('Button font size'),
  fontWeight: z.string().describe('Button font weight'),
  lineHeight: z.string().describe('Button line height'),
  padding: z.string().describe('Button padding, e.g. "14px 23px"'),
  borderRadius: z.string().describe('Button border radius'),
  border: z.string().describe('Button border, e.g. "0px solid #ffffff"'),
  textDecoration: z.string().describe('Text decoration, typically "none"'),
  textTransform: z.string().describe('Text transform if any'),
  display: z.string().describe('Display property, e.g. "inline-block"'),
  textContent: z.string().describe('Sample button text for context'),
});

export const CTALinkToken = z.object({
  color: z.string().describe('Link text color'),
  textDecoration: z.string().describe('Link text decoration'),
  fontWeight: z.string().describe('Link font weight'),
  cursor: z.string().describe('Cursor style'),
  display: z.string().describe('Display property'),
  context: z.string().describe('Where this link style is used: "inline-text", "footer", "PI-reference"'),
});

export const ClaimBlockToken = z.object({
  type: z.enum(['efficacy', 'safety', 'statistical', 'indication', 'treatment-journey', 'general']).describe('Type of pharma claim'),
  fontFamily: z.string().describe('Claim text font family'),
  fontSize: z.string().describe('Claim text font size'),
  fontWeight: z.string().describe('Claim text font weight'),
  lineHeight: z.string().describe('Claim text line height'),
  color: z.string().describe('Claim text color'),
  textAlign: z.string().describe('Text alignment'),
  backgroundColor: z.string().optional().describe('Background color if in a callout block'),
  padding: z.string().describe('Padding around claim text'),
  approved: z.boolean().describe('Whether the claim has approved="true" attribute'),
  hasCitations: z.boolean().describe('Whether the claim contains <sup> citation references'),
  citationStyle: z.object({
    element: z.string().describe('Citation element, typically "sup"'),
    idPattern: z.string().describe('Citation ID pattern if present'),
  }).optional().describe('Citation formatting details if hasCitations is true'),
});

export const ISIBlockToken = z.object({
  headerFontFamily: z.string().describe('ISI header font family'),
  headerFontSize: z.string().describe('ISI header font size'),
  headerFontWeight: z.string().describe('ISI header font weight'),
  headerLineHeight: z.string().describe('ISI header line height'),
  headerColor: z.string().describe('ISI header text color'),
  bodyFontFamily: z.string().describe('ISI body font family'),
  bodyFontSize: z.string().describe('ISI body font size'),
  bodyFontWeight: z.string().describe('ISI body font weight'),
  bodyLineHeight: z.string().describe('ISI body line height'),
  bodyColor: z.string().describe('ISI body text color'),
  backgroundColor: z.string().describe('ISI section background color'),
  padding: z.string().describe('ISI section padding'),
});

export const AdverseEventBlockToken = z.object({
  headerFontFamily: z.string().describe('AE header font family'),
  headerFontSize: z.string().describe('AE header font size'),
  headerFontWeight: z.string().describe('AE header font weight'),
  headerLineHeight: z.string().describe('AE header line height'),
  headerColor: z.string().describe('AE header text color'),
  bodyFontFamily: z.string().describe('AE body font family'),
  bodyFontSize: z.string().describe('AE body font size'),
  bodyFontWeight: z.string().describe('AE body font weight'),
  bodyLineHeight: z.string().describe('AE body line height'),
  bodyColor: z.string().describe('AE body text color'),
  containerBorder: z.string().describe('AE box border, e.g. "1.5px solid #000000"'),
  containerPadding: z.string().describe('AE box padding'),
  backgroundColor: z.string().describe('AE box background color'),
  linkColor: z.string().describe('Link color within AE block'),
  linkTextDecoration: z.string().describe('Link text decoration in AE block'),
});

export const ReferenceBlockToken = z.object({
  fontFamily: z.string().describe('Reference text font family'),
  fontSize: z.string().describe('Reference text font size'),
  fontWeight: z.string().describe('Reference text font weight'),
  lineHeight: z.string().describe('Reference text line height'),
  color: z.string().describe('Reference text color'),
  backgroundColor: z.string().describe('Reference section background color'),
  padding: z.string().describe('Reference section padding'),
  textAlign: z.string().describe('Text alignment'),
});

export const PreheaderToken = z.object({
  backgroundColor: z.string().describe('Preheader background color'),
  fontFamily: z.string().describe('Preheader font family'),
  fontSize: z.string().describe('Preheader font size'),
  fontWeight: z.string().describe('Preheader font weight'),
  lineHeight: z.string().describe('Preheader line height'),
  color: z.string().describe('Preheader text color'),
  textAlign: z.string().describe('Preheader text alignment'),
  padding: z.string().describe('Preheader padding'),
});

export const FooterToken = z.object({
  backgroundColor: z.string().describe('Footer background color'),
  logoWidth: z.string().describe('Footer logo width'),
  addressFontFamily: z.string().describe('Address text font family'),
  addressFontSize: z.string().describe('Address text font size'),
  addressFontWeight: z.string().describe('Address text font weight'),
  addressLineHeight: z.string().describe('Address text line height'),
  addressColor: z.string().describe('Address text color'),
  addressTextAlign: z.string().describe('Address text alignment'),
  linkColor: z.string().describe('Footer link color'),
  linkTextDecoration: z.string().describe('Footer link text decoration'),
  approvalCodeFontSize: z.string().describe('Approval code font size'),
  approvalCodeColor: z.string().describe('Approval code text color'),
  copyrightFontSize: z.string().describe('Copyright text font size'),
  copyrightColor: z.string().describe('Copyright text color'),
  copyrightBackgroundColor: z.string().describe('Copyright section background color'),
});

export const LayoutToken = z.object({
  maxWidth: z.string().describe('Email max width, e.g. "600px"'),
  columnWidths: z.array(z.string()).describe('Column width patterns used, e.g. ["100%", "5%/95%", "10%/80%/10%"]'),
  sectionPadding: z.string().describe('Default section padding'),
  direction: z.string().describe('Text direction, e.g. "ltr"'),
});

export const SectionCalloutToken = z.object({
  backgroundColor: z.string().describe('Callout block background color'),
  fontFamily: z.string().describe('Callout text font family'),
  fontSize: z.string().describe('Callout text font size'),
  fontWeight: z.string().describe('Callout text font weight'),
  lineHeight: z.string().describe('Callout text line height'),
  color: z.string().describe('Callout text color'),
  textAlign: z.string().describe('Callout text alignment'),
  padding: z.string().describe('Callout block padding'),
});
