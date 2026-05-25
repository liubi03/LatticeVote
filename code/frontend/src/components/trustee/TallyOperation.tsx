import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart3,
  Lock,
  Unlock,
  CheckCircle,
  Zap,
  Shield,
  X,
  Loader2,
} from 'lucide-react'
import Button from '../common/Button'
import type { Project, TallyResult } from '../../types/index'

interface TallyOperationProps {
  project: Project
  onComplete: (result: TallyResult) => void
  onCancel: () => void
}

type TallyPhase = 'idle' | 'decrypting' | 'aggregating' | 'computing' | 'complete'

const phaseConfig: Record<TallyPhase, { label: string; description: string }> = {
  idle: {
    label: '准备就绪',
    description: '点击开始按钮执行同态计票',
  },
  decrypting: {
    label: '解密选票',
    description: '使用私钥对加密选票进行解密...',
  },
  aggregating: {
    label: '聚合选票',
    description: '利用同态性质聚合所有选票...',
  },
  computing: {
    label: '计算结果',
    description: '计算各候选人最终得票数...',
  },
  complete: {
    label: '计票完成',
    description: '所有选票已成功统计',
  },
}

export default function TallyOperation({ project, onComplete, onCancel }: TallyOperationProps) {
  const [phase, setPhase] = useState<TallyPhase>('idle')
  const [progress, setProgress] = useState(0)
  const [decryptedCount, setDecryptedCount] = useState(0)
  const [showLatticeAnimation, setShowLatticeAnimation] = useState(false)

  const totalVotes = 89

  const latticeDelays = [0.5, 1.2, 0.8, 1.5, 0.3, 1.8, 0.6, 1.1, 0.9, 1.4, 0.7, 1.3, 0.4, 1.6, 0.2, 1.9, 0.55, 1.25, 0.85, 1.45, 0.35, 1.85, 0.65, 1.15, 0.95, 1.35, 0.75, 1.25, 0.45, 1.55, 0.25, 1.95, 0.52, 1.22, 0.82, 1.42, 0.32, 1.82, 0.62, 1.12, 0.92, 1.32, 0.72, 1.23, 0.42, 1.52, 0.22, 1.92, 0.58, 1.28, 0.88, 1.48, 0.38, 1.88, 0.68, 1.18, 0.98, 1.38, 0.78, 1.28]

  const handleComplete = useCallback(() => {
    const mockResults = project.candidates.map(() => Math.floor(Math.random() * 50) + 10)
    const winnerIndex = mockResults.indexOf(Math.max(...mockResults))

    setTimeout(() => {
      onComplete({
        project_id: project.project_id,
        results: mockResults,
        candidates: project.candidates,
        winner: project.candidates[winnerIndex],
        winner_index: winnerIndex,
        total_votes: mockResults.reduce((a, b) => a + b, 0),
      })
    }, 500)
  }, [project, onComplete])

  useEffect(() => {
    if (phase === 'decrypting') {
      const timeout = setTimeout(() => setShowLatticeAnimation(true), 0)
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval)
            setPhase('aggregating')
            return 100
          }
          setDecryptedCount(Math.floor((prev / 100) * totalVotes))
          return prev + 2
        })
      }, 50)
      return () => {
        clearTimeout(timeout)
        clearInterval(interval)
      }
    }

    if (phase === 'aggregating') {
      const timeout = setTimeout(() => setProgress(0), 0)
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval)
            setPhase('computing')
            return 100
          }
          return prev + 3
        })
      }, 40)
      return () => {
        clearTimeout(timeout)
        clearInterval(interval)
      }
    }

    if (phase === 'computing') {
      const timeout = setTimeout(() => setProgress(0), 0)
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval)
            setPhase('complete')
            setShowLatticeAnimation(false)
            handleComplete()
            return 100
          }
          return prev + 5
        })
      }, 30)
      return () => {
        clearTimeout(timeout)
        clearInterval(interval)
      }
    }
  }, [phase, handleComplete])

  const handleStartTally = () => {
    setPhase('decrypting')
    setProgress(0)
    setDecryptedCount(0)
  }

  return (
    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              animate={phase !== 'idle' ? { rotate: 360 } : {}}
              transition={{ duration: 2, repeat: phase !== 'idle' ? Infinity : 0, ease: 'linear' }}
            >
              <BarChart3 className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <h2 className="text-xl font-bold text-white">同态计票</h2>
              <p className="text-indigo-200 text-sm">{project.name}</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-1 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-4 border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-indigo-500" />
              <span className="text-sm font-medium text-slate-700">加密算法</span>
            </div>
            <p className="text-lg font-bold text-slate-900">基于格的公钥加密</p>
          </div>
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-4 border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-amber-500" />
              <span className="text-sm font-medium text-slate-700">同态性质</span>
            </div>
            <p className="text-lg font-bold text-slate-900">加法同态</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-indigo-50 rounded-xl p-6 mb-6 border border-indigo-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {phase === 'complete' ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : phase === 'idle' ? (
                <Lock className="w-5 h-5 text-indigo-500" />
              ) : (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <Loader2 className="w-5 h-5 text-indigo-500" />
                </motion.div>
              )}
              <span className="font-semibold text-gray-800">{phaseConfig[phase].label}</span>
            </div>
            {phase !== 'idle' && phase !== 'complete' && (
              <span className="text-sm text-indigo-600 font-medium">{progress}%</span>
            )}
          </div>

          <p className="text-gray-600 text-sm mb-4">{phaseConfig[phase].description}</p>

          {phase !== 'idle' && phase !== 'complete' && (
            <div className="relative h-3 bg-white rounded-full overflow-hidden shadow-inner">
              <motion.div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
              <motion.div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-white/30 to-transparent rounded-full"
                animate={{ x: ['0%', '200%'] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                style={{ width: '50%' }}
              />
            </div>
          )}

          {phase === 'decrypting' && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-indigo-600 mt-3"
            >
              已解密 {decryptedCount} / {totalVotes} 张选票
            </motion.p>
          )}
        </div>

        {showLatticeAnimation && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-6"
          >
            <div className="bg-slate-900 rounded-xl p-4 overflow-hidden">
              <p className="text-slate-400 text-xs mb-3 font-mono">格点同态运算可视化</p>
              <div className="grid grid-cols-10 gap-1">
                {latticeDelays.map((delay, i) => (
                  <motion.div
                    key={i}
                    className="aspect-square rounded-sm"
                    initial={{ backgroundColor: 'rgba(99, 102, 241, 0.3)' }}
                    animate={{
                      backgroundColor: [
                        'rgba(99, 102, 241, 0.3)',
                        'rgba(168, 85, 247, 0.8)',
                        'rgba(99, 102, 241, 0.3)',
                      ],
                      scale: [1, 1.2, 1],
                    }}
                    transition={{
                      duration: 0.8,
                      delay: i * 0.02,
                      repeat: Infinity,
                      repeatDelay: delay,
                    }}
                  />
                ))}
              </div>
              <div className="mt-3 flex items-center gap-2">
                <motion.div
                  className="w-2 h-2 rounded-full bg-indigo-500"
                  animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
                <span className="text-slate-400 text-xs font-mono">
                  E(v₁) ⊕ E(v₂) = E(v₁ + v₂)
                </span>
              </div>
            </div>
          </motion.div>
        )}

        <div className="space-y-3 mb-6">
          {(['decrypting', 'aggregating', 'computing'] as TallyPhase[]).map((p, index) => {
            const isActive = phase === p
            const isComplete =
              (phase === 'aggregating' && index === 0) ||
              (phase === 'computing' && index <= 1) ||
              (phase === 'complete' && index <= 2)

            return (
              <motion.div
                key={p}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${isActive
                    ? 'bg-indigo-50 border-indigo-200'
                    : isComplete
                      ? 'bg-green-50 border-green-200'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                animate={{
                  x: isActive ? [0, 5, 0] : 0,
                }}
                transition={{ duration: 0.5, repeat: isActive ? Infinity : 0 }}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${isActive
                      ? 'bg-indigo-500 text-white'
                      : isComplete
                        ? 'bg-green-500 text-white'
                        : 'bg-slate-300 text-slate-500'
                    }`}
                >
                  {isComplete ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : isActive ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      <Loader2 className="w-4 h-4" />
                    </motion.div>
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </div>
                <div className="flex-1">
                  <p
                    className={`font-medium ${isActive ? 'text-indigo-700' : isComplete ? 'text-green-700' : 'text-slate-500'}`}
                  >
                    {phaseConfig[p].label}
                  </p>
                  <p
                    className={`text-xs ${isActive ? 'text-indigo-500' : isComplete ? 'text-green-500' : 'text-slate-400'}`}
                  >
                    {phaseConfig[p].description}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </div>

        <div className="flex gap-3">
          {phase === 'idle' && (
            <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant="primary"
                onClick={handleStartTally}
                className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-lg"
              >
                <Unlock className="w-5 h-5 mr-2" />
                开始计票
              </Button>
            </motion.div>
          )}
          {phase !== 'idle' && phase !== 'complete' && (
            <Button variant="outline" onClick={onCancel} className="flex-1 py-3">
              取消计票
            </Button>
          )}
          {phase === 'complete' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-3 rounded-lg flex-1 justify-center"
            >
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">计票成功完成</span>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
