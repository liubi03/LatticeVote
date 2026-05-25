import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Lock, Unlock, Layers, Zap } from 'lucide-react';

interface Vote {
  id: number;
  ciphertext: string[];
  voter: string;
}

interface HomomorphicAdditionProps {
  votes?: Vote[];
  autoPlay?: boolean;
  onComplete?: () => void;
}

const HomomorphicAddition: React.FC<HomomorphicAdditionProps> = ({
  votes = [
    { id: 1, ciphertext: ['c1A', 'c1B', 'c1C'], voter: '投票者 A' },
    { id: 2, ciphertext: ['c2A', 'c2B', 'c2C'], voter: '投票者 B' },
    { id: 3, ciphertext: ['c3A', 'c3B', 'c3C'], voter: '投票者 C' },
  ],
  autoPlay = true,
  onComplete,
}) => {
  const [phase, setPhase] = useState<'input' | 'accumulate' | 'result'>('input');
  const [currentStep, setCurrentStep] = useState(0);
  const [accumulated, setAccumulated] = useState<string[]>([]);

  useEffect(() => {
    if (!autoPlay) return;

    const timers: NodeJS.Timeout[] = [];

    timers.push(
      setTimeout(() => {
        setPhase('accumulate');
        setCurrentStep(1);
        setAccumulated(votes[0].ciphertext);
      }, 1500)
    );

    for (let i = 1; i < votes.length; i++) {
      timers.push(
        setTimeout(() => {
          setCurrentStep(i + 1);
          setAccumulated((prev) =>
            prev.map((val, idx) => val + '+' + votes[i].ciphertext[idx])
          );
        }, 1500 + i * 1500)
      );
    }

    timers.push(
      setTimeout(() => {
        setPhase('result');
        onComplete?.();
      }, 1500 + votes.length * 1500 + 500)
    );

    return () => timers.forEach(clearTimeout);
  }, [autoPlay, votes, onComplete]);

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 shadow-xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-cyan-500/20 rounded-lg">
          <Layers className="w-6 h-6 text-cyan-400" />
        </div>
        <h3 className="text-xl font-bold text-white">同态加法运算</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="text-sm text-slate-400 mb-2">密文投票列表</div>
          <div className="space-y-3">
            {votes.map((vote, index) => (
              <motion.div
                key={vote.id}
                className={`bg-slate-800/50 rounded-xl p-4 border transition-all ${phase === 'accumulate' && currentStep > index
                    ? 'border-cyan-500/50'
                    : 'border-slate-700'
                  }`}
                animate={{
                  opacity: phase === 'accumulate' && currentStep > index ? 0.6 : 1,
                  scale: phase === 'accumulate' && currentStep === index ? 1.02 : 1,
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-cyan-400" />
                    <span className="text-sm text-slate-300">{vote.voter}</span>
                  </div>
                  <AnimatePresence>
                    {phase === 'accumulate' && currentStep > index && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-green-400 text-xs"
                      >
                        ✓ 已累加
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {vote.ciphertext.map((c, i) => (
                    <motion.span
                      key={i}
                      className="bg-slate-700/50 text-cyan-300 px-2 py-1 rounded text-xs font-mono"
                      animate={{
                        backgroundColor:
                          phase === 'accumulate' && currentStep === index
                            ? 'rgba(6, 182, 212, 0.2)'
                            : 'rgba(51, 65, 85, 0.5)',
                      }}
                    >
                      {c}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="text-sm text-slate-400 mb-2">累加过程</div>
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 min-h-[200px]">
            <AnimatePresence mode="wait">
              {phase === 'input' && (
                <motion.div
                  key="waiting"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full flex items-center justify-center"
                >
                  <div className="text-slate-500 text-sm">等待开始累加...</div>
                </motion.div>
              )}

              {phase !== 'input' && (
                <motion.div
                  key="accumulating"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Plus className="w-5 h-5 text-cyan-400" />
                    <span className="text-sm text-slate-300">
                      已累加 {currentStep} / {votes.length} 个密文
                    </span>
                  </div>

                  <div className="space-y-2">
                    {votes.slice(0, currentStep).map((vote, idx) => (
                      <motion.div
                        key={vote.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="flex items-center gap-2 text-sm"
                      >
                        <span className="text-slate-400">{vote.voter}:</span>
                        <span className="text-cyan-300 font-mono">
                          [{vote.ciphertext.join(', ')}]
                        </span>
                        {idx < currentStep - 1 && (
                          <Plus className="w-4 h-4 text-slate-500" />
                        )}
                      </motion.div>
                    ))}
                  </div>

                  <div className="border-t border-slate-600 pt-3 mt-3">
                    <div className="text-xs text-slate-500 mb-2">当前累加结果：</div>
                    <div className="flex gap-2 flex-wrap">
                      {accumulated.map((val, i) => (
                        <motion.span
                          key={i}
                          className="bg-cyan-500/20 text-cyan-300 px-2 py-1 rounded text-xs font-mono border border-cyan-500/30"
                          layout
                        >
                          {val}
                        </motion.span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <AnimatePresence>
            {phase === 'result' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-cyan-500/10 to-green-500/10 rounded-xl p-4 border border-cyan-500/30"
              >
                <div className="flex items-center gap-3 mb-3">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  <span className="text-white font-semibold">同态加法完成</span>
                </div>
                <div className="text-sm text-slate-300">
                  密文累加完成！由于同态性质：
                </div>
                <div className="mt-2 p-2 bg-slate-800/50 rounded font-mono text-sm text-center">
                  <span className="text-cyan-400">Enc(m₁) + Enc(m₂) + ...</span>
                  <span className="text-slate-400"> = </span>
                  <span className="text-green-400">Enc(m₁ + m₂ + ...)</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="mt-6 p-4 bg-slate-800/30 rounded-xl border border-slate-700/50">
        <div className="text-sm text-slate-300">
          <span className="text-cyan-400 font-semibold">同态加法原理：</span>
          在 BFV 方案中，两个密文的加法运算结果解密后等于对应明文的加法。
          这使得我们可以在不解密的情况下统计票数，保护投票者隐私。
        </div>
      </div>
    </div>
  );
};

export default HomomorphicAddition;
