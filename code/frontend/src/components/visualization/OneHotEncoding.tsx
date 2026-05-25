import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Binary, ArrowRight, Zap } from 'lucide-react';

interface OneHotEncodingProps {
  selectedIndex?: number;
  totalOptions?: number;
  autoPlay?: boolean;
  onComplete?: () => void;
}

const OneHotEncoding: React.FC<OneHotEncodingProps> = ({
  selectedIndex = 2,
  totalOptions = 5,
  autoPlay = true,
  onComplete,
}) => {
  const [phase, setPhase] = useState<'select' | 'encode' | 'result'>('select');
  const [currentHighlight, setCurrentHighlight] = useState<number | null>(null);

  useEffect(() => {
    if (!autoPlay) return;

    const timers: NodeJS.Timeout[] = [];

    timers.push(
      setTimeout(() => {
        setPhase('encode');
        setCurrentHighlight(0);
      }, 1000)
    );

    for (let i = 0; i <= totalOptions; i++) {
      timers.push(
        setTimeout(() => {
          setCurrentHighlight(i);
          if (i === totalOptions) {
            setTimeout(() => {
              setPhase('result');
              onComplete?.();
            }, 500);
          }
        }, 1000 + (i + 1) * 400)
      );
    }

    return () => timers.forEach(clearTimeout);
  }, [autoPlay, totalOptions, onComplete]);

  const generateOneHot = (index: number, total: number): number[] => {
    return Array.from({ length: total }, (_, i) => (i === index ? 1 : 0));
  };

  const oneHotVector = generateOneHot(selectedIndex, totalOptions);

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 shadow-xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-indigo-500/20 rounded-lg">
          <Binary className="w-6 h-6 text-indigo-400" />
        </div>
        <h3 className="text-xl font-bold text-white">One-Hot 编码过程</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="text-sm text-slate-400 mb-2">步骤 1: 选择候选项</div>
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <div className="text-xs text-slate-500 mb-3">候选人列表</div>
            <div className="space-y-2">
              {Array.from({ length: totalOptions }, (_, i) => (
                <motion.div
                  key={i}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-all ${i === selectedIndex
                      ? 'bg-indigo-500/20 border border-indigo-500/50'
                      : 'bg-slate-700/30'
                    }`}
                  animate={{
                    scale: phase === 'select' && i === selectedIndex ? [1, 1.02, 1] : 1,
                    boxShadow:
                      phase === 'select' && i === selectedIndex
                        ? '0 0 20px rgba(99, 102, 241, 0.3)'
                        : '0 0 0px rgba(99, 102, 241, 0)',
                  }}
                  transition={{ duration: 0.5 }}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${i === selectedIndex
                        ? 'bg-indigo-500 text-white'
                        : 'bg-slate-600 text-slate-400'
                      }`}
                  >
                    {i}
                  </div>
                  <span className={i === selectedIndex ? 'text-white font-medium' : 'text-slate-400'}>
                    候选人 {String.fromCharCode(65 + i)}
                  </span>
                  <AnimatePresence>
                    {phase !== 'select' && i === selectedIndex && (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="ml-auto"
                      >
                        <Zap className="w-5 h-5 text-yellow-400" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="text-sm text-slate-400 mb-2">步骤 2: 生成 One-Hot 向量</div>
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="text-slate-400 text-sm">索引 {selectedIndex}</span>
              <ArrowRight className="w-4 h-4 text-indigo-400" />
              <span className="text-indigo-400 font-mono">[{oneHotVector.join(', ')}]</span>
            </div>

            <div className="flex items-center justify-center gap-2 flex-wrap">
              {oneHotVector.map((value, i) => (
                <motion.div
                  key={i}
                  className="relative"
                  animate={{
                    scale:
                      phase === 'encode' && currentHighlight !== null && i === currentHighlight
                        ? 1.1
                        : 1,
                  }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <motion.div
                    className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-bold font-mono border-2 ${value === 1
                        ? 'bg-gradient-to-br from-indigo-500 to-purple-500 text-white border-indigo-400'
                        : 'bg-slate-700 text-slate-500 border-slate-600'
                      }`}
                    animate={{
                      backgroundColor:
                        phase === 'encode' && currentHighlight !== null && i <= currentHighlight
                          ? value === 1
                            ? '#6366f1'
                            : '#334155'
                          : undefined,
                    }}
                  >
                    <AnimatePresence mode="wait">
                      {phase === 'select' ? (
                        <motion.span
                          key="q"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="text-slate-500"
                        >
                          ?
                        </motion.span>
                      ) : (
                        <motion.span
                          key={value}
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ type: 'spring', stiffness: 300 }}
                        >
                          {value}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.div>
                  <div className="text-center mt-1 text-xs text-slate-500">[{i}]</div>
                </motion.div>
              ))}
            </div>

            {phase === 'result' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg"
              >
                <div className="text-green-400 text-sm text-center">
                  ✓ One-Hot 编码完成：位置 {selectedIndex} 被设置为 1，其他位置为 0
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-slate-800/30 rounded-xl border border-slate-700/50">
        <div className="text-sm text-slate-300">
          <span className="text-indigo-400 font-semibold">原理说明：</span>
          One-Hot 编码将选择索引转换为一个稀疏向量，只有被选中的位置为 1，其余为 0。
          这种编码方式使得我们可以通过同态加法来统计每个候选人的得票数。
        </div>
      </div>
    </div>
  );
};

export default OneHotEncoding;
