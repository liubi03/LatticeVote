import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Search,
  Filter,
  LayoutGrid,
  List,
  FolderOpen,
  Users,
  Shield,
  Calendar,
  Play,
  Pause,
  Square,
  CheckCircle,
} from 'lucide-react'
import Button from '../common/Button'
import ProjectCard from './ProjectCard'
import CreateProjectForm from './CreateProjectForm'
import Modal from '../common/Modal'
import type { Project, User } from '../../types/index'

interface ProjectManagementProps {
  projects: Project[]
  users: User[]
  onCreateProject: (data: {
    name: string
    description: string
    candidates: string[]
    trustees: string[]
    voters: string[]
  }) => Promise<void>
  onStartProject: (projectId: string) => Promise<void>
  onPauseProject: (projectId: string) => Promise<void>
  onFinishProject: (projectId: string) => Promise<void>
  isLoading?: boolean
}

const statusFilters = [
  { value: 'all', label: '全部' },
  { value: 'draft', label: '草稿' },
  { value: 'active', label: '进行中' },
  { value: 'paused', label: '已暂停' },
  { value: 'finished', label: '已结束' },
  { value: 'tallied', label: '已计票' },
]

const ProjectManagement: React.FC<ProjectManagementProps> = ({
  projects,
  users,
  onCreateProject,
  onStartProject,
  onPauseProject,
  onFinishProject,
  isLoading = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [showProjectDetails, setShowProjectDetails] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch =
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus =
        statusFilter === 'all' || project.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [projects, searchTerm, statusFilter])

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    projects.forEach((p) => {
      counts[p.status] = (counts[p.status] || 0) + 1
    })
    return counts
  }, [projects])

  const handleStart = async (projectId: string) => {
    setActionLoading(projectId)
    try {
      await onStartProject(projectId)
    } finally {
      setActionLoading(null)
    }
  }

  const handlePause = async (projectId: string) => {
    setActionLoading(projectId)
    try {
      await onPauseProject(projectId)
    } finally {
      setActionLoading(null)
    }
  }

  const handleFinish = async (projectId: string) => {
    setActionLoading(projectId)
    try {
      await onFinishProject(projectId)
    } finally {
      setActionLoading(null)
    }
  }

  const viewProjectDetails = (project: Project) => {
    setSelectedProject(project)
    setShowProjectDetails(true)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getUserName = (userId: string) => {
    const user = users.find((u) => u.user_id === userId)
    return user?.username || userId.slice(0, 8)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="搜索项目..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            {statusFilters.map((filter) => (
              <motion.button
                key={filter.value}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setStatusFilter(filter.value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${statusFilter === filter.value
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                {filter.label}
                {filter.value !== 'all' && statusCounts[filter.value] && (
                  <span className="ml-1 opacity-70">
                    ({statusCounts[filter.value]})
                  </span>
                )}
              </motion.button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${viewMode === 'grid'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              <LayoutGrid size={18} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${viewMode === 'list'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              <List size={18} />
            </motion.button>
          </div>

          <Button
            variant="primary"
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2"
          >
            <Plus size={18} />
            创建项目
          </Button>
        </div>
      </div>

      {filteredProjects.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-gray-200"
        >
          <FolderOpen size={48} className="text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            暂无项目
          </h3>
          <p className="text-gray-500 mb-4">
            {searchTerm || statusFilter !== 'all'
              ? '没有符合条件的项目'
              : '点击上方按钮创建第一个投票项目'}
          </p>
          {!searchTerm && statusFilter === 'all' && (
            <Button
              variant="primary"
              onClick={() => setShowCreateForm(true)}
            >
              <Plus size={16} className="mr-2" />
              创建项目
            </Button>
          )}
        </motion.div>
      ) : viewMode === 'grid' ? (
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          <AnimatePresence>
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.project_id}
                project={project}
                onStart={() => handleStart(project.project_id)}
                onPause={() => handlePause(project.project_id)}
                onFinish={() => handleFinish(project.project_id)}
                onView={() => viewProjectDetails(project)}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  项目名称
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  状态
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  候选人
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  创建时间
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <AnimatePresence>
                {filteredProjects.map((project, index) => {
                  const statusColors: Record<string, string> = {
                    draft: 'bg-gray-100 text-gray-700',
                    active: 'bg-green-100 text-green-700',
                    paused: 'bg-yellow-100 text-yellow-700',
                    finished: 'bg-blue-100 text-blue-700',
                    tallied: 'bg-purple-100 text-purple-700',
                  }
                  const statusLabels: Record<string, string> = {
                    draft: '草稿',
                    active: '进行中',
                    paused: '已暂停',
                    finished: '已结束',
                    tallied: '已计票',
                  }

                  return (
                    <motion.tr
                      key={project.project_id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900">
                            {project.name}
                          </div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {project.description}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[project.status]
                            }`}
                        >
                          {statusLabels[project.status]}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {project.candidates.length} 位
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {formatDate(project.created_at)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {project.status === 'draft' && (
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleStart(project.project_id)}
                              disabled={actionLoading === project.project_id}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                              title="启动"
                            >
                              <Play size={16} />
                            </motion.button>
                          )}
                          {project.status === 'active' && (
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handlePause(project.project_id)}
                              disabled={actionLoading === project.project_id}
                              className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg"
                              title="暂停"
                            >
                              <Pause size={16} />
                            </motion.button>
                          )}
                          {project.status === 'paused' && (
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleStart(project.project_id)}
                              disabled={actionLoading === project.project_id}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                              title="继续"
                            >
                              <Play size={16} />
                            </motion.button>
                          )}
                          {(project.status === 'active' ||
                            project.status === 'paused') && (
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleFinish(project.project_id)}
                                disabled={actionLoading === project.project_id}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                title="结束"
                              >
                                <Square size={16} />
                              </motion.button>
                            )}
                        </div>
                      </td>
                    </motion.tr>
                  )
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      )}

      <CreateProjectForm
        isOpen={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        onSubmit={onCreateProject}
        users={users}
      />

      <Modal
        isOpen={showProjectDetails}
        onClose={() => setShowProjectDetails(false)}
        title="项目详情"
        size="lg"
      >
        {selectedProject && (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {selectedProject.name}
              </h3>
              <p className="text-gray-600">{selectedProject.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">项目 ID</p>
                <p className="text-sm font-mono text-gray-900">
                  {selectedProject.project_id}
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">创建时间</p>
                <p className="text-sm text-gray-900">
                  {formatDate(selectedProject.created_at)}
                </p>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Users size={16} />
                候选人 ({selectedProject.candidates.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedProject.candidates.map((candidate, index) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 bg-indigo-50 text-indigo-700 text-sm rounded-lg"
                  >
                    {candidate}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Shield size={16} />
                受托人 ({selectedProject.trustees.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedProject.trustees.map((trusteeId) => (
                  <span
                    key={trusteeId}
                    className="px-3 py-1.5 bg-purple-50 text-purple-700 text-sm rounded-lg"
                  >
                    {getUserName(trusteeId)}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Users size={16} />
                选民 ({selectedProject.voters.length})
              </h4>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                {selectedProject.voters.map((voterId) => (
                  <span
                    key={voterId}
                    className="px-3 py-1.5 bg-blue-50 text-blue-700 text-sm rounded-lg"
                  >
                    {getUserName(voterId)}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default ProjectManagement
