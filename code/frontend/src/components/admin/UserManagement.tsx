import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Filter,
  UserCheck,
  UserX,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  Shield,
  Users as UsersIcon,
  ChevronDown,
} from 'lucide-react'
import Button from '../common/Button'
import Modal from '../common/Modal'
import type { User } from '../../types/index'

interface UserManagementProps {
  users: User[]
  onApprove: (userId: string) => Promise<void>
  onReject: (userId: string) => Promise<void>
  isLoading?: boolean
}

const statusConfig = {
  pending: {
    label: '待审核',
    color: 'bg-yellow-100 text-yellow-700',
    icon: Clock,
  },
  active: {
    label: '已激活',
    color: 'bg-green-100 text-green-700',
    icon: CheckCircle,
  },
  rejected: {
    label: '已拒绝',
    color: 'bg-red-100 text-red-700',
    icon: XCircle,
  },
}

const roleConfig = {
  admin: { label: '管理员', color: 'bg-purple-100 text-purple-700', icon: Shield },
  voter: { label: '选民', color: 'bg-blue-100 text-blue-700', icon: UsersIcon },
  trustee: { label: '受托人', color: 'bg-indigo-100 text-indigo-700', icon: Shield },
}

const UserManagement: React.FC<UserManagementProps> = ({
  users,
  onApprove,
  onReject,
  isLoading = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch = user.username
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
      const matchesStatus =
        statusFilter === 'all' || user.status === statusFilter
      const matchesRole = roleFilter === 'all' || user.role === roleFilter
      return matchesSearch && matchesStatus && matchesRole
    })
  }, [users, searchTerm, statusFilter, roleFilter])

  const pendingCount = users.filter((u) => u.status === 'pending').length

  const handleApprove = async (userId: string) => {
    setActionLoading(userId)
    try {
      await onApprove(userId)
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (userId: string) => {
    setActionLoading(userId)
    try {
      await onReject(userId)
    } finally {
      setActionLoading(null)
    }
  }

  const viewUserDetails = (user: User) => {
    setSelectedUser(user)
    setShowDetails(true)
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

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="搜索用户名..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div className="flex gap-2">
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-sm"
            >
              <option value="all">全部状态</option>
              <option value="pending">待审核</option>
              <option value="active">已激活</option>
              <option value="rejected">已拒绝</option>
            </select>
            <ChevronDown
              size={14}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
          </div>

          <div className="relative">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-sm"
            >
              <option value="all">全部角色</option>
              <option value="voter">选民</option>
              <option value="trustee">受托人</option>
              <option value="admin">管理员</option>
            </select>
            <ChevronDown
              size={14}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
          </div>
        </div>
      </div>

      {pendingCount > 0 && statusFilter === 'pending' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-2"
        >
          <Clock size={18} className="text-yellow-600" />
          <span className="text-yellow-800 text-sm">
            有 {pendingCount} 位用户等待审核
          </span>
        </motion.div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  用户
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  角色
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  状态
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  注册时间
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <AnimatePresence>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      暂无用户数据
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user, index) => {
                    const status = statusConfig[user.status]
                    const role = roleConfig[user.role]
                    const StatusIcon = status.icon
                    const RoleIcon = role.icon

                    return (
                      <motion.tr
                        key={user.user_id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-medium">
                              {user.username.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">
                                {user.username}
                              </div>
                              <div className="text-sm text-gray-500">
                                ID: {user.user_id.slice(0, 8)}...
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${role.color}`}
                          >
                            <RoleIcon size={12} />
                            {role.label}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${status.color}`}
                          >
                            <StatusIcon size={12} />
                            {status.label}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {formatDate(user.created_at)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => viewUserDetails(user)}
                              className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                              title="查看详情"
                            >
                              <Eye size={16} />
                            </motion.button>

                            {user.status === 'pending' && (
                              <>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => handleApprove(user.user_id)}
                                  disabled={actionLoading === user.user_id}
                                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                                  title="批准"
                                >
                                  <UserCheck size={16} />
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => handleReject(user.user_id)}
                                  disabled={actionLoading === user.user_id}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                  title="拒绝"
                                >
                                  <UserX size={16} />
                                </motion.button>
                              </>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    )
                  })
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
        title="用户详情"
        size="md"
      >
        {selectedUser && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-2xl font-medium">
                {selectedUser.username.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {selectedUser.username}
                </h3>
                <p className="text-sm text-gray-500">
                  {roleConfig[selectedUser.role].label}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">用户 ID</p>
                <p className="text-sm font-mono text-gray-900">
                  {selectedUser.user_id}
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">状态</p>
                <p className="text-sm text-gray-900">
                  {statusConfig[selectedUser.status].label}
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">角色</p>
                <p className="text-sm text-gray-900">
                  {roleConfig[selectedUser.role].label}
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">注册时间</p>
                <p className="text-sm text-gray-900">
                  {formatDate(selectedUser.created_at)}
                </p>
              </div>
            </div>

            {selectedUser.public_key && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">公钥</p>
                <p className="text-sm font-mono text-gray-900 break-all">
                  {selectedUser.public_key.slice(0, 50)}...
                </p>
              </div>
            )}

            {selectedUser.status === 'pending' && (
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={() => setShowDetails(false)}
                >
                  关闭
                </Button>
                <Button
                  variant="danger"
                  onClick={() => {
                    handleReject(selectedUser.user_id)
                    setShowDetails(false)
                  }}
                  isLoading={actionLoading === selectedUser.user_id}
                >
                  拒绝
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    handleApprove(selectedUser.user_id)
                    setShowDetails(false)
                  }}
                  isLoading={actionLoading === selectedUser.user_id}
                >
                  批准
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}

export default UserManagement
