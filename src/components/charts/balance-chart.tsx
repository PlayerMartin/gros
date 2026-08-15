"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { compactCurrency, formatCurrency } from "@/lib/utils/currency";
import type { BalancePoint } from "@/lib/types";

export function BalanceChart({
  data,
  currency,
}: {
  data: BalancePoint[];
  currency: string;
}) {
  if (data.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-muted-2">
        No balance data yet
      </div>
    );
  }

  // Accept whatever recharts hands the axis: the raw date string (category
  // ticks), a timestamp (number), or a Date. Never emit "Invalid Date".
  const fmtDate = (v: unknown) => {
    if (v == null) return "";
    const s = String(v);
    const date = /^\d{4}-\d{2}-\d{2}$/.test(s)
      ? new Date(s + "T00:00:00")
      : v instanceof Date
        ? v
        : typeof v === "number"
          ? new Date(v)
          : new Date(s);
    if (Number.isNaN(date.getTime())) return s;
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 4, left: 4, bottom: 0 }}>
          <defs>
            <linearGradient id="balance" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#34d399" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#34d399" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#26262f" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={fmtDate}
            tick={{ fill: "#6c6c7a", fontSize: 12 }}
            axisLine={{ stroke: "#26262f" }}
            tickLine={false}
            minTickGap={40}
          />
          <YAxis
            tickFormatter={(v) => compactCurrency(Number(v), currency)}
            tick={{ fill: "#6c6c7a", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            width={56}
            domain={["auto", "auto"]}
          />
          <Tooltip
            formatter={(value) => formatCurrency(Number(value), currency)}
            labelFormatter={(_, payload) =>
              payload?.[0]?.payload?.date
                ? fmtDate((payload[0].payload as BalancePoint).date)
                : ""
            }
            contentStyle={{
              background: "#1a1a24",
              border: "1px solid #26262f",
              borderRadius: 12,
              fontSize: 13,
              color: "#e8e8ee",
            }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#34d399"
            strokeWidth={2}
            fill="url(#balance)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
