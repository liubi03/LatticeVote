import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Shield, Key, Binary, ArrowRight, Sparkles } from 'lucide-react';

interface BFVEncryptionProps {
  plaintext?: number[];
  autoPlay?: boolean;
  onComplete?: () => void;
}

const BFVEncryption: React.FC<BFVEncryptionProps> = ({
  plaintext = [0, 0, 1, 0, 0],
  autoPlay = true,
  onComplete,
}) => {
  const [phase, setPhase] = useState<'input' | 'key' | 'encrypt' | 'output'>('input');
  const [encryptProgress, setEncryptProgress] = useState(0);

  useEffect(() => {
    if (!autoPlay) return;

    const timers: NodeJS.Timeout[] = [];

    timers.push(
      setTimeout(() => setPhase('key'), 1500),
      setTimeout(() => setPhase('encrypt'), 3000),
      setTimeout(() => {
        setEncryptProgress(1);
        const interval = setInterval(() => {
          setEncryptProgress((prev) => {
            if (prev >= 100) {
              clearInterval(interval);
              setPhase('output');
              onComplete?.();
              return 100;
            }
            return prev + 5;
          });
        }, 50);
      }, 3500)
    );

    return () => timers.forEach(clearTimeout);
  }, [autoPlay, onComplete]);

  const generateFakeCiphertext = (): string[] => {
    return plaintext.map(
      () =>
        'c' +
        Math.random()
          .toString(16)
          .substring(2, 10)
          .toUpperCase()
    );
  };

  const ciphertext = generateFakeCiphertext();

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 shadow-xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-purple-500/20 rounded-lg">
          <Lock className="w-6 h-6 text-purple-400" />
        </div>
        <h3 className="text-xl font-bold text-white">BFV 加密过程</h3>
      </div>

      <div className="relative">
        <div className="grid grid-cols-3 gap-4 items-center">
          <motion.div
            className={`bg-slate-800/50 rounded-xl p-4 border ${phase === 'input' ? 'border-indigo-500' : 'border-slate-700'
              }`}
            animate={{
              boxShadow:
                phase === 'input' ? '0 0 30px rgba(99, 102, 241, 0.3)' : '0 0 0px rgba(99, 102, 241, 0)',
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Binary className="w-4 h-4 text-indigo-400" />
              <span className="text-sm text-slate-400">明文向量 (m)</span>
            </div>
            <div className="flex gap-1 flex-wrap justify-center">
              {plaintext.map((val, i) => (
                <motion.div
                  key={i}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono text-sm ${val === 1 ? 'bg-indigo-500 text-white' : 'bg-slate-700 text-slate-400'
                    }`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                >
                  {val}
                </motion.div>
              ))}
            </div>
          </motion.div>

          <div className="flex flex-col items-center gap-4">
            <AnimatePresence>
              {phase >= 'key' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-slate-800/50 rounded-xl p-4 border border-purple-500/50"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Key className="w-4 h-4 text-purple-400" />
                    <span className="text-sm text-slate-400">密钥生成</span>
                  </div>
                  <div className="flex gap-2 items-center">
                    <motion.div
                      className="text-xs font-mono text-purple-300 bg-purple-500/20 px-2 py-1 rounded"
                      animate={{
                        opacity: [1, 0.5, 1],
                      }}
                      transition={{ duration: 1, repeat: phase === 'key' ? Infinity : 0 }}
                    >
                      sk = [***]
                    </motion.div>
                    <motion.div
                      className="text-xs font-mono text-green-300 bg-green-500/20 px-2 py-1 rounded"
                      animate={{
                        opacity: [1, 0.5, 1],
                      }}
                      transition={{ duration: 1, repeat: phase === 'key' ? Infinity : 0 }}
                    >
                      pk = [***]
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div
              className="flex items-center gap-2"
              animate={{
                opacity: phase >= 'encrypt' ? 1 : 0.3,
              }}
            >
              <ArrowRight className="w-6 h-6 text-slate-500" />
              <motion.div
                animate={{
                  rotate: phase === 'encrypt' ? 360 : 0,
                }}
                transition={{ duration: 1, repeat: phase === 'encrypt' ? Infinity : 0 }}
              >
                <Lock className="w-6 h-6 text-purple-400" />
              </motion.div>
              <ArrowRight className="w-6 h-6 text-slate-500" />
            </motion.div>

            <AnimatePresence>
              {phase === 'encrypt' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-purple-300"
                >
                  加密中...
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <motion.div
            className={`bg-slate-800/50 rounded-xl p-4 border ${phase === 'output' ? 'border-green-500' : 'border-slate-700'
              }`}
            animate={{
              boxShadow:
                phase === 'output' ? '0 0 30px rgba(34, 197, 94, 0.3)' : '0 0 0px rgba(34, 197, 94, 0)',
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-4 h-4 text-green-400" />
              <span className="text-sm text-slate-400">密文 (c)</span>
            </div>
            <div className="flex gap-1 flex-wrap justify-center">
              {ciphertext.map((val, i) => (
                <motion.div
                  key={i}
                  className="bg-slate-700 text-green-400 px-2 py-1 rounded text-xs font-mono"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{
                    opacity: phase === 'output' ? 1 : 0.3,
                    scale: phase === 'output' ? 1 : 0.9,
                  }}
                  transition={{ delay: i * 0.05 }}
                >
                  {val}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        <AnimatePresence>
          {phase === 'encrypt' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 pointer-events-none"
            >
              <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2">
                <motion.div
                  animate={{
                    x: [0, 100, 200],
                    opacity: [0, 1, 0],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Sparkles className="w-8 h-8 text-purple-400" />
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {phase === 'encrypt' && (
        <div className="mt-4">
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-500 to-indigo-500"
              initial={{ width: '0%' }}
              animate={{ width: `${encryptProgress}%` }}
            />
          </div>
          <div className="text-center text-sm text-slate-400 mt-2">{encryptProgress}%</div>
        </div>
      )}

      {phase === 'output' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg"
        >
          <div className="text-green-400 text-sm text-center flex items-center justify-center gap-2">
            <Shield className="w-4 h-4" />
            BFV 加密完成：明文已安全加密为密文，可在密文上进行同态运算
          </div>
        </motion.div>
      )}

      <div className="mt-6 p-4 bg-slate-800/30 rounded-xl border border-slate-700/50">
        <div className="text-sm text-slate-300">
          <span className="text-purple-400 font-semibold">BFV 方案：</span>
          一种全同态加密方案，支持在密文上进行加法和乘法运算，解密后得到正确的计算结果。
          在电子投票中，我们主要使用其加法同态性质来统计票数。
        </div>
      </div>
    </div>
  );
};

export default BFVEncryption;
