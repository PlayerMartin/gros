"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { formatCurrency } from "@/lib/utils/currency";
import { tagColor } from "@/lib/utils/colors";
import type { SpendingBucket } from "@/lib/types";

export function SpendingPie({
  data,
  currency,
}: {
  data: SpendingBucket[];
  currency: string;
}) {
  const chart = data.map((d) => ({
    tagId: d.tagId,
    name: d.tagName,
    value: d.amount,
  }));
  const total = data.reduce((s, d) => s + d.amount, 0);

  if (data.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-muted-2">
        No spending in this period
      </div>
    );
  }

  // Keep the centered total inside the donut hole at any magnitude, with a
  // comfortable clear zone between the figure and the ring's inner edge.
  // IBM Plex Mono advances ~0.58em per glyph, so the figure's size is derived
  // from the length of its own formatted text (never a hard-coded step that
  // large balances overflow). The hole grows (innerRadius 52 → 66) as a last
  // resort so the 12px boundary is preserved while the ring keeps a readable
  // minimum thickness.
  const totalLabel = formatCurrency(total, currency);
  const GLYPH_FACTOR = 0.58;
  const HOLE_PAD_PX = 12; // minimum gap between figure edge and ring
  const TARGET_TEXT_PX = 88; // figure width sized for the default hole
  const sizePx = Math.min(
    20, // text-xl
    Math.max(10.5, TARGET_TEXT_PX / (totalLabel.length * GLYPH_FACTOR))
  );
  const textWidthPx = totalLabel.length * GLYPH_FACTOR * sizePx;
  const innerRadius = Math.min(
    66,
    Math.max(52, Math.ceil(textWidthPx / 2) + HOLE_PAD_PX)
  );

  return (
    <div className="space-y-4">
      <div className="relative mx-auto h-48 w-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chart}
              dataKey="value"
              nameKey="name"
              innerRadius={innerRadius}
              outerRadius={80}
              paddingAngle={2}
              strokeWidth={0}
            >
              {chart.map((_, i) => (
                <Cell key={i} fill={tagColor(chart[i].tagId, chart[i].name)} />
              ))}
            </Pie>
            <Tooltip
              cursor={false}
              position={{ x: 178, y: 112 }}
              allowEscapeViewBox={{ x: true, y: true }}
              content={({ active, payload }) => {
                if (!active || !payload || payload.length === 0) return null;
                const item = payload[0];
                return (
                  <div className="min-w-[9rem] max-w-[13rem] rounded-xl border border-border bg-surface-2 px-3 py-2 shadow-xl">
                    <p className="truncate text-xs font-medium text-muted">
                      {item.name}
                    </p>
                    <p className="font-mono text-base font-semibold text-gold">
                      {formatCurrency(Number(item.value), currency)}
                    </p>
                  </div>
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[10px] uppercase tracking-[0.18em] text-muted-2">
            Total
          </span>
          <span className="mt-1 font-mono font-semibold leading-none whitespace-nowrap text-gold tabular-nums" style={{ fontSize: `${sizePx.toFixed(1)}px` }}>
            {totalLabel}
          </span>
        </div>
      </div>

      <ul className="space-y-2">
        {data.map((d) => (
          <li
            key={d.tagId ?? "uncat"}
            className="flex items-center gap-2.5 text-sm"
          >
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ background: tagColor(d.tagId, d.tagName) }}
            />
            <span className="flex-1 truncate text-muted">{d.tagName}</span>
            <span className="font-mono text-base font-semibold text-ember">
              {formatCurrency(d.amount, currency)}
            </span>
            <span className="w-10 text-right text-sm tabular-nums text-muted-2">
              {total > 0 ? Math.round((d.amount / total) * 100) : 0}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}