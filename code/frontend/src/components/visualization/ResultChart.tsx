import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LabelList,
} from 'recharts';
import { motion } from 'framer-motion';
import { BarChart3, PieChart as PieChartIcon, Trophy } from 'lucide-react';

interface ChartData {
  name: string;
  votes: number;
  color: string;
}

interface ResultChartProps {
  data: ChartData[];
  title?: string;
}

const ResultChart: React.FC<ResultChartProps> = ({ data, title = '投票结果统计' }) => {
  const totalVotes = data.reduce((sum, item) => sum + item.votes, 0);
  const maxVotes = Math.max(...data.map((item) => item.votes));
  const winner = data.find((item) => item.votes === maxVotes);

  const pieData = data.map((item) => ({
    ...item,
    percentage: totalVotes > 0 ? ((item.votes / totalVotes) * 100).toFixed(1) : '0',
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 shadow-xl">
          <p className="text-white font-medium">{label}</p>
          <p className="text-indigo-400">
            得票数: <span className="font-bold">{payload[0].value}</span>
          </p>
          <p className="text-slate-400 text-sm">
            占比: {totalVotes > 0 ? ((payload[0].value / totalVotes) * 100).toFixed(1) : 0}%
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 shadow-xl">
          <p className="text-white font-medium">{payload[0].name}</p>
          <p className="text-indigo-400">
            得票数: <span className="font-bold">{payload[0].value}</span>
          </p>
          <p className="text-slate-400 text-sm">占比: {payload[0].payload.percentage}%</p>
        </div>
      );
    }
    return null;
  };

  const renderCustomLabel = (props: any) => {
    const { x, y, width, height, value } = props;
    const centerX = x + width / 2;
    const centerY = y + height / 2;

    if (value === 0) return null;

    return (
      <text
        x={centerX}
        y={centerY}
        fill="white"
        textAnchor="middle"
        dominantBaseline="middle"
        className="font-bold text-sm"
      >
        {value}
      </text>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 shadow-xl"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/20 rounded-lg">
            <BarChart3 className="w-6 h-6 text-indigo-400" />
          </div>
          <h3 className="text-xl font-bold text-white">{title}</h3>
        </div>
        {winner && winner.votes > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500/20 rounded-lg border border-yellow-500/30"
          >
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span className="text-yellow-400 text-sm font-medium">
              获胜者: {winner.name}
            </span>
          </motion.div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <BarChart3 className="w-4 h-4" />
            <span>得票数柱状图</span>
          </div>
          <div className="h-[300px] bg-slate-800/30 rounded-xl p-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis
                  dataKey="name"
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  axisLine={{ stroke: '#475569' }}
                  tickLine={{ stroke: '#475569' }}
                />
                <YAxis
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  axisLine={{ stroke: '#475569' }}
                  tickLine={{ stroke: '#475569' }}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="votes" radius={[8, 8, 0, 0]}>
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      stroke={entry.votes === maxVotes && entry.votes > 0 ? '#fbbf24' : 'transparent'}
                      strokeWidth={entry.votes === maxVotes && entry.votes > 0 ? 2 : 0}
                    />
                  ))}
                  <LabelList content={renderCustomLabel} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <PieChartIcon className="w-4 h-4" />
            <span>得票比例饼图</span>
          </div>
          <div className="h-[300px] bg-slate-800/30 rounded-xl p-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="votes"
                  animationBegin={0}
                  animationDuration={1000}
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      stroke={entry.votes === maxVotes && entry.votes > 0 ? '#fbbf24' : '#1e293b'}
                      strokeWidth={entry.votes === maxVotes && entry.votes > 0 ? 3 : 1}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
                <Legend
                  formatter={(value: string, entry: any) => (
                    <span className="text-slate-300 text-sm">
                      {value} ({entry.payload.percentage}%)
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-3">
        {data.map((item, index) => (
          <motion.div
            key={item.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`bg-slate-800/50 rounded-xl p-3 border ${
              item.votes === maxVotes && item.votes > 0
                ? 'border-yellow-500/50'
                : 'border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-400">{item.name}</span>
              {item.votes === maxVotes && item.votes > 0 && (
                <Trophy className="w-4 h-4 text-yellow-400" />
              )}
            </div>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-bold" style={{ color: item.color }}>
                {item.votes}
              </span>
              <span className="text-sm text-slate-500 pb-1">
                ({totalVotes > 0 ? ((item.votes / totalVotes) * 100).toFixed(1) : 0}%)
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-slate-800/30 rounded-lg border border-slate-700/50">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400">总投票数</span>
          <span className="text-white font-bold">{totalVotes} 票</span>
        </div>
      </div>
    </motion.div>
  );
};

export default ResultChart;
