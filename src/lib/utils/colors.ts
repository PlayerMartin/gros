/**
 * Shared tag colors for every view that shows tag-colored charts or lists.
 *
 * Colors are keyed deterministically by the tag id (hash of the id into the
 * palette), so a tag's color never shifts when other tags or transactions are
 * added. "Uncategorized" always keeps its own dedicated neutral color,
 * whether it appears as a null tag id or as the seeded "Uncategorized" tag.
 */
export const TAG_PALETTE = [
  "#34d399",
  "#60a5fa",
  "#fbbf24",
  "#fb7185",
  "#a78bfa",
  "#34d0d3",
  "#f97316",
  "#f472b6",
  "#4ade80",
  "#818cf8",
];

export const UNCATEGORIZED_COLOR = "#6c6c7a";

/**
 * Deterministic color for a tag. Uncategorized — a null tag id or the
 * seeded "Uncategorized" tag — always resolves to the fixed neutral gray,
 * so it can never be confused with a real tag's color.
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