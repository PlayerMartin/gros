/**
 * Shared tag colors for every view that shows tag-colored charts or lists.
 *
 * The palette is tuned for the warm "gold-on-ink" theme: earthy golds, rusts,
 * clays and sands plus two cool exceptions (sage, dusty blue) so adjacent
 * donut slices stay distinguishable on the near-black surface.
 *
 * Colors are keyed deterministically by the tag id (hash of the id into the
 * palette), so a tag's color never shifts when other tags or transactions are
 * added. "Uncategorized" always keeps its own dedicated neutral color,
 * whether it appears as a null tag id or as the seeded "Uncategorized" tag.
 */
export const TAG_PALETTE = [
  "#e3ab50", // gold
  "#b65d45", // terracotta
  "#a9a14c", // olive brass
  "#d9804a", // burnt copper
  "#8ba58f", // sage
  "#7c8fb5", // dusty blue
  "#c0a860", // pale brass
  "#a5713f", // umber
  "#b0769c", // mauve
  "#8a7a55", // khaki
];

export const UNCATEGORIZED_COLOR = "#5b5443";

/**
 * Deterministic color for a tag. Uncategorized — a null tag id or the
 * seeded "Uncategorized" tag — always resolves to the fixed neutral warm
 * gray, so it can never be confused with a real tag's color.
 */
export function tagColor(
  tagId: string | null,
  tagName?: string | null
): string {
  if (!tagId || tagName === "Uncategorized") return UNCATEGORIZED_COLOR;
  let h = 7;
  for (let i = 0; i < tagId.length; i++) {
    h = (h * 31 + tagId.charCodeAt(i)) >>> 0;
  }
  return TAG_PALETTE[h % TAG_PALETTE.length];
}