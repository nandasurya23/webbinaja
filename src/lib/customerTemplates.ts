// Split out from customerScaffold.ts (which imports node:fs/node:path) so
// client components can import just the template list without pulling
// Node-only modules into the browser bundle.
export const CUSTOMER_TEMPLATES = [
  'barber', 'restaurant', 'professional', 'bakery', 'rental', 'gamecafe', 'gym', 'petshop', 'custom',
] as const;

export type CustomerTemplate = (typeof CUSTOMER_TEMPLATES)[number];

export function isKnownTemplate(value: string): value is CustomerTemplate {
  return (CUSTOMER_TEMPLATES as readonly string[]).includes(value);
}
