import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Lock, Send, Shield, AlertCircle, Loader2 } from 'lucide-react';
import type { Project } from '../../types/index';
import { useBallotStore } from '../../stores/ballotStore';
import { useAuthStore } from '../../stores/authStore';
import CandidateSelection from './CandidateSelection';
import Button from '../common/Button';
import Input from '../common/Input';

interface VoteFormProps {
  project: Project;
  onBack: () => void;
  onSuccess: () => void;
}

const VoteForm: React.FC<VoteFormProps> = ({ project, onBack, onSuccess }) => {
  const { submitBallot, isLoading, error, clearError } = useBallotStore();
  const { user } = useAuthStore();
  
  const [selectedCandidate, setSelectedCandidate] = useState<number | null>(null);
  const [privateKey, setPrivateKey] = useState('');
  const [encrypting, setEncrypting] = useState(false);
  const [step, setStep] = useState(1);

  const handleSelectCandidate = (index: number) => {
    setSelectedCandidate(index);
    clearError();
  };

  const handleSubmit = async () => {
    if (selectedCandidate === null || !privateKey.trim()) return;

    setEncrypting(true);
    setStep(2);

    await new Promise(resolve => setTimeout(resolve, 1500));

    const publicKey = user?.public_key || '';
    const success = await submitBallot(project.project_id, selectedCandidate, publicKey, privateKey);
    
    if (success) {
      setStep(3);
      setTimeout(() => {
        onSuccess();
      }, 500);
    } else {
      setEncrypting(false);
      setStep(1);
    }
  };

  const steps = [
    { id: 1, label: '选择候选人', icon: Shield },
    { id: 2, label: '加密投票', icon: Lock },
    { id: 3, label: '提交完成', icon: Send },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto"
    >
      <motion.button
        whileHover={{ x: -5 }}
        whileTap={{ scale: 0.95 }}
        onClick={onBack}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>返回项目列表</span>
      </motion.button>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-5">
          <h2 className="text-xl font-bold text-white">{project.name}</h2>
          <p className="text-indigo-100 mt-1">{project.description}</p>
        </div>

        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-center gap-4">
            {steps.map((s, index) => {
              const Icon = s.icon;
              const isActive = step === s.id;
              const isCompleted = step > s.id;

              return (
                <React.Fragment key={s.id}>
                  <motion.div
                    className={`flex items-center gap-2 ${
                      isActive ? 'text-indigo-600' : isCompleted ? 'text-green-600' : 'text-gray-400'
                    }`}
                    animate={isActive ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ duration: 0.5, repeat: isActive ? Infinity : 0, repeatDelay: 1 }}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        isActive
                          ? 'bg-indigo-100'
                          : isCompleted
                          ? 'bg-green-100'
                          : 'bg-gray-200'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium hidden sm:inline">{s.label}</span>
                  </motion.div>
                  {index < steps.length - 1 && (
                    <div
                      className={`w-12 h-0.5 ${
                        isCompleted ? 'bg-green-400' : 'bg-gray-300'
                      }`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-6"
            >
              <CandidateSelection
                candidates={project.candidates}
                selectedCandidate={selectedCandidate}
                onSelect={handleSelectCandidate}
              />

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-8 pt-6 border-t border-gray-200"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Lock className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-lg font-semibold text-gray-900">输入私钥</h3>
                </div>

                <Input
                  type="password"
                  label="私钥"
                  placeholder="请输入您的私钥"
                  value={privateKey}
                  onChange={(e) => {
                    setPrivateKey(e.target.value);
                    clearError();
                  }}
                  helperText="私钥将用于加密您的选票，请妥善保管"
                />

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2"
                  >
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <span className="text-sm text-red-600">{error}</span>
                  </motion.div>
                )}

                <div className="mt-6 flex justify-end">
                  <Button
                    onClick={handleSubmit}
                    disabled={selectedCandidate === null || !privateKey.trim()}
                    isLoading={isLoading}
                    size="lg"
                  >
                    <Send className="w-5 h-5 mr-2" />
                    提交投票
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-12 text-center"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center"
              >
                <Lock className="w-10 h-10 text-white" />
              </motion.div>

              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                正在加密您的选票...
              </h3>
              <p className="text-gray-500">
                使用量子安全算法对您的投票进行加密
              </p>

              <div className="mt-8 flex justify-center gap-2">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-3 h-3 rounded-full bg-indigo-500"
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{
                      duration: 0.6,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-12 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center"
              >
                <Send className="w-10 h-10 text-white" />
              </motion.div>

              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                投票提交成功！
              </h3>
              <p className="text-gray-500">
                正在跳转到成功页面...
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl"
      >
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-amber-800">安全提示</h4>
            <p className="text-sm text-amber-700 mt-1">
              您的投票将使用后量子密码学算法进行加密，确保量子计算环境下的安全性。
              请勿向任何人透露您的私钥。
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default VoteForm;
