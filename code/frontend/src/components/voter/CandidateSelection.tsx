import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Check, Crown } from 'lucide-react';

interface CandidateSelectionProps {
  candidates: string[];
  selectedCandidate: number | null;
  onSelect: (index: number) => void;
}

const CandidateSelection: React.FC<CandidateSelectionProps> = ({
  candidates,
  selectedCandidate,
  onSelect,
}) => {
  const colors = [
    'from-indigo-500 to-purple-500',
    'from-blue-500 to-cyan-500',
    'from-emerald-500 to-teal-500',
    'from-orange-500 to-amber-500',
    'from-pink-500 to-rose-500',
    'from-violet-500 to-purple-500',
  ];

  const bgColors = [
    'from-indigo-50 to-purple-50',
    'from-blue-50 to-cyan-50',
    'from-emerald-50 to-teal-50',
    'from-orange-50 to-amber-50',
    'from-pink-50 to-rose-50',
    'from-violet-50 to-purple-50',
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const cardVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100, damping: 12 },
    },
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-6">
        <User className="w-5 h-5 text-indigo-600" />
        <h3 className="text-lg font-semibold text-gray-900">选择候选人</h3>
        <span className="text-sm text-gray-500">（共 {candidates.length} 位）</span>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
      >
        <AnimatePresence>
          {candidates.map((candidate, index) => {
            const isSelected = selectedCandidate === index;
            const colorIndex = index % colors.length;

            return (
              <motion.div
                key={index}
                variants={cardVariants}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelect(index)}
                className={`relative cursor-pointer rounded-xl border-2 overflow-hidden transition-all duration-300 ${isSelected
                    ? 'border-indigo-500 shadow-lg'
                    : 'border-gray-200 hover:border-gray-300'
                  }`}
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${isSelected ? bgColors[colorIndex] : 'from-gray-50 to-white'
                    } opacity-50`}
                />

                <div className="relative p-5">
                  <div className="flex items-start gap-4">
                    <motion.div
                      className={`flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br ${isSelected ? colors[colorIndex] : 'from-gray-300 to-gray-400'
                        } flex items-center justify-center text-white font-bold text-xl shadow-md`}
                      animate={isSelected ? { rotate: [0, -5, 5, 0] } : {}}
                      transition={{ duration: 0.5 }}
                    >
                      {candidate.charAt(0).toUpperCase()}
                    </motion.div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-lg font-semibold text-gray-900 truncate">
                          {candidate}
                        </h4>
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="flex-shrink-0"
                          >
                            <Crown className="w-5 h-5 text-amber-500" />
                          </motion.div>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        候选人 #{index + 1}
                      </p>
                    </div>

                    <motion.div
                      className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${isSelected
                          ? 'bg-indigo-500 border-indigo-500'
                          : 'bg-white border-gray-300'
                        }`}
                      animate={isSelected ? { scale: [1, 1.2, 1] } : {}}
                      transition={{ duration: 0.3 }}
                    >
                      <AnimatePresence>
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                          >
                            <Check className="w-5 h-5 text-white" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </div>
                </div>

                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className={`px-5 py-3 bg-gradient-to-r ${colors[colorIndex]}`}>
                        <p className="text-white text-sm font-medium text-center flex items-center justify-center gap-2">
                          <Check className="w-4 h-4" />
                          已选择此候选人
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {selectedCandidate !== null && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100"
        >
          <p className="text-sm text-indigo-700">
            <span className="font-medium">提示：</span>
            您已选择 <span className="font-semibold">{candidates[selectedCandidate]}</span>，
            请在下方输入私钥完成投票。
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default CandidateSelection;
