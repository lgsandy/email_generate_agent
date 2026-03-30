import { z } from 'zod';
import { PrimitiveTokens } from './primitive-tokens.js';
import { SemanticColorTokens, SemanticTypographyTokens } from './semantic-tokens.js';
import {
  CTAButtonToken,
  CTALinkToken,
  ClaimBlockToken,
  ISIBlockToken,
  AdverseEventBlockToken,
  ReferenceBlockToken,
  PreheaderToken,
  FooterToken,
  LayoutToken,
  SectionCalloutToken,
} from './component-tokens.js';

export const DesignTokenOutput = z.object({
  metadata: z.object({
    source: z.string().describe('Source HTML filename'),
    extractedAt: z.string().describe('ISO timestamp of extraction'),
    emailType: z.string().describe('Email type, e.g. "pharma-marketing-hcp"'),
    brand: z.string().describe('Brand/product name identified in the email'),
    approvalCode: z.string().optional().describe('Regulatory approval code if found'),
  }),
  primitiveTokens: PrimitiveTokens,
  semanticTokens: z.object({
    colors: SemanticColorTokens,
    typography: SemanticTypographyTokens,
  }),
  componentTokens: z.object({
    ctaButton: CTAButtonToken,
    ctaLinks: z.array(CTALinkToken).describe('All distinct CTA link styles found'),
    claimBlocks: z.array(ClaimBlockToken).describe('All claim block styles found'),
    isiBlock: ISIBlockToken,
    adverseEventBlock: AdverseEventBlockToken,
    referenceBlock: ReferenceBlockToken,
    sectionCallouts: z.array(SectionCalloutToken).describe('Highlight/callout section styles'),
    preheader: PreheaderToken,
    footer: FooterToken,
    layout: LayoutToken,
  }),
});

export {
  PrimitiveTokens,
  SemanticColorTokens,
  SemanticTypographyTokens,
  CTAButtonToken,
  CTALinkToken,
  ClaimBlockToken,
  ISIBlockToken,
  AdverseEventBlockToken,
  ReferenceBlockToken,
  PreheaderToken,
  FooterToken,
  LayoutToken,
  SectionCalloutToken,
};
