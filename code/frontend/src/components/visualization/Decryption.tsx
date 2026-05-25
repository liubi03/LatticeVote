import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Unlock, Key, BarChart3, Trophy, Sparkles } from 'lucide-react';

interface DecryptionProps {
  ciphertext?: string[];
  expectedResult?: number[];
  autoPlay?: boolean;
  onComplete?: () => void;
}

const Decryption: React.FC<DecryptionProps> = ({
  ciphertext = ['cA+cB+cC', 'cD+cE+cF', 'cG+cH+cI', 'cJ+cK+cL', 'cM+cN+cO'],
  expectedResult = [2, 1, 3, 0, 1],
  autoPlay = true,
  onComplete,
}) => {
  const [phase, setPhase] = useState<'input' | 'key' | 'decrypt' | 'result'>('input');
  const [decryptProgress, setDecryptProgress] = useState(0);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    if (!autoPlay) return;

    const timers: NodeJS.Timeout[] = [];

    timers.push(
      setTimeout(() => setPhase('key'), 1500),
      setTimeout(() => setPhase('decrypt'), 3000),
      setTimeout(() => {
        const interval = setInterval(() => {
          setDecryptProgress((prev) => {
            if (prev >= 100) {
              clearInterval(interval);
              setPhase('result');
              setTimeout(() => {
                setShowResult(true);
                onComplete?.();
              }, 500);
              return 100;
            }
            return prev + 4;
          });
        }, 40);
      }, 3500)
    );

    return () => timers.forEach(clearTimeout);
  }, [autoPlay, onComplete]);

  const maxVotes = Math.max(...expectedResult);
  const totalVotes = expectedResult.reduce((a, b) => a + b, 0);
  const winnerIndex = expectedResult.indexOf(maxVotes);

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 shadow-xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-green-500/20 rounded-lg">
          <Unlock className="w-6 h-6 text-green-400" />
        </div>
        <h3 className="text-xl font-bold text-white">解密与结果展示</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="text-sm text-slate-400 mb-2">步骤 1: 输入累加密文</div>
          <motion.div
            className={`bg-slate-800/50 rounded-xl p-4 border ${phase === 'input' ? 'border-cyan-500' : 'border-slate-700'
              }`}
            animate={{
              boxShadow:
                phase === 'input' ? '0 0 20px rgba(6, 182, 212, 0.3)' : '0 0 0px rgba(6, 182, 212, 0)',
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="w-4 h-4 text-cyan-400" />
              <span className="text-sm text-slate-400">累加后的密文</span>
            </div>
            <div className="space-y-2">
              {ciphertext.map((c, i) => (
                <motion.div
                  key={i}
                  className="flex items-center gap-2"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <span className="text-xs text-slate-500 w-16">候选人 {String.fromCharCode(65 + i)}:</span>
                  <span className="bg-slate-700/50 text-cyan-300 px-2 py-1 rounded text-xs font-mono">
                    {c}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <AnimatePresence>
            {phase >= 'key' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-slate-800/50 rounded-xl p-4 border ${phase === 'key' ? 'border-purple-500' : 'border-slate-700'
                  }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Key className="w-4 h-4 text-purple-400" />
                  <span className="text-sm text-slate-400">步骤 2: 使用私钥解密</span>
                </div>
                <motion.div
                  className="text-xs font-mono text-purple-300 bg-purple-500/20 px-3 py-2 rounded inline-block"
                  animate={{
                    opacity: phase === 'key' ? [1, 0.5, 1] : 1,
                  }}
                  transition={{ duration: 1, repeat: phase === 'key' ? Infinity : 0 }}
                >
                  sk = [私钥参数...]
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="space-y-4">
          <div className="text-sm text-slate-400 mb-2">步骤 3: 解密结果</div>
          <motion.div
            className={`bg-slate-800/50 rounded-xl p-4 border ${phase === 'result' ? 'border-green-500' : 'border-slate-700'
              }`}
            animate={{
              boxShadow:
                phase === 'result' ? '0 0 30px rgba(34, 197, 94, 0.3)' : '0 0 0px rgba(34, 197, 94, 0)',
            }}
          >
            {phase === 'decrypt' && (
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <Sparkles className="w-4 h-4 text-yellow-400" />
                  </motion.div>
                  <span className="text-sm text-slate-400">解密中...</span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                    style={{ width: `${decryptProgress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="space-y-3">
              {expectedResult.map((votes, i) => (
                <motion.div
                  key={i}
                  className="flex items-center gap-3"
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: phase === 'result' ? 1 : 0.3,
                  }}
                  transition={{ delay: i * 0.1 }}
                >
                  <span className="text-sm text-slate-400 w-20">
                    {String.fromCharCode(65 + i)}:
                  </span>
                  <div className="flex-1 h-6 bg-slate-700/50 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${i === winnerIndex
                          ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                          : 'bg-gradient-to-r from-green-500 to-emerald-500'
                        }`}
                      initial={{ width: '0%' }}
                      animate={{
                        width: showResult ? `${(votes / maxVotes) * 100}%` : '0%',
                      }}
                      transition={{ duration: 0.8, delay: i * 0.1, ease: 'easeOut' }}
                    />
                  </div>
                  <motion.span
                    className={`text-sm font-bold w-8 text-right ${i === winnerIndex ? 'text-yellow-400' : 'text-green-400'
                      }`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: showResult ? 1 : 0 }}
                    transition={{ delay: i * 0.1 + 0.3 }}
                  >
                    {votes}
                  </motion.span>
                  <AnimatePresence>
                    {showResult && i === winnerIndex && votes > 0 && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 }}
                      >
                        <Trophy className="w-5 h-5 text-yellow-400" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <AnimatePresence>
            {showResult && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-xl p-4 border border-yellow-500/30"
              >
                <div className="flex items-center gap-3">
                  <Trophy className="w-6 h-6 text-yellow-400" />
                  <div>
                    <div className="text-yellow-400 font-semibold">
                      获胜者：候选人 {String.fromCharCode(65 + winnerIndex)}
                    </div>
                    <div className="text-sm text-slate-400">
                      获得 {maxVotes} 票，占总票数的 {((maxVotes / totalVotes) * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="mt-6 p-4 bg-slate-800/30 rounded-xl border border-slate-700/50">
        <div className="text-sm text-slate-300">
          <span className="text-green-400 font-semibold">解密说明：</span>
          使用私钥对累加后的密文进行解密，得到每个候选人的最终得票数。
          整个计票过程在密文状态下完成，确保了投票者的隐私和投票的安全性。
        </div>
      </div>
    </div>
  );
};

export default Decryption;
