import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  RotateCcw,
  CheckCircle,
  Circle,
  Lock,
  Vote,
  BarChart3,
  Users,
  Settings,
  ChevronRight,
} from 'lucide-react';
import OneHotEncoding from '../components/visualization/OneHotEncoding';
import BFVEncryption from '../components/visualization/BFVEncryption';
import HomomorphicAddition from '../components/visualization/HomomorphicAddition';
import Decryption from '../components/visualization/Decryption';
import ResultChart from '../components/visualization/ResultChart';

interface Step {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  detail: string;
}

const steps: Step[] = [
  {
    id: 0,
    title: '系统初始化',
    description: '生成公共参数和密钥对',
    icon: <Settings className="w-5 h-5" />,
    detail: '信任方生成 BFV 方案的公共参数 (pk) 和私钥 (sk)，公共参数公开给所有投票者。',
  },
  {
    id: 1,
    title: '投票者注册',
    description: '验证投票者身份',
    icon: <Users className="w-5 h-5" />,
    detail: '投票者在系统中注册，验证其投票资格。系统记录已注册投票者，防止重复投票。',
  },
  {
    id: 2,
    title: '投票与加密',
    description: 'One-Hot 编码 + BFV 加密',
    icon: <Vote className="w-5 h-5" />,
    detail: '投票者选择候选人，将选择转换为 One-Hot 向量，使用公钥进行 BFV 加密，提交密文投票。',
  },
  {
    id: 3,
    title: '同态计票',
    description: '密文同态加法累加',
    icon: <Lock className="w-5 h-5" />,
    detail: '服务器在密文状态下对所有投票进行同态加法运算，累加结果仍为密文，不泄露任何投票信息。',
  },
  {
    id: 4,
    title: '解密与结果',
    description: '私钥解密公布结果',
    icon: <BarChart3 className="w-5 h-5" />,
    detail: '信任方使用私钥解密累加密文，得到每位候选人的得票数，公布最终投票结果。',
  },
];

const VotingDemo: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const goToStep = useCallback((step: number) => {
    if (step >= 0 && step < steps.length) {
      setCurrentStep(step);
    }
  }, []);

  const nextStep = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCompletedSteps((prev) => new Set(prev).add(currentStep));
      setCurrentStep(currentStep + 1);
    } else {
      setCompletedSteps((prev) => new Set(prev).add(currentStep));
      setIsPlaying(false);
    }
  }, [currentStep]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  const resetDemo = useCallback(() => {
    setCurrentStep(0);
    setIsPlaying(false);
    setCompletedSteps(new Set());
  }, []);

  const handleStepComplete = useCallback(() => {
    if (isPlaying) {
      setTimeout(nextStep, 1000);
    }
  }, [isPlaying, nextStep]);

  useEffect(() => {
    if (isPlaying && completedSteps.has(currentStep)) {
      nextStep();
    }
  }, [isPlaying, currentStep, completedSteps, nextStep]);

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <motion.div
            key="init"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 shadow-xl">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                <Settings className="w-6 h-6 text-indigo-400" />
                BFV 方案初始化
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <motion.div
                  className="bg-slate-800/50 rounded-xl p-4 border border-slate-700"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="text-indigo-400 text-sm mb-2">公共参数生成</div>
                  <div className="space-y-2 text-sm text-slate-300">
                    <div>• 多项式环: R = Z[X]/(X^n + 1)</div>
                    <div>• 明文模数: t</div>
                    <div>• 密文模数: q</div>
                  </div>
                </motion.div>
                <motion.div
                  className="bg-slate-800/50 rounded-xl p-4 border border-slate-700"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="text-purple-400 text-sm mb-2">密钥对生成</div>
                  <div className="space-y-2 text-sm text-slate-300">
                    <div>• 私钥 sk ← R</div>
                    <div>• 公钥 pk = (p₀, p₁)</div>
                    <div>• p₀ = -sk·e₁ + e₂ + Δ (mod q)</div>
                  </div>
                </motion.div>
              </div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg"
              >
                <div className="text-green-400 text-sm">
                  ✓ 系统初始化完成，公钥已公开，私钥由信任方安全保存
                </div>
              </motion.div>
            </div>
          </motion.div>
        );

      case 1:
        return (
          <motion.div
            key="register"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 shadow-xl">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                <Users className="w-6 h-6 text-cyan-400" />
                投票者注册
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['投票者 A', '投票者 B', '投票者 C'].map((voter, i) => (
                  <motion.div
                    key={voter}
                    className="bg-slate-800/50 rounded-xl p-4 border border-slate-700"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 + i * 0.2 }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold">
                        {String.fromCharCode(65 + i)}
                      </div>
                      <div>
                        <div className="text-white font-medium">{voter}</div>
                        <div className="text-xs text-slate-400">ID: {1000 + i}</div>
                      </div>
                    </div>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 + i * 0.2 }}
                      className="text-xs text-green-400 flex items-center gap-1"
                    >
                      <CheckCircle className="w-3 h-3" />
                      已验证投票资格
                    </motion.div>
                  </motion.div>
                ))}
              </div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg"
              >
                <div className="text-green-400 text-sm">
                  ✓ 3 位投票者已完成注册，可以开始投票
                </div>
              </motion.div>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            key="vote"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <OneHotEncoding selectedIndex={2} totalOptions={5} autoPlay={isPlaying} onComplete={handleStepComplete} />
            <BFVEncryption plaintext={[0, 0, 1, 0, 0]} autoPlay={isPlaying} />
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            key="tally"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <HomomorphicAddition
              votes={[
                { id: 1, ciphertext: ['c1A', 'c1B', 'c1C', 'c1D', 'c1E'], voter: '投票者 A' },
                { id: 2, ciphertext: ['c2A', 'c2B', 'c2C', 'c2D', 'c2E'], voter: '投票者 B' },
                { id: 3, ciphertext: ['c3A', 'c3B', 'c3C', 'c3D', 'c3E'], voter: '投票者 C' },
              ]}
              autoPlay={isPlaying}
              onComplete={handleStepComplete}
            />
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <Decryption
              ciphertext={['ΣcA', 'ΣcB', 'ΣcC', 'ΣcD', 'ΣcE']}
              expectedResult={[2, 1, 3, 0, 1]}
              autoPlay={isPlaying}
              onComplete={handleStepComplete}
            />
            <ResultChart data={[
              { name: '候选人 A', votes: 2, color: '#6366f1' },
              { name: '候选人 B', votes: 1, color: '#8b5cf6' },
              { name: '候选人 C', votes: 3, color: '#06b6d4' },
              { name: '候选人 D', votes: 0, color: '#10b981' },
              { name: '候选人 E', votes: 1, color: '#f59e0b' },
            ]} />
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">基于 BFV 同态加密的电子投票流程演示</h1>
          <p className="text-slate-400">完整展示从系统初始化到结果公布的投票全过程</p>
        </motion.div>

        <div className="bg-slate-900/50 rounded-2xl p-4 mb-6 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {steps.map((step, index) => (
                <React.Fragment key={step.id}>
                  <motion.button
                    onClick={() => goToStep(index)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${currentStep === index
                        ? 'bg-indigo-500 text-white'
                        : completedSteps.has(index)
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                      }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {completedSteps.has(index) ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <Circle className="w-4 h-4" />
                    )}
                    <span className="hidden md:inline text-sm">{step.title}</span>
                    <span className="md:hidden text-sm">{index + 1}</span>
                  </motion.button>
                  {index < steps.length - 1 && (
                    <ChevronRight className="w-4 h-4 text-slate-600 hidden md:block" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-center gap-4">
            <motion.button
              onClick={resetDemo}
              className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <RotateCcw className="w-5 h-5" />
            </motion.button>
            <motion.button
              onClick={prevStep}
              disabled={currentStep === 0}
              className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all disabled:opacity-50"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <SkipBack className="w-5 h-5" />
            </motion.button>
            <motion.button
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-6 py-2 rounded-lg bg-indigo-500 text-white hover:bg-indigo-600 transition-all flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              {isPlaying ? '暂停' : '播放'}
            </motion.button>
            <motion.button
              onClick={nextStep}
              disabled={currentStep === steps.length - 1}
              className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all disabled:opacity-50"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <SkipForward className="w-5 h-5" />
            </motion.button>
          </div>
        </div>

        <motion.div
          key={currentStep}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-slate-900/30 rounded-xl p-4 mb-6 border border-slate-800"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-indigo-500/20 text-indigo-400">
              {steps[currentStep].icon}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white mb-1">
                步骤 {currentStep + 1}: {steps[currentStep].title}
              </h2>
              <p className="text-slate-400 text-sm mb-2">{steps[currentStep].description}</p>
              <p className="text-slate-500 text-sm">{steps[currentStep].detail}</p>
            </div>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">{renderStepContent()}</AnimatePresence>
      </div>
    </div>
  );
};

export default VotingDemo;
