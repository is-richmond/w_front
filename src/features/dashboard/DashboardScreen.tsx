import { useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useDashboard } from './dashboard.api';
import { LogWeightSheet } from '@/features/weight/LogWeightSheet';

const fmtDay = (iso: string) => iso.slice(5).replace('-', '/'); // MM/DD

export function DashboardScreen() {
  const [days, setDays] = useState(30);
  const [showWeight, setShowWeight] = useState(false);
  const { data, isLoading, isError } = useDashboard(days);

  if (isLoading) return <CenterMsg>Loading dashboard…</CenterMsg>;
  if (isError || !data) return <CenterMsg>Couldn't load dashboard.</CenterMsg>;

  const weightSeries = data.series.filter((p) => p.weightKg != null);
  const goal = data.dailyCalorieGoal;

  return (
    <div className="space-y-6 px-4 pb-24 pt-4">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex gap-1 rounded-full bg-slate-800 p-1 text-sm">
          {[7, 30, 90].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`rounded-full px-3 py-1 ${
                days === d ? 'bg-brand text-slate-950' : 'text-slate-300'
              }`}
            >
              {d}d
            </button>
          ))}
        </div>
      </header>

      {/* Summary stat cards */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Avg kcal" value={data.summary.avgCalories || '—'} />
        <StatCard
          label="Weight"
          value={
            data.summary.latestWeightKg != null
              ? `${data.summary.latestWeightKg} kg`
              : '—'
          }
        />
        <StatCard
          label="Change"
          value={
            data.summary.weightChangeKg != null
              ? `${data.summary.weightChangeKg > 0 ? '+' : ''}${data.summary.weightChangeKg} kg`
              : '—'
          }
          tone={
            data.summary.weightChangeKg != null && data.summary.weightChangeKg < 0
              ? 'good'
              : 'neutral'
          }
        />
      </div>

      {/* Weight trend */}
      <Card title="Weight trend">
        {weightSeries.length === 0 ? (
          <Empty>No weight logged yet.</Empty>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={weightSeries}>
              <defs>
                <linearGradient id="weightFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" tickFormatter={fmtDay} stroke="#64748b" fontSize={11} />
              <YAxis
                domain={['dataMin - 1', 'dataMax + 1']}
                stroke="#64748b"
                fontSize={11}
                width={32}
              />
              <Tooltip content={<ChartTooltip unit="kg" />} />
              <Area
                type="monotone"
                dataKey="weightKg"
                stroke="#38bdf8"
                strokeWidth={2}
                fill="url(#weightFill)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </Card>

      {/* Calorie budget */}
      <Card title="Daily calories">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data.series}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="date" tickFormatter={fmtDay} stroke="#64748b" fontSize={11} />
            <YAxis stroke="#64748b" fontSize={11} width={36} />
            <Tooltip content={<ChartTooltip unit="kcal" />} />
            {goal != null && (
              <ReferenceLine
                y={goal}
                stroke="#f59e0b"
                strokeDasharray="4 4"
                label={{ value: 'Goal', fill: '#f59e0b', fontSize: 11, position: 'right' }}
              />
            )}
            <Bar dataKey="calories" radius={[4, 4, 0, 0]}>
              {data.series.map((p, i) => (
                <Cell
                  key={i}
                  fill={goal != null && p.calories > goal ? '#f87171' : '#38bdf8'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <button
        onClick={() => setShowWeight(true)}
        className="fixed bottom-20 right-4 z-10 rounded-full bg-brand px-5 py-3 font-semibold text-slate-950 shadow-lg active:scale-95"
      >
        + Weight
      </button>

      {showWeight && <LogWeightSheet onClose={() => setShowWeight(false)} />}
    </div>
  );
}

function StatCard({
  label,
  value,
  tone = 'neutral',
}: {
  label: string;
  value: string | number;
  tone?: 'neutral' | 'good';
}) {
  return (
    <div className="rounded-2xl bg-slate-800/60 p-3 text-center">
      <div className="text-xs text-slate-400">{label}</div>
      <div
        className={`mt-1 text-lg font-semibold ${
          tone === 'good' ? 'text-emerald-400' : 'text-slate-100'
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl bg-slate-900 p-4">
      <h2 className="mb-3 text-sm font-medium text-slate-300">{title}</h2>
      {children}
    </section>
  );
}

function ChartTooltip({
  active,
  payload,
  label,
  unit,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
  unit: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm shadow-xl">
      <div className="text-slate-400">{label}</div>
      <div className="font-semibold text-slate-100">
        {payload[0]!.value} {unit}
      </div>
    </div>
  );
}

const CenterMsg = ({ children }: { children: React.ReactNode }) => (
  <div className="flex min-h-[60vh] items-center justify-center text-slate-400">
    {children}
  </div>
);

const Empty = ({ children }: { children: React.ReactNode }) => (
  <div className="py-12 text-center text-sm text-slate-500">{children}</div>
);
