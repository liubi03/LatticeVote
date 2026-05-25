import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Vote, Clock, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';
import { useProjectStore } from '../stores/projectStore';
import { useAuthStore } from '../stores/authStore';
import type { Project } from '../types/index';
import ProjectList from '../components/voter/ProjectList';
import VoteForm from '../components/voter/VoteForm';
import VoteSuccess from '../components/voter/VoteSuccess';
import Loading from '../components/common/Loading';
import api from '../services/api';

const VoterDashboard: React.FC = () => {
  const { projects, isLoading: projectLoading, fetchProjects } = useProjectStore();
  const { user } = useAuthStore();

  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showVoteForm, setShowVoteForm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [votedProjects, setVotedProjects] = useState<Set<string>>(new Set());
  const [checkingVoted, setCheckingVoted] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    const checkAllVotedStatus = async () => {
      const activeProjects = projects.filter(p => p.status === 'active');
      const votedSet = new Set<string>();

      for (const project of activeProjects) {
        try {
          const response = await api.get(`/ballots/check/${project.project_id}`);
          if (response.data.has_voted) {
            votedSet.add(project.project_id);
          }
        } catch (err) {
          console.error('检查投票状态失败:', err);
        }
      }
      setVotedProjects(votedSet);
      setCheckingVoted(false);
    };

    if (projects.length > 0 && !checkingVoted) {
      setCheckingVoted(true);
      checkAllVotedStatus();
    }
  }, [projects]);

  const handleSelectProject = (project: Project) => {
    setSelectedProject(project);
    setShowVoteForm(true);
  };

  const handleVoteSuccess = () => {
    setShowVoteForm(false);
    setShowSuccess(true);
    if (selectedProject) {
      setVotedProjects(prev => new Set(prev).add(selectedProject.project_id));
    }
  };

  const handleBack = () => {
    setShowVoteForm(false);
    setSelectedProject(null);
  };

  const handleCloseSuccess = () => {
    setShowSuccess(false);
    setSelectedProject(null);
  };

  const stats = {
    total: projects.length,
    active: projects.filter(p => p.status === 'active').length,
    voted: votedProjects.size,
    pending: projects.filter(p => p.status === 'active').length - votedProjects.size,
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
      },
    },
  };

  if (projectLoading) {
    return <Loading fullScreen text="加载投票数据..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <AnimatePresence mode="wait">
        {showSuccess ? (
          <VoteSuccess
            key="success"
            projectName={selectedProject?.name || ''}
            onClose={handleCloseSuccess}
          />
        ) : showVoteForm && selectedProject ? (
          <motion.div
            key="vote-form"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="min-h-screen p-6"
          >
            <VoteForm
              project={selectedProject}
              onBack={handleBack}
              onSuccess={handleVoteSuccess}
            />
          </motion.div>
        ) : (
          <motion.div
            key="dashboard"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="p-6"
          >
            <motion.div variants={itemVariants} className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    选民控制台
                  </h1>
                  <p className="mt-2 text-gray-600">
                    欢迎回来，{user?.username || '选民'}
                  </p>
                </div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full"
                >
                  <Vote className="w-5 h-5" />
                  <span className="font-medium">选民身份</span>
                </motion.div>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <motion.div
                whileHover={{ scale: 1.02, y: -5 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-5"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">总项目数</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02, y: -5 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-5"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Clock className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">进行中</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02, y: -5 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-5"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">已投票</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.voted}</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02, y: -5 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-5"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">待投票</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <ProjectList
                projects={projects}
                votedProjects={votedProjects}
                onSelectProject={handleSelectProject}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VoterDashboard;
