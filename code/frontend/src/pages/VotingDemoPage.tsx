import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Play, Pause, SkipForward, SkipBack, RotateCcw,
  Shield, Users, Vote, Calculator, Trophy,
  Lock, Unlock, CheckCircle, ArrowRight, Info
} from 'lucide-react'
import { Link } from 'react-router-dom'

const DEMO_DATA = {
  candidates: ['候选人 A', '候选人 B'],
  voters: [
    { id: 'voter1', name: '选民 1', choice: 0 },
    { id: 'voter2', name: '选民 2', choice: 1 },
    { id: 'voter3', name: '选民 3', choice: 0 },
  ],
  trustees: [
    { id: 'trustee1', name: '受托人 1' },
    { id: 'trustee2', name: '受托人 2' },
  ],
}

const STEPS = [
  { id: 0, name: '初始化', icon: Shield, description: '生成 BFV 同态加密密钥对' },
  { id: 1, name: '注册', icon: Users, description: '选民和受托人身份登记' },
  { id: 2, name: '投票', icon: Vote, description: '选民加密投票并提交' },
  { id: 3, name: '计票', icon: Calculator, description: '同态累加加密选票' },
  { id: 4, name: '结果', icon: Trophy, description: '解密并公布投票结果' },
]

export default function VotingDemoPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [subStep, setSubStep] = useState(0)

  useEffect(() => {
    if (isPlaying) {
      const timer = setInterval(() => {
        setSubStep(prev => prev + 1)
      }, 1500)
      return () => clearInterval(timer)
    }
  }, [isPlaying])

  const goToStep = (step: number) => {
    setCurrentStep(step)
    setSubStep(0)
    setIsPlaying(false)
  }

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      goToStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      goToStep(currentStep - 1)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return <InitStep subStep={subStep} />
      case 1:
        return <RegisterStep subStep={subStep} />
      case 2:
        return <VoteStep subStep={subStep} />
      case 3:
        return <TallyStep subStep={subStep} />
      case 4:
        return <ResultStep />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <div className="max-w-6xl mx-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            BFV 同态加密投票演示
          </h1>
          <p className="text-gray-400">
            基于格密码的后量子安全电子投票系统完整流程演示
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center mb-8"
        >
          <div className="flex items-center gap-2">
            {STEPS.map((step, index) => {
              const Icon = step.icon
              return (
                <motion.button
                  key={step.id}
                  onClick={() => goToStep(step.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${currentStep === step.id
                    ? 'bg-purple-600 text-white'
                    : currentStep > step.id
                      ? 'bg-purple-600/30 text-purple-300'
                      : 'bg-gray-800 text-gray-500'
                    }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon size={18} />
                  <span className="hidden sm:inline">{step.name}</span>
                </motion.button>
              )
            })}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-800/50 backdrop-blur rounded-2xl p-6 mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {(() => {
                const Icon = STEPS[currentStep].icon
                return <Icon size={24} className="text-purple-400" />
              })()}
              <div>
                <h2 className="text-xl font-semibold">{STEPS[currentStep].name}</h2>
                <p className="text-gray-400 text-sm">{STEPS[currentStep].description}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <motion.button
                onClick={() => goToStep(0)}
                className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <RotateCcw size={18} />
              </motion.button>
              <motion.button
                onClick={prevStep}
                disabled={currentStep === 0}
                className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 disabled:opacity-50"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <SkipBack size={18} />
              </motion.button>
              <motion.button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-2 rounded-lg bg-purple-600 hover:bg-purple-500"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {isPlaying ? <Pause size={18} /> : <Play size={18} />}
              </motion.button>
              <motion.button
                onClick={nextStep}
                disabled={currentStep === STEPS.length - 1}
                className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 disabled:opacity-50"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <SkipForward size={18} />
              </motion.button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderStepContent()}
            </motion.div>
          </AnimatePresence>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center"
        >
          <Link
            to="/login"
            className="text-purple-400 hover:text-purple-300 transition-colors"
          >
            ← 返回登录
          </Link>
        </motion.div>
      </div>
    </div>
  )
}

function InitStep({ subStep }: { subStep: number }) {
  const [latticeState, setLatticeState] = useState<{
    secretKey: { x: number, y: number } | null
    publicKey: { x: number, y: number } | null
    error: { x: number, y: number } | null
    noisePoints: { x: number, y: number }[]
  }>({
    secretKey: null,
    publicKey: null,
    error: null,
    noisePoints: []
  })

  useEffect(() => {
    if (subStep === 1) {
      setLatticeState({
        secretKey: { x: 3, y: 2 },
        publicKey: null,
        error: null,
        noisePoints: []
      })
    } else if (subStep === 2) {
      setLatticeState({
        secretKey: { x: 3, y: 2 },
        publicKey: { x: 6, y: 4 },
        error: null,
        noisePoints: []
      })
    } else if (subStep === 3) {
      setLatticeState({
        secretKey: { x: 3, y: 2 },
        publicKey: { x: 6, y: 4 },
        error: { x: 7, y: 5 },
        noisePoints: [
          { x: 6, y: 5 }, { x: 7, y: 4 }, { x: 7, y: 5 }, { x: 6, y: 4 }
        ]
      })
    }
  }, [subStep])

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div>
        <h3 className="text-lg font-semibold mb-4 text-purple-300">BFV 参数配置</h3>
        <div className="space-y-3">
          <motion.div
            className="bg-gray-700/50 p-3 rounded-lg"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: subStep >= 1 ? 1 : 0.5, x: 0 }}
          >
            <div className="flex justify-between items-center">
              <span className="text-gray-400">多项式环 R</span>
              <span className="font-mono text-green-400">ℤ[x]/(xⁿ+1), n=8192</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              多项式的系数是整数，模 xⁿ+1
            </p>
          </motion.div>

          <motion.div
            className="bg-gray-700/50 p-3 rounded-lg"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: subStep >= 2 ? 1 : 0.5, x: 0 }}
          >
            <div className="flex justify-between items-center">
              <span className="text-gray-400">明文模数 t</span>
              <span className="font-mono text-green-400">1032193</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              明文在 [0, t) 范围内
            </p>
          </motion.div>

          <motion.div
            className="bg-gray-700/50 p-3 rounded-lg"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: subStep >= 3 ? 1 : 0.5, x: 0 }}
          >
            <div className="flex justify-between items-center">
              <span className="text-gray-400">系数模数 q</span>
              <span className="font-mono text-green-400">≈ 2²¹⁸</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              密文系数在 [0, q) 范围内
            </p>
          </motion.div>
        </div>

        <motion.div
          className="mt-4 p-3 bg-purple-900/30 rounded-lg border border-purple-500/30"
          initial={{ opacity: 0 }}
          animate={{ opacity: subStep >= 4 ? 1 : 0 }}
        >
          <div className="flex items-center gap-2 text-purple-300 mb-2">
            <Lock size={18} />
            <span className="font-medium">密钥对已生成</span>
            <CheckCircle size={16} className="text-green-400" />
          </div>
          <div className="text-xs text-gray-400 space-y-1">
            <p>私钥 s: 格中的短向量（保密）</p>
            <p>公钥 (a, b): b = a·s + e（公开）</p>
            <p>误差 e: 小随机噪声（保密）</p>
          </div>
        </motion.div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4 text-purple-300">
          格上密钥生成示意
          <Info size={16} className="inline ml-2 text-gray-500" />
        </h3>
        <div className="bg-gray-900 rounded-lg p-4 aspect-square relative">
          <svg viewBox="0 0 8 8" className="w-full h-full">
            {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
              <g key={`grid-${i}`}>
                <line x1={i} y1="0" x2={i} y2="8" stroke="rgba(255,255,255,0.1)" strokeWidth="0.02" />
                <line x1="0" y1={i} x2="8" y2={i} stroke="rgba(255,255,255,0.1)" strokeWidth="0.02" />
              </g>
            ))}

            {[0, 1, 2, 3, 4, 5, 6, 7].map(i =>
              [0, 1, 2, 3, 4, 5, 6, 7].map(j => (
                <circle
                  key={`point-${i}-${j}`}
                  cx={i + 0.5}
                  cy={j + 0.5}
                  r="0.15"
                  fill="rgba(170, 59, 255, 0.3)"
                />
              ))
            )}

            {latticeState.noisePoints.map((p, i) => (
              <motion.circle
                key={`noise-${i}`}
                cx={p.x + 0.5}
                cy={p.y + 0.5}
                r="0.2"
                fill="rgba(245, 158, 11, 0.3)"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              />
            ))}

            {latticeState.secretKey && (
              <motion.circle
                cx={latticeState.secretKey.x + 0.5}
                cy={latticeState.secretKey.y + 0.5}
                r="0.3"
                fill="#22c55e"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
              />
            )}

            {latticeState.publicKey && (
              <motion.circle
                cx={latticeState.publicKey.x + 0.5}
                cy={latticeState.publicKey.y + 0.5}
                r="0.3"
                fill="#3b82f6"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
              />
            )}

            {latticeState.error && (
              <motion.circle
                cx={latticeState.error.x + 0.5}
                cy={latticeState.error.y + 0.5}
                r="0.25"
                fill="#f59e0b"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
              />
            )}
          </svg>

          <div className="absolute bottom-2 left-2 text-xs space-y-1">
            {latticeState.secretKey && (
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span>私钥 s (短向量)</span>
              </div>
            )}
            {latticeState.publicKey && (
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span>格点 a·s</span>
              </div>
            )}
            {latticeState.error && (
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <span>公钥 b = a·s + e</span>
              </div>
            )}
          </div>
        </div>
        <p className="text-center text-gray-500 text-sm mt-2">
          实际维度: 16384 维 (这里用 2D 示意)
        </p>
      </div>
    </div>
  )
}

function RegisterStep({ subStep }: { subStep: number }) {
  return (
    <div className="space-y-6">
      <div className="bg-gray-700/30 p-4 rounded-lg mb-4">
        <h3 className="text-purple-300 font-medium mb-2 flex items-center gap-2">
          <Info size={18} />
          注册阶段说明
        </h3>
        <p className="text-gray-400 text-sm">
          在实际系统中，每个选民会生成自己的 RSA 密钥对用于签名认证。
          公钥上传到系统，私钥由选民自己保管。这里为了演示简化了过程。
        </p>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4 text-purple-300">候选人注册</h3>
        <div className="grid grid-cols-2 gap-4">
          {DEMO_DATA.candidates.map((candidate, i) => (
            <motion.div
              key={i}
              className="bg-gray-700/50 p-4 rounded-lg flex items-center gap-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: subStep >= i + 1 ? 1 : 0.3, y: 0 }}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${i === 0 ? 'bg-blue-500' : 'bg-pink-500'
                }`}>
                {candidate.charAt(3)}
              </div>
              <div>
                <p className="font-medium">{candidate}</p>
                <p className="text-sm text-gray-400">索引: {i}</p>
              </div>
              {subStep >= i + 1 && (
                <CheckCircle size={20} className="text-green-400 ml-auto" />
              )}
            </motion.div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4 text-purple-300">选民注册</h3>
        <div className="grid grid-cols-3 gap-4">
          {DEMO_DATA.voters.map((voter, i) => (
            <motion.div
              key={voter.id}
              className="bg-gray-700/50 p-3 rounded-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: subStep >= 3 + i + 1 ? 1 : 0.3, y: 0 }}
            >
              <div className="flex items-center gap-2">
                <Users size={18} className="text-purple-400" />
                <span>{voter.name}</span>
                {subStep >= 3 + i + 1 && (
                  <CheckCircle size={16} className="text-green-400 ml-auto" />
                )}
              </div>
              <p className="text-sm text-gray-400 mt-1">
                预设选择: {DEMO_DATA.candidates[voter.choice]}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4 text-purple-300">受托人注册</h3>
        <div className="grid grid-cols-2 gap-4">
          {DEMO_DATA.trustees.map((trustee, i) => (
            <motion.div
              key={trustee.id}
              className="bg-gray-700/50 p-3 rounded-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: subStep >= 7 + i + 1 ? 1 : 0.3, y: 0 }}
            >
              <div className="flex items-center gap-2">
                <Shield size={18} className="text-amber-400" />
                <span>{trustee.name}</span>
                {subStep >= 7 + i + 1 && (
                  <CheckCircle size={16} className="text-green-400 ml-auto" />
                )}
              </div>
              <p className="text-sm text-gray-400 mt-1">负责计票和解密</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

function VoteStep({ subStep }: { subStep: number }) {
  const [currentVoter, setCurrentVoter] = useState(0)

  useEffect(() => {
    setCurrentVoter(Math.floor(subStep / 4))
  }, [subStep])

  const getVoterPhase = (voterIndex: number) => {
    const startSubStep = voterIndex * 4
    const relativeSubStep = subStep - startSubStep
    if (relativeSubStep < 0) return -1
    if (relativeSubStep < 1) return 0
    if (relativeSubStep < 2) return 1
    if (relativeSubStep < 3) return 2
    return 3
  }

  return (
    <div className="space-y-6">
      <div className="bg-gray-700/30 p-4 rounded-lg mb-4">
        <h3 className="text-purple-300 font-medium mb-2 flex items-center gap-2">
          <Info size={18} />
          加密原理
        </h3>
        <p className="text-gray-400 text-sm">
          选票先编码为 One-Hot 向量（如 [1,0] 表示选第一个候选人），
          然后用 BFV 公钥加密。由于同态性质，密文可以直接累加。
        </p>
      </div>

      {DEMO_DATA.voters.map((voter, voterIndex) => {
        const phase = getVoterPhase(voterIndex)
        const choice = voter.choice
        const oneHot = [0, 1].map(i => i === choice ? 1 : 0)

        return (
          <motion.div
            key={voter.id}
            className="bg-gray-700/30 rounded-lg p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: phase >= 0 ? 1 : 0.3 }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${phase >= 3 ? 'bg-green-500' : 'bg-purple-500'
                }`}>
                {voterIndex + 1}
              </div>
              <span className="font-medium">{voter.name}</span>
              {phase >= 3 && <CheckCircle size={18} className="text-green-400" />}
            </div>

            <div className="grid md:grid-cols-4 gap-3">
              <motion.div
                className="bg-gray-800/50 p-3 rounded-lg"
                animate={{ opacity: phase >= 0 ? 1 : 0.3 }}
              >
                <p className="text-xs text-gray-500 mb-1">1. 选择候选人</p>
                <p className="text-purple-300">{DEMO_DATA.candidates[choice]}</p>
              </motion.div>

              <motion.div
                className="bg-gray-800/50 p-3 rounded-lg"
                animate={{ opacity: phase >= 1 ? 1 : 0.3 }}
              >
                <p className="text-xs text-gray-500 mb-1">2. One-Hot 编码</p>
                <p className="font-mono text-blue-300">[{oneHot.join(', ')}]</p>
              </motion.div>

              <motion.div
                className="bg-gray-800/50 p-3 rounded-lg"
                animate={{ opacity: phase >= 2 ? 1 : 0.3 }}
              >
                <p className="text-xs text-gray-500 mb-1">3. BFV 加密</p>
                <div className="flex items-center gap-1">
                  <Lock size={14} className="text-amber-400" />
                  <p className="font-mono text-amber-300 text-xs truncate">
                    {phase >= 2 ? `ct_${voterIndex}` : '...'}
                  </p>
                </div>
              </motion.div>

              <motion.div
                className="bg-gray-800/50 p-3 rounded-lg"
                animate={{ opacity: phase >= 3 ? 1 : 0.3 }}
              >
                <p className="text-xs text-gray-500 mb-1">4. 提交选票</p>
                {phase >= 3 ? (
                  <span className="text-green-400 text-sm">✓ 已提交</span>
                ) : (
                  <span className="text-gray-500 text-sm">等待中...</span>
                )}
              </motion.div>
            </div>
          </motion.div>
        )
      })}

      <motion.div
        className="bg-purple-900/30 p-4 rounded-lg border border-purple-500/30"
        initial={{ opacity: 0 }}
        animate={{ opacity: subStep >= 12 ? 1 : 0 }}
      >
        <div className="flex items-center gap-2">
          <Vote size={20} className="text-purple-400" />
          <span>所有选票已加密提交，共 {DEMO_DATA.voters.length} 张</span>
        </div>
      </motion.div>
    </div>
  )
}

function TallyStep({ subStep }: { subStep: number }) {
  const encryptedVotes = DEMO_DATA.voters.map((_, i) => `ct_${i}`)

  const getResult = (step: number) => {
    if (step < 2) return null
    const votes = DEMO_DATA.voters.map(v => v.choice)
    const counts = [0, 0]
    const showCount = Math.min(step - 1, votes.length)
    for (let i = 0; i < showCount; i++) {
      counts[votes[i]]++
    }
    return counts
  }

  const result = getResult(subStep)

  return (
    <div className="space-y-6">
      <div className="bg-gray-700/30 p-4 rounded-lg">
        <h3 className="text-purple-300 font-medium mb-2 flex items-center gap-2">
          <Info size={18} />
          同态加法原理
        </h3>
        <p className="text-gray-400 text-sm mb-2">
          BFV 方案满足加法同态性：密文相加 = 明文相加的加密
        </p>
        <div className="bg-gray-800/50 p-3 rounded-lg font-mono text-sm">
          <p className="text-green-300">
            Enc(m₁) + Enc(m₂) = Enc(m₁ + m₂)
          </p>
        </div>
        <p className="text-gray-400 text-sm mt-2">
          这意味着：计票时无需解密单张选票，直接累加密文即可！
          <br />
          <span className="text-purple-300">隐私保护</span>：整个计票过程无人知道任何单张选票内容。
        </p>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4 text-purple-300">密文累加过程</h3>
        <div className="space-y-2">
          {encryptedVotes.map((ct, i) => (
            <motion.div
              key={i}
              className="flex items-center gap-3 bg-gray-700/30 p-3 rounded-lg"
              initial={{ opacity: 0, x: -20 }}
              animate={{
                opacity: subStep >= i + 1 ? 1 : 0.3,
                x: 0
              }}
            >
              <Lock size={16} className="text-amber-400" />
              <span className="font-mono">{ct}</span>
              {i < encryptedVotes.length - 1 && subStep >= i + 1 && (
                <ArrowRight size={16} className="text-purple-400" />
              )}
              {subStep >= i + 1 && i === encryptedVotes.length - 1 && (
                <span className="text-green-400 text-sm">= ct_sum</span>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4 text-purple-300">解密结果</h3>
        <motion.div
          className="bg-gray-700/50 p-4 rounded-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: subStep >= 4 ? 1 : 0.3 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Unlock size={18} className="text-green-400" />
            <span>Decrypt(ct_sum) = </span>
            <span className="font-mono text-purple-300">
              [{result ? result.join(', ') : '...'}]
            </span>
          </div>
          {result && (
            <div className="grid grid-cols-2 gap-4 mt-3">
              {DEMO_DATA.candidates.map((candidate, i) => (
                <div key={i} className="bg-gray-800/50 p-3 rounded-lg">
                  <p className="text-sm text-gray-400">{candidate}</p>
                  <p className="text-2xl font-bold text-purple-300">{result[i]} 票</p>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

function ResultStep() {
  const counts = [0, 0]
  DEMO_DATA.voters.forEach(v => counts[v.choice]++)
  const winner = counts[0] > counts[1] ? 0 : 1

  return (
    <div className="space-y-6">
      <motion.div
        className="text-center py-8"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <Trophy size={64} className="mx-auto text-amber-400 mb-4" />
        <h2 className="text-3xl font-bold mb-2">投票完成！</h2>
        <p className="text-gray-400">获胜者: {DEMO_DATA.candidates[winner]}</p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-4 text-purple-300">投票结果</h3>
          <div className="space-y-3">
            {DEMO_DATA.candidates.map((candidate, i) => (
              <motion.div
                key={i}
                className={`p-4 rounded-lg ${i === winner
                  ? 'bg-amber-500/20 border border-amber-500/50'
                  : 'bg-gray-700/50'
                  }`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.2 }}
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium">{candidate}</span>
                  <span className="text-2xl font-bold">{counts[i]} 票</span>
                </div>
                <div className="mt-2 bg-gray-800 rounded-full h-3 overflow-hidden">
                  <motion.div
                    className={`h-full ${i === winner ? 'bg-amber-500' : 'bg-purple-500'}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${(counts[i] / DEMO_DATA.voters.length) * 100}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                  />
                </div>
                <p className="text-sm text-gray-400 mt-1">
                  得票率: {((counts[i] / DEMO_DATA.voters.length) * 100).toFixed(1)}%
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4 text-purple-300">安全性总结</h3>
          <div className="space-y-3">
            {[
              { label: '隐私保护', desc: '单张选票全程加密，无人可知' },
              { label: '同态计票', desc: '密文直接累加，无需解密' },
              { label: '抗量子攻击', desc: '基于 LWE 问题，量子安全' },
              { label: '可验证性', desc: '结果可验证，过程透明' },
            ].map((item, i) => (
              <motion.div
                key={i}
                className="bg-gray-700/50 p-3 rounded-lg flex items-center gap-3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
              >
                <CheckCircle size={20} className="text-green-400" />
                <div>
                  <p className="font-medium">{item.label}</p>
                  <p className="text-sm text-gray-400">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
