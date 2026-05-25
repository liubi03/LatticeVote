import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Users,
  FolderKanban,
  Activity,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  UserCheck,
  BarChart3,
  Shield,
  Zap,
} from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { userApi, projectApi } from '../services/api'
import type { User, Project } from '../types/index'
import UserManagement from '../components/admin/UserManagement'
import ProjectManagement from '../components/admin/ProjectManagement'

type TabType = 'overview' | 'users' | 'projects'

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [users, setUsers] = useState<User[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const user = useAuthStore((state) => state.user)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [usersRes, projectsRes] = await Promise.all([
        userApi.getUsers(),
        projectApi.getProjects(),
      ])
      setUsers(usersRes.data || [])
      setProjects(projectsRes.data || [])
    } catch (err: any) {
      setError(err.response?.data?.message || '加载数据失败')
    } finally {
      setIsLoading(false)
    }
  }

  const handleApproveUser = async (userId: string) => {
    try {
      await userApi.updateUserStatus(userId, 'active')
      setUsers((prev) =>
        prev.map((u) =>
          u.user_id === userId ? { ...u, status: 'active' } : u
        )
      )
    } catch (err: any) {
      throw err
    }
  }

  const handleRejectUser = async (userId: string) => {
    try {
      await userApi.updateUserStatus(userId, 'rejected')
      setUsers((prev) =>
        prev.map((u) =>
          u.user_id === userId ? { ...u, status: 'rejected' } : u
        )
      )
    } catch (err: any) {
      throw err
    }
  }

  const handleCreateProject = async (data: {
    name: string
    description: string
    candidates: string[]
    trustees: string[]
    voters: string[]
  }) => {
    try {
      const res = await projectApi.createProject(data)
      const newProject = res.data.data
      setProjects((prev) => [...prev, newProject])
    } catch (err: any) {
      throw err
    }
  }

  const handleStartProject = async (projectId: string) => {
    try {
      await projectApi.startProject(projectId)
      setProjects((prev) =>
        prev.map((p) =>
          p.project_id === projectId ? { ...p, status: 'active' } : p
        )
      )
    } catch (err: any) {
      throw err
    }
  }

  const handlePauseProject = async (projectId: string) => {
    try {
      await projectApi.pauseProject(projectId)
      setProjects((prev) =>
        prev.map((p) =>
          p.project_id === projectId ? { ...p, status: 'paused' } : p
        )
      )
    } catch (err: any) {
      throw err
    }
  }

  const handleFinishProject = async (projectId: string) => {
    try {
      await projectApi.finishProject(projectId)
      setProjects((prev) =>
        prev.map((p) =>
          p.project_id === projectId ? { ...p, status: 'finished' } : p
        )
      )
    } catch (err: any) {
      throw err
    }
  }

  const stats = {
    totalUsers: users.length,
    pendingUsers: users.filter((u) => u.status === 'pending').length,
    activeUsers: users.filter((u) => u.status === 'active').length,
    totalProjects: projects.length,
    activeProjects: projects.filter((p) => p.status === 'active').length,
    draftProjects: projects.filter((p) => p.status === 'draft').length,
  }

  const pendingUsers = users.filter((u) => u.status === 'pending')
  const recentProjects = projects
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)

  const statCards = [
    {
      title: '用户总数',
      value: stats.totalUsers,
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      title: '项目总数',
      value: stats.totalProjects,
      icon: FolderKanban,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
    },
    {
      title: '进行中项目',
      value: stats.activeProjects,
      icon: Activity,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
    },
    {
      title: '待审核用户',
      value: stats.pendingUsers,
      icon: Clock,
      color: 'from-yellow-500 to-yellow-600',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600',
    },
  ]

  const tabs = [
    { id: 'overview' as TabType, label: '概览', icon: BarChart3 },
    { id: 'users' as TabType, label: '用户管理', icon: Users },
    { id: 'projects' as TabType, label: '项目管理', icon: FolderKanban },
  ]

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full"
          />
          <p className="text-gray-600">加载中...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Shield size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold">管理员控制台</h1>
                <p className="text-indigo-200 text-sm">
                  欢迎，{user?.username || '管理员'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 px-3 py-1.5 bg-white/10 rounded-lg text-sm">
                <Zap size={14} />
                <span>后量子安全</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-2 mb-6">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${activeTab === tab.id
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
              >
                <Icon size={18} />
                {tab.label}
              </motion.button>
            )
          })}
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3"
          >
            <AlertCircle size={20} className="text-red-600" />
            <span className="text-red-700">{error}</span>
            <button
              onClick={fetchData}
              className="ml-auto text-red-600 hover:text-red-700 underline text-sm"
            >
              重试
            </button>
          </motion.div>
        )}

        {activeTab === 'overview' && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {statCards.map((stat, index) => {
                const Icon = stat.icon
                return (
                  <motion.div
                    key={stat.title}
                    variants={itemVariants}
                    whileHover={{ y: -4, scale: 1.02 }}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-5"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className={`p-2.5 rounded-lg ${stat.bgColor}`}>
                        <Icon size={20} className={stat.textColor} />
                      </div>
                      <TrendingUp size={16} className="text-gray-400" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {stat.value}
                    </div>
                    <div className="text-sm text-gray-500">{stat.title}</div>
                  </motion.div>
                )
              })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <motion.div
                variants={itemVariants}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
              >
                <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserCheck size={18} className="text-indigo-600" />
                    <h3 className="font-semibold text-gray-900">待审核用户</h3>
                  </div>
                  <span className="text-sm text-gray-500">
                    {pendingUsers.length} 位
                  </span>
                </div>
                <div className="p-5">
                  {pendingUsers.length === 0 ? (
                    <div className="flex flex-col items-center py-8 text-gray-500">
                      <CheckCircle size={32} className="text-green-500 mb-2" />
                      <p>暂无待审核用户</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {pendingUsers.slice(0, 5).map((pendingUser) => (
                        <motion.div
                          key={pendingUser.user_id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-medium">
                              {pendingUser.username.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">
                                {pendingUser.username}
                              </div>
                              <div className="text-xs text-gray-500">
                                {pendingUser.role === 'voter' ? '选民' : '受托人'}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleApproveUser(pendingUser.user_id)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                            >
                              <CheckCircle size={16} />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleRejectUser(pendingUser.user_id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                            >
                              <AlertCircle size={16} />
                            </motion.button>
                          </div>
                        </motion.div>
                      ))}
                      {pendingUsers.length > 5 && (
                        <button
                          onClick={() => setActiveTab('users')}
                          className="w-full text-center text-sm text-indigo-600 hover:text-indigo-700 py-2"
                        >
                          查看全部 {pendingUsers.length} 位待审核用户
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
              >
                <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FolderKanban size={18} className="text-purple-600" />
                    <h3 className="font-semibold text-gray-900">最近项目</h3>
                  </div>
                  <span className="text-sm text-gray-500">
                    {projects.length} 个项目
                  </span>
                </div>
                <div className="p-5">
                  {recentProjects.length === 0 ? (
                    <div className="flex flex-col items-center py-8 text-gray-500">
                      <FolderKanban size={32} className="text-gray-300 mb-2" />
                      <p>暂无项目</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {recentProjects.map((project) => {
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
                          <motion.div
                            key={project.project_id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-gray-900 truncate">
                                {project.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                {project.candidates.length} 位候选人
                              </div>
                            </div>
                            <span
                              className={`ml-3 px-2 py-1 rounded-full text-xs font-medium ${statusColors[project.status]
                                }`}
                            >
                              {statusLabels[project.status]}
                            </span>
                          </motion.div>
                        )
                      })}
                      {projects.length > 5 && (
                        <button
                          onClick={() => setActiveTab('projects')}
                          className="w-full text-center text-sm text-indigo-600 hover:text-indigo-700 py-2"
                        >
                          查看全部 {projects.length} 个项目
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}

        {activeTab === 'users' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <UserManagement
              users={users}
              onApprove={handleApproveUser}
              onReject={handleRejectUser}
              isLoading={isLoading}
            />
          </motion.div>
        )}

        {activeTab === 'projects' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ProjectManagement
              projects={projects}
              users={users}
              onCreateProject={handleCreateProject}
              onStartProject={handleStartProject}
              onPauseProject={handlePauseProject}
              onFinishProject={handleFinishProject}
              isLoading={isLoading}
            />
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard
