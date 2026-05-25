import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Users, CheckCircle, Clock, Pause, FileText, BarChart3 } from 'lucide-react';
import type { Project } from '../../types/index';

interface ProjectListProps {
  projects: Project[];
  votedProjects: Set<string>;
  onSelectProject: (project: Project) => void;
}

const ProjectList: React.FC<ProjectListProps> = ({
  projects,
  votedProjects,
  onSelectProject,
}) => {
  const getStatusConfig = (status: Project['status'], hasVoted: boolean) => {
    if (status === 'active' && hasVoted) {
      return {
        label: '已投票',
        color: 'bg-blue-100 text-blue-700',
        icon: CheckCircle,
        canVote: false,
      };
    }

    const configs = {
      draft: { label: '草稿', color: 'bg-gray-100 text-gray-700', icon: FileText, canVote: false },
      active: { label: '进行中', color: 'bg-green-100 text-green-700', icon: Clock, canVote: true },
      paused: { label: '已暂停', color: 'bg-amber-100 text-amber-700', icon: Pause, canVote: false },
      finished: { label: '已结束', color: 'bg-purple-100 text-purple-700', icon: CheckCircle, canVote: false },
      tallied: { label: '已计票', color: 'bg-indigo-100 text-indigo-700', icon: BarChart3, canVote: false },
    };
    return configs[status];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getProgressPercentage = (project: Project) => {
    if (project.status === 'tallied') return 100;
    if (project.status === 'finished') return 90;
    if (project.status === 'paused') return 50;
    if (project.status === 'draft') return 10;
    if (!project.start_time || !project.end_time) return 50;

    const start = new Date(project.start_time).getTime();
    const end = new Date(project.end_time).getTime();
    const now = Date.now();

    if (now < start) return 0;
    if (now > end) return 100;

    return Math.round(((now - start) / (end - start)) * 100);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const cardVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100, damping: 15 },
    },
  };

  const activeProjects = projects.filter(p => p.status === 'active');
  const otherProjects = projects.filter(p => p.status !== 'active');

  if (projects.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-16"
      >
        <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
          <FileText className="w-12 h-12 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">暂无投票项目</h3>
        <p className="text-gray-500">当前没有可参与的投票项目</p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-8">
      {activeProjects.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-green-600" />
            进行中的投票
          </h2>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {activeProjects.map((project) => {
              const hasVoted = votedProjects.has(project.project_id);
              const statusConfig = getStatusConfig(project.status, hasVoted);
              const StatusIcon = statusConfig.icon;
              const progress = getProgressPercentage(project);

              return (
                <motion.div
                  key={project.project_id}
                  variants={cardVariants}
                  whileHover={statusConfig.canVote ? { scale: 1.02, y: -5 } : {}}
                  whileTap={statusConfig.canVote ? { scale: 0.98 } : {}}
                  onClick={() => statusConfig.canVote && onSelectProject(project)}
                  className={`bg-white rounded-xl shadow-sm border overflow-hidden ${statusConfig.canVote
                      ? 'cursor-pointer border-gray-200 hover:border-indigo-300 hover:shadow-md'
                      : 'border-gray-200'
                    }`}
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                        {project.name}
                      </h3>
                      <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {statusConfig.label}
                      </span>
                    </div>

                    <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                      {project.description}
                    </p>

                    <div className="mb-4">
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                        <span>投票进度</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                          className={`h-full rounded-full ${hasVoted ? 'bg-blue-500' : 'bg-gradient-to-r from-indigo-500 to-purple-500'
                            }`}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{project.candidates.length} 位候选人</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(project.created_at)}</span>
                      </div>
                    </div>
                  </div>

                  {statusConfig.canVote && (
                    <div className="px-5 py-3 bg-gradient-to-r from-indigo-50 to-purple-50 border-t border-gray-100">
                      <p className="text-sm text-indigo-600 font-medium text-center">
                        点击参与投票 →
                      </p>
                    </div>
                  )}

                  {hasVoted && (
                    <div className="px-5 py-3 bg-blue-50 border-t border-blue-100">
                      <p className="text-sm text-blue-600 font-medium text-center flex items-center justify-center gap-1">
                        <CheckCircle className="w-4 h-4" />
                        您已完成投票
                      </p>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      )}

      {otherProjects.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-gray-600" />
            其他项目
          </h2>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {otherProjects.map((project) => {
              const hasVoted = votedProjects.has(project.project_id);
              const statusConfig = getStatusConfig(project.status, hasVoted);
              const StatusIcon = statusConfig.icon;
              const progress = getProgressPercentage(project);

              return (
                <motion.div
                  key={project.project_id}
                  variants={cardVariants}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden opacity-75"
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                        {project.name}
                      </h3>
                      <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {statusConfig.label}
                      </span>
                    </div>

                    <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                      {project.description}
                    </p>

                    <div className="mb-4">
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                        <span>进度</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                          className="h-full bg-gray-400 rounded-full"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{project.candidates.length} 位候选人</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(project.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ProjectList;
