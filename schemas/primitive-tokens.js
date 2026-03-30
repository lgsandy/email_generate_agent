import { z } from 'zod';

export const ColorToken = z.object({
  name: z.string().describe('Semantic name for the color, e.g. "brand-blue-primary"'),
  value: z.string().describe('Hex color value, e.g. "#003593"'),
  opacity: z.number().nullable().describe('Opacity if applicable 0-1, null if not set'),
});

export const TypographyToken = z.object({
  name: z.string().describe('Semantic name for the typography style'),
  fontFamily: z.string().describe('Font family, e.g. "Arial"'),
  fontSize: z.string().describe('Font size with unit, e.g. "13px"'),
  fontWeight: z.string().describe('Font weight, e.g. "700" or "bold"'),
  lineHeight: z.string().describe('Line height with unit, e.g. "15px" or "120%"'),
  letterSpacing: z.string().nullable().describe('Letter spacing if set, null if not set'),
  textTransform: z.string().nullable().describe('Text transform if set e.g. "uppercase", null if not set'),
});

export const SpacingToken = z.object({
  name: z.string().describe('Semantic name for the spacing value'),
  value: z.string().describe('Spacing value with unit, e.g. "20px"'),
  context: z.string().describe('Where this spacing is used, e.g. "section-padding-top"'),
});

export const BorderToken = z.object({
  name: z.string().describe('Semantic name for the border style'),
  width: z.string().describe('Border width, e.g. "1.5px"'),
  style: z.string().describe('Border style, e.g. "solid"'),
  color: z.string().describe('Border color, e.g. "#000000"'),
  radius: z.string().describe('Border radius, e.g. "0px"'),
});

export const PrimitiveTokens = z.object({
  colors: z.array(ColorToken).describe('All unique colors found in the email'),
  typography: z.array(TypographyToken).describe('All unique typography combinations'),
  spacing: z.array(SpacingToken).describe('Key spacing values used'),
  borders: z.array(BorderToken).describe('All unique border styles'),
});
