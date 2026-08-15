"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { formatCurrency } from "@/lib/utils/currency";
import type { SpendingBucket } from "@/lib/types";

const PALETTE = [
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

export function SpendingPie({
  data,
  currency,
}: {
  data: SpendingBucket[];
  currency: string;
}) {
  const chart = data.map((d) => ({ name: d.tagName, value: d.amount }));
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
                <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "#1a1a24",
                border: "1px solid #26262f",
                borderRadius: 12,
                fontSize: 12,
                color: "#e8e8ee",
              }}
              formatter={(value) => formatCurrency(Number(value), currency)}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[11px] uppercase tracking-wide text-muted-2">
            Total
          </span>
          <span className="text-lg font-semibold">
            {formatCurrency(total, currency)}
          </span>
        </div>
      </div>

      <ul className="space-y-2">
        {data.map((d, i) => (
          <li key={d.tagId ?? "uncat"} className="flex items-center gap-2 text-sm">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ background: PALETTE[i % PALETTE.length] }}
            />
            <span className="flex-1 truncate text-muted">{d.tagName}</span>
            <span className="font-medium">
              {formatCurrency(d.amount, currency)}
            </span>
            <span className="w-10 text-right text-xs text-muted-2">
              {total > 0 ? Math.round((d.amount / total) * 100) : 0}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
