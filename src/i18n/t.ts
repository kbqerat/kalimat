/**
 * Fill `{placeholder}` tokens in a translation string.
 * `t(dict.deck.lowStock, { count: 3 })`
 *
 * Deliberately kept in its own module (no `server-only` import anywhere in
 * its chain) so client components can use it too — unlike `getDictionary()`,
 * which reads the JSON dictionaries and must stay server-only.
 */
export function t(
  template: string,
  vars: Record<string, string | number> = {},
): string {
  return template.replace(/\{(\w+)\}/g, (_, key) =>
    key in vars ? String(vars[key]) : `{${key}}`,
  );
}
