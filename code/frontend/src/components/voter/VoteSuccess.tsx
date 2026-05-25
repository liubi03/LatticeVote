import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, PartyPopper, Sparkles, ArrowRight, Shield, Vote } from 'lucide-react';
import Button from '../common/Button';

interface VoteSuccessProps {
  projectName: string;
  onClose: () => void;
}

const VoteSuccess: React.FC<VoteSuccessProps> = ({ projectName, onClose }) => {
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const confettiColors = [
    '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'
  ];

  const generateConfetti = () => {
    return Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 2,
      duration: 2 + Math.random() * 2,
      color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
      rotation: Math.random() * 360,
    }));
  };

  const confetti = generateConfetti();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-6 relative overflow-hidden">
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none">
          {confetti.map((piece) => (
            <motion.div
              key={piece.id}
              initial={{
                y: -20,
                x: `${piece.x}vw`,
                rotate: 0,
                opacity: 1
              }}
              animate={{
                y: '100vh',
                rotate: piece.rotation + 720,
                opacity: [1, 1, 0]
              }}
              transition={{
                duration: piece.duration,
                delay: piece.delay,
                ease: 'easeIn'
              }}
              className="absolute w-3 h-3 rounded-sm"
              style={{ backgroundColor: piece.color }}
            />
          ))}
        </div>
      )}

      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="max-w-lg w-full"
      >
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
          <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-8 py-12 text-center overflow-hidden">
            <motion.div
              className="absolute inset-0 opacity-30"
              animate={{
                background: [
                  'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 50%)',
                  'radial-gradient(circle at 80% 50%, rgba(255,255,255,0.3) 0%, transparent 50%)',
                  'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 50%)',
                ],
              }}
              transition={{ duration: 3, repeat: Infinity }}
            />

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="relative"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                className="inline-block"
              >
                <div className="w-24 h-24 mx-auto bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-4 border-white/30">
                  <CheckCircle className="w-14 h-14 text-white" />
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="relative mt-6"
            >
              <h1 className="text-3xl font-bold text-white mb-2">
                投票成功！
              </h1>
              <p className="text-white/80">
                您的选票已安全提交并加密存储
              </p>
            </motion.div>

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.6, type: 'spring' }}
              className="absolute -bottom-6 left-1/2 -translate-x-1/2"
            >
              <div className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center">
                <PartyPopper className="w-6 h-6 text-purple-600" />
              </div>
            </motion.div>
          </div>

          <div className="px-8 py-8">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="space-y-6"
            >
              <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                    <Vote className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">投票项目</p>
                    <p className="font-semibold text-gray-900">{projectName}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">加密状态</p>
                    <p className="font-semibold text-green-700">已使用后量子密码学算法加密</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 py-4">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <p className="text-sm text-gray-600">
                  感谢您参与民主投票！
                </p>
                <Sparkles className="w-5 h-5 text-amber-500" />
              </div>

              <Button
                onClick={onClose}
                variant="primary"
                size="lg"
                className="w-full"
              >
                返回控制台
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-6 text-center"
        >
          <p className="text-sm text-gray-500">
            您的投票已记录在区块链上，具有不可篡改性
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default VoteSuccess;
