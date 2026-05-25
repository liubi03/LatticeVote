import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shield,
  Vote,
  Clock,
  CheckCircle,
  AlertCircle,
  Play,
  Pause,
  BarChart3,
  Users,
  Calendar,
  ChevronRight,
  RefreshCw,
} from 'lucide-react'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import TallyOperation from '../components/trustee/TallyOperation'
import TallyResult from '../components/trustee/TallyResult'
import type { Project, TallyResult as TallyResultType } from '../types/index'

interface ProjectWithStats extends Project {
  vote_count?: number
  my_tally_status?: 'pending' | 'completed' | 'not_started'
}

const mockProjects: ProjectWithStats[] = [
  {
    project_id: '1',
    name: '学生会主席选举',
    description: '2024年度学生会主席选举投票',
    candidates: ['张三', '李四', '王五'],
    status: 'active',
    created_at: '2024-03-15T10:00:00',
    created_by: 'admin',
    trustees: ['trustee1', 'trustee2'],
    voters: ['voter1', 'voter2', 'voter3'],
    start_time: '2024-03-15T10:00:00',
    end_time: '2024-03-20T18:00:00',
    vote_count: 156,
    my_tally_status: 'pending',
  },
  {
    project_id: '2',
    name: '班级代表选举',
    description: '各班级代表选举投票',
    candidates: ['赵六', '钱七', '孙八', '周九'],
    status: 'finished',
    created_at: '2024-03-10T08:00:00',
    created_by: 'admin',
    trustees: ['trustee1', 'trustee3'],
    voters: ['voter1', 'voter2', 'voter3', 'voter4'],
    start_time: '2024-03-10T08:00:00',
    end_time: '2024-03-15T18:00:00',
    vote_count: 89,
    my_tally_status: 'completed',
  },
  {
    project_id: '3',
    name: '社团负责人选举',
    description: '科技社团负责人选举',
    candidates: ['候选人A', '候选人B'],
    status: 'active',
    created_at: '2024-03-18T09:00:00',
    created_by: 'admin',
    trustees: ['trustee1', 'trustee2'],
    voters: ['voter1', 'voter2'],
    start_time: '2024-03-18T09:00:00',
    end_time: '2024-03-25T20:00:00',
    vote_count: 45,
    my_tally_status: 'not_started',
  },
]

const statusConfig = {
  draft: { label: '草稿', color: 'gray', icon: AlertCircle },
  active: { label: '进行中', color: 'green', icon: Play },
  paused: { label: '已暂停', color: 'yellow', icon: Pause },
  finished: { label: '已结束', color: 'blue', icon: CheckCircle },
  tallied: { label: '已计票', color: 'indigo', icon: BarChart3 },
}

export default function TrusteeDashboard() {
  const [projects, setProjects] = useState<ProjectWithStats[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedProject, setSelectedProject] = useState<ProjectWithStats | null>(null)
  const [showTallyModal, setShowTallyModal] = useState(false)
  const [tallyResult, setTallyResult] = useState<TallyResultType | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const loadProjects = useCallback(async () => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 800))
    setProjects(mockProjects)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    const timeout = setTimeout(() => loadProjects(), 0)
    return () => clearTimeout(timeout)
  }, [loadProjects])

  const handleRefresh = async () => {
    setRefreshing(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setRefreshing(false)
  }

  const handleStartTally = (project: ProjectWithStats) => {
    setSelectedProject(project)
    setShowTallyModal(true)
  }

  const handleTallyComplete = (result: TallyResultType) => {
    setTallyResult(result)
    setProjects((prev) =>
      prev.map((p) =>
        p.project_id === selectedProject?.project_id
          ? { ...p, status: 'tallied' as const, my_tally_status: 'completed' as const }
          : p
      )
    )
  }

  const handleCloseResult = () => {
    setTallyResult(null)
    setShowTallyModal(false)
    setSelectedProject(null)
  }

  const getStatusBadge = (status: Project['status']) => {
    const config = statusConfig[status]
    const Icon = config.icon
    const colorClasses: Record<string, string> = {
      gray: 'bg-gray-100 text-gray-700 border-gray-200',
      green: 'bg-green-100 text-green-700 border-green-200',
      yellow: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      blue: 'bg-blue-100 text-blue-700 border-blue-200',
      indigo: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    }

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${colorClasses[config.color]}`}
      >
        <Icon size={12} />
        {config.label}
      </span>
    )
  }

  const getTallyStatusBadge = (status?: 'pending' | 'completed' | 'not_started') => {
    if (!status) return null

    const configs = {
      pending: {
        label: '待计票',
        className: 'bg-amber-100 text-amber-700 border-amber-200',
      },
      completed: {
        label: '已计票',
        className: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      },
      not_started: {
        label: '未开始',
        className: 'bg-slate-100 text-slate-600 border-slate-200',
      },
    }

    const config = configs[status]
    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${config.className}`}
      >
        {config.label}
      </span>
    )
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.div
                className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg"
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <Shield className="w-8 h-8 text-white" />
              </motion.div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">受托人控制台</h1>
                <p className="text-gray-500 mt-1">管理投票项目并执行计票任务</p>
              </div>
            </div>
            <motion.button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
              刷新
            </motion.button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
        >
          {[
            {
              label: '参与项目',
              value: projects.length,
              icon: Vote,
              color: 'from-blue-500 to-cyan-500',
            },
            {
              label: '进行中',
              value: projects.filter((p) => p.status === 'active').length,
              icon: Play,
              color: 'from-green-500 to-emerald-500',
            },
            {
              label: '待计票',
              value: projects.filter((p) => p.my_tally_status === 'pending').length,
              icon: Clock,
              color: 'from-amber-500 to-orange-500',
            },
            {
              label: '已完成',
              value: projects.filter((p) => p.my_tally_status === 'completed').length,
              icon: CheckCircle,
              color: 'from-indigo-500 to-purple-500',
            },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.color}`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Card
            title="项目列表"
            subtitle="您参与的投票项目"
            className="shadow-lg border-0"
          >
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full"
                />
              </div>
            ) : (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-4"
              >
                <AnimatePresence>
                  {projects.map((project) => (
                    <motion.div
                      key={project.project_id}
                      variants={itemVariants}
                      layout
                      className="group relative bg-gradient-to-r from-white to-gray-50 rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-indigo-200 transition-all duration-300"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                              {project.name}
                            </h3>
                            {getStatusBadge(project.status)}
                            {getTallyStatusBadge(project.my_tally_status)}
                          </div>
                          <p className="text-gray-500 text-sm mb-3">{project.description}</p>
                          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1.5">
                              <Users size={16} className="text-gray-400" />
                              <span>{project.candidates.length} 位候选人</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Vote size={16} className="text-gray-400" />
                              <span>{project.vote_count || 0} 票已投</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Calendar size={16} className="text-gray-400" />
                              <span>
                                {new Date(project.created_at).toLocaleDateString('zh-CN')}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          {project.status === 'finished' &&
                            project.my_tally_status !== 'completed' && (
                              <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                              >
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={() => handleStartTally(project)}
                                  className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
                                >
                                  <BarChart3 size={16} className="mr-1" />
                                  执行计票
                                </Button>
                              </motion.div>
                            )}
                          {project.my_tally_status === 'completed' && (
                            <motion.div
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                            >
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleStartTally(project)}
                                className="border-indigo-500 text-indigo-600 hover:bg-indigo-50"
                              >
                                <ChevronRight size={16} className="mr-1" />
                                查看结果
                              </Button>
                            </motion.div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </Card>
        </motion.div>
      </div>

      <AnimatePresence>
        {showTallyModal && selectedProject && !tallyResult && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowTallyModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl"
            >
              <TallyOperation
                project={selectedProject}
                onComplete={handleTallyComplete}
                onCancel={() => setShowTallyModal(false)}
              />
            </motion.div>
          </motion.div>
        )}

        {tallyResult && selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={handleCloseResult}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-3xl"
            >
              <TallyResult
                result={tallyResult}
                projectName={selectedProject.name}
                onClose={handleCloseResult}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
