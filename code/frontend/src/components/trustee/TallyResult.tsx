import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { Trophy, X, Download, CheckCircle, Users, Vote } from 'lucide-react'
import Button from '../common/Button'
import type { TallyResult as TallyResultType } from '../../types/index'

interface TallyResultProps {
  result: TallyResultType
  projectName: string
  onClose: () => void
}

const COLORS = [
  '#6366f1',
  '#8b5cf6',
  '#a855f7',
  '#d946ef',
  '#ec4899',
  '#f43f5e',
  '#f97316',
  '#eab308',
]

export default function TallyResult({ result, projectName, onClose }: TallyResultProps) {
  const [animatedResults, setAnimatedResults] = useState(
    result.candidates.map((candidate) => ({
      name: candidate,
      votes: 0,
      percentage: 0,
    }))
  )

  useEffect(() => {
    const total = result.total_votes
    const duration = 1500
    const steps = 60
    const interval = duration / steps

    let currentStep = 0
    const timer = setInterval(() => {
      currentStep++
      const progress = Math.min(currentStep / steps, 1)

      setAnimatedResults(
        result.candidates.map((candidate, index) => ({
          name: candidate,
          votes: Math.round(result.results[index] * progress),
          percentage: Math.round((result.results[index] / total) * 100 * progress),
        }))
      )

      if (currentStep >= steps) {
        clearInterval(timer)
      }
    }, interval)

    return () => clearInterval(timer)
  }, [result])

  const chartData = animatedResults.map((item, index) => ({
    name: item.name,
    votes: item.votes,
    fill: COLORS[index % COLORS.length],
  }))

  const sortedResults = [...animatedResults]
    .map((item, index) => ({
      ...item,
      originalIndex: index,
      isWinner: index === result.winner_index,
    }))
    .sort((a, b) => b.votes - a.votes)

  const handleExport = () => {
    const exportData = {
      project: projectName,
      timestamp: new Date().toISOString(),
      results: result.candidates.map((candidate, index) => ({
        candidate,
        votes: result.results[index],
        percentage: ((result.results[index] / result.total_votes) * 100).toFixed(2) + '%',
      })),
      winner: result.winner,
      total_votes: result.total_votes,
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `tally-result-${result.project_id}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white rounded-2xl shadow-2xl overflow-hidden"
    >
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}
            >
              <Trophy className="w-6 h-6 text-yellow-300" />
            </motion.div>
            <div>
              <h2 className="text-xl font-bold text-white">计票结果</h2>
              <p className="text-indigo-200 text-sm">{projectName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      <div className="p-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50 rounded-xl p-6 mb-6 border border-amber-200"
        >
          <div className="flex items-center gap-4">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.5 }}
              className="p-4 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-xl shadow-lg"
            >
              <Trophy className="w-8 h-8 text-white" />
            </motion.div>
            <div className="flex-1">
              <p className="text-amber-700 text-sm font-medium mb-1">获胜者</p>
              <motion.h3
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="text-3xl font-bold text-amber-900"
              >
                {result.winner}
              </motion.h3>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="text-amber-600 mt-1"
              >
                得票率:{' '}
                {((result.results[result.winner_index] / result.total_votes) * 100).toFixed(1)}%
              </motion.p>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1 }}
              className="text-right"
            >
              <div className="flex items-center gap-2 text-amber-700">
                <Vote className="w-5 h-5" />
                <span className="text-2xl font-bold">{result.total_votes}</span>
              </div>
              <p className="text-amber-600 text-sm">总票数</p>
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mb-6"
        >
          <h4 className="text-lg font-semibold text-gray-800 mb-4">得票分布</h4>
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData} layout="vertical" margin={{ left: 80, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" tick={{ fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fill: '#334155', fontSize: 14 }}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                  formatter={(value: number) => [`${value} 票`, '得票数']}
                />
                <Bar dataKey="votes" radius={[0, 4, 4, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mb-6"
        >
          <h4 className="text-lg font-semibold text-gray-800 mb-4">详细结果</h4>
          <div className="overflow-hidden rounded-xl border border-slate-200">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-100">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                    排名
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                    候选人
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">
                    得票数
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">
                    得票率
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-slate-700">
                    状态
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedResults.map((item, index) => (
                  <motion.tr
                    key={item.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                    className={`border-t border-slate-200 ${item.isWinner ? 'bg-amber-50' : 'bg-white hover:bg-slate-50'
                      } transition-colors`}
                  >
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${index === 0
                            ? 'bg-amber-400 text-white'
                            : index === 1
                              ? 'bg-slate-300 text-slate-700'
                              : index === 2
                                ? 'bg-amber-600 text-white'
                                : 'bg-slate-100 text-slate-500'
                          }`}
                      >
                        {index + 1}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-medium ${item.isWinner ? 'text-amber-900' : 'text-slate-800'}`}
                        >
                          {item.name}
                        </span>
                        {item.isWinner && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 300 }}
                          >
                            <Trophy className="w-4 h-4 text-amber-500" />
                          </motion.span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-semibold text-slate-800">{item.votes}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-20 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full rounded-full"
                            style={{ backgroundColor: COLORS[item.originalIndex] }}
                            initial={{ width: 0 }}
                            animate={{ width: `${item.percentage}%` }}
                            transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                          />
                        </div>
                        <span className="text-sm text-slate-600 w-12 text-right">
                          {item.percentage}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {item.isWinner ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          <CheckCircle className="w-3 h-3" />
                          当选
                        </span>
                      ) : (
                        <span className="text-slate-400 text-sm">-</span>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="flex items-center justify-between pt-4 border-t border-slate-200"
        >
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{result.candidates.length} 位候选人</span>
            </div>
            <div className="flex items-center gap-1">
              <Vote className="w-4 h-4" />
              <span>{result.total_votes} 张有效票</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="w-4 h-4 mr-1" />
              导出结果
            </Button>
            <Button variant="primary" size="sm" onClick={onClose}>
              关闭
            </Button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
