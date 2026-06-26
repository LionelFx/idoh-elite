"use client";

import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, BarChart, Bar,
} from "recharts";

interface DayData {
  date: string;
  revenue: number;
  orders: number;
}

interface Props {
  data: DayData[];
  mode: "revenue" | "orders";
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function RevenueTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1e1e1e] border border-white/10 rounded-lg px-3 py-2 text-xs">
      <p className="text-white/50 mb-1">{label}</p>
      <p className="text-[#FF9D3D] font-bold">{Number(payload[0].value).toFixed(2)} €</p>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function OrdersTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1e1e1e] border border-white/10 rounded-lg px-3 py-2 text-xs">
      <p className="text-white/50 mb-1">{label}</p>
      <p className="text-[#FF9D3D] font-bold">{payload[0].value} commande{payload[0].value > 1 ? "s" : ""}</p>
    </div>
  );
}

export default function SalesChart({ data, mode }: Props) {
  if (data.length === 0) return (
    <div className="flex items-center justify-center h-48 text-white/20 text-sm">
      Pas encore de données
    </div>
  );

  const xProps = {
    dataKey: "date",
    tick: { fill: "rgba(255,255,255,0.3)", fontSize: 10 },
    axisLine: false as const,
    tickLine: false as const,
  };
  const yProps = {
    tick: { fill: "rgba(255,255,255,0.3)", fontSize: 10 },
    axisLine: false as const,
    tickLine: false as const,
  };

  if (mode === "revenue") {
    return (
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis {...xProps} />
          <YAxis {...yProps} width={50}
            tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(1)}k€` : `${v}€`} />
          <Tooltip content={<RevenueTooltip />} />
          <Line type="monotone" dataKey="revenue" stroke="#FF9D3D" strokeWidth={2}
            dot={false} activeDot={{ r: 4, fill: "#FF9D3D" }} />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis {...xProps} />
        <YAxis {...yProps} width={30} allowDecimals={false} />
        <Tooltip content={<OrdersTooltip />} />
        <Bar dataKey="orders" fill="#FF9D3D" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
