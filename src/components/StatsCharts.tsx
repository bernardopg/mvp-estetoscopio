"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface WeeklyData {
  date: string;
  day: string;
  cardsStudied: number;
  timeSpent: number;
}

interface DifficultyData {
  again: number;
  hard: number;
  good: number;
  easy: number;
}

interface StatsChartsProps {
  weeklyData: WeeklyData[];
  difficultyData: DifficultyData;
}

const DIFFICULTY_COLORS = {
  again: "#ef4444", // red-500
  hard: "#f97316", // orange-500
  good: "#3b82f6", // blue-500
  easy: "#10b981", // green-500
};

const DIFFICULTY_LABELS = {
  again: "Novamente",
  hard: "Difícil",
  good: "Bom",
  easy: "Fácil",
};

export default function StatsCharts({
  weeklyData,
  difficultyData,
}: StatsChartsProps) {
  // Preparar dados para o gráfico de pizza
  const pieData = [
    { name: DIFFICULTY_LABELS.again, value: difficultyData.again },
    { name: DIFFICULTY_LABELS.hard, value: difficultyData.hard },
    { name: DIFFICULTY_LABELS.good, value: difficultyData.good },
    { name: DIFFICULTY_LABELS.easy, value: difficultyData.easy },
  ].filter((item) => item.value > 0);

  return (
    <div className="space-y-8">
      {/* Gráfico de Desempenho Semanal */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-zinc-200 dark:border-zinc-800">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
          Desempenho Semanal
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={weeklyData}>
            <defs>
              <linearGradient id="colorCards" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              className="stroke-zinc-200 dark:stroke-zinc-800"
            />
            <XAxis
              dataKey="day"
              className="text-xs text-zinc-600 dark:text-zinc-400"
            />
            <YAxis className="text-xs text-zinc-600 dark:text-zinc-400" />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(24, 24, 27, 0.9)",
                border: "1px solid rgba(63, 63, 70, 0.5)",
                borderRadius: "0.5rem",
                color: "#fff",
              }}
              labelStyle={{ color: "#a1a1aa" }}
            />
            <Area
              type="monotone"
              dataKey="cardsStudied"
              stroke="#3b82f6"
              fillOpacity={1}
              fill="url(#colorCards)"
              name="Cards Estudados"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Gráfico de Tempo de Estudo */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-zinc-200 dark:border-zinc-800">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
            Tempo de Estudo (min)
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={weeklyData}>
              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-zinc-200 dark:stroke-zinc-800"
              />
              <XAxis
                dataKey="day"
                className="text-xs text-zinc-600 dark:text-zinc-400"
              />
              <YAxis className="text-xs text-zinc-600 dark:text-zinc-400" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(24, 24, 27, 0.9)",
                  border: "1px solid rgba(63, 63, 70, 0.5)",
                  borderRadius: "0.5rem",
                  color: "#fff",
                }}
                labelStyle={{ color: "#a1a1aa" }}
              />
              <Bar
                dataKey="timeSpent"
                fill="#8b5cf6"
                radius={[8, 8, 0, 0]}
                name="Minutos"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de Distribuição de Dificuldade */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-zinc-200 dark:border-zinc-800">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
            Distribuição de Dificuldade
          </h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(props: { name?: string; percent?: number }) => {
                    const name = props.name || "";
                    const percent = props.percent || 0;
                    return `${name}: ${(percent * 100).toFixed(0)}%`;
                  }}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        DIFFICULTY_COLORS[
                          Object.keys(DIFFICULTY_LABELS)[
                            Object.values(DIFFICULTY_LABELS).indexOf(entry.name)
                          ] as keyof typeof DIFFICULTY_COLORS
                        ]
                      }
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(24, 24, 27, 0.9)",
                    border: "1px solid rgba(63, 63, 70, 0.5)",
                    borderRadius: "0.5rem",
                    color: "#fff",
                  }}
                />
                <Legend
                  wrapperStyle={{
                    paddingTop: "20px",
                    fontSize: "14px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[250px] text-zinc-500 dark:text-zinc-400">
              <p>Nenhum dado disponível ainda</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
