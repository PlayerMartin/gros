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

  return (
    <div className="space-y-4">
      <div className="relative mx-auto h-48 w-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chart}
              dataKey="value"
              nameKey="name"
              innerRadius={52}
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
                    <p className="font-mono text-base font-semibold">
                      {formatCurrency(Number(item.value), currency)}
                    </p>
                  </div>
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[11px] uppercase tracking-wide text-muted-2">
            Total
          </span>
          <span className="text-xl font-semibold">
            {formatCurrency(total, currency)}
          </span>
        </div>
      </div>

      <ul className="space-y-2">
        {data.map((d) => (
          <li key={d.tagId ?? "uncat"} className="flex items-center gap-2 text-sm">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ background: tagColor(d.tagId, d.tagName) }}
            />
            <span className="flex-1 truncate text-muted">{d.tagName}</span>
            <span className="text-base font-medium">
              {formatCurrency(d.amount, currency)}
            </span>
            <span className="w-10 text-right text-sm text-muted-2">
              {total > 0 ? Math.round((d.amount / total) * 100) : 0}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
