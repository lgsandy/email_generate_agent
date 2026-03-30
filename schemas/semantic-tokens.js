import { z } from 'zod';
import { TypographyToken } from './primitive-tokens.js';

export const SemanticColorTokens = z.object({
  brandPrimary: z.string().describe('Primary brand color used in CTAs and key elements'),
  brandSecondary: z.string().describe('Secondary brand color used in headings'),
  brandAccent: z.string().describe('Accent color for highlights or decorative bars'),
  claimHighlight: z.string().describe('Color used for highlighted claim text or callout blocks'),
  claimReference: z.string().describe('Color used for supporting claim text or references'),
  textPrimary: z.string().describe('Primary body text color'),
  textSecondary: z.string().describe('Secondary/muted text color (disclaimers, preheader)'),
  textInverse: z.string().describe('Text color on dark backgrounds'),
  backgroundPrimary: z.string().describe('Main email background color'),
  backgroundSecondary: z.string().describe('Secondary background (preheader bar, etc.)'),
  backgroundCallout: z.string().describe('Background for stat callout or highlight blocks'),
  backgroundFooterPrimary: z.string().describe('Primary footer background color'),
  backgroundFooterSecondary: z.string().describe('Secondary footer/copyright background color'),
  linkDefault: z.string().describe('Default link color in body text'),
  linkFooter: z.string().describe('Link color in footer sections'),
});

export const SemanticTypographyTokens = z.object({
  heading: TypographyToken.describe('Main heading/title typography'),
  subheading: TypographyToken.describe('Section subheading typography'),
  bodyText: TypographyToken.describe('Standard body copy typography'),
  claimText: TypographyToken.describe('Approved claim text typography (with citations)'),
  scientificClaim: TypographyToken.describe('Scientific/statistical claim callout typography'),
  footnoteText: TypographyToken.describe('PI/indication footnote typography'),
  disclaimerText: TypographyToken.describe('Preheader disclaimer typography'),
  referenceText: TypographyToken.describe('Reference section typography (on dark bg)'),
  adverseEventText: TypographyToken.describe('Adverse event reporting text typography'),
  legalText: TypographyToken.describe('Copyright/legal fine print typography'),
  footerText: TypographyToken.describe('Footer address and links typography'),
  ctaButtonText: TypographyToken.describe('CTA button text typography'),
  approvalCode: TypographyToken.describe('Job/approval code text typography'),
});
