import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, X, Users, Shield, FileText } from 'lucide-react'
import Button from '../common/Button'
import Input from '../common/Input'
import Modal from '../common/Modal'
import type { User } from '../../types/index'

interface CreateProjectFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: {
    name: string
    description: string
    candidates: string[]
    trustees: string[]
    voters: string[]
  }) => Promise<void>
  users: User[]
}

const CreateProjectForm: React.FC<CreateProjectFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  users,
}) => {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [candidatesText, setCandidatesText] = useState('')
  const [selectedTrustees, setSelectedTrustees] = useState<string[]>([])
  const [selectedVoters, setSelectedVoters] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const candidates = candidatesText
    .split('\n')
    .map((c) => c.trim())
    .filter((c) => c.length > 0)

  const trusteeUsers = users.filter((u) => u.role === 'trustee' && u.status === 'active')
  const voterUsers = users.filter((u) => u.role === 'voter' && u.status === 'active')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!name.trim()) {
      setError('请输入项目名称')
      return
    }
    if (candidates.length < 2) {
      setError('至少需要2位候选人')
      return
    }
    if (selectedTrustees.length < 1) {
      setError('至少需要1位受托人')
      return
    }

    setIsLoading(true)
    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim(),
        candidates,
        trustees: selectedTrustees,
        voters: selectedVoters,
      })
      handleReset()
      onClose()
    } catch (err: any) {
      setError(err.response?.data?.message || '创建失败')
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    setName('')
    setDescription('')
    setCandidatesText('')
    setSelectedTrustees([])
    setSelectedVoters([])
    setError('')
  }

  const toggleTrustee = (userId: string) => {
    setSelectedTrustees((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    )
  }

  const toggleVoter = (userId: string) => {
    setSelectedVoters((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    )
  }

  const selectAllVoters = () => {
    setSelectedVoters(voterUsers.map((u) => u.user_id))
  }

  const clearVoters = () => {
    setSelectedVoters([])
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="创建投票项目"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
          >
            {error}
          </motion.div>
        )}

        <div className="flex items-center gap-2 text-gray-700 mb-3">
          <FileText size={18} />
          <span className="font-medium">基本信息</span>
        </div>

        <Input
          label="项目名称"
          placeholder="输入项目名称"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            项目描述
          </label>
          <textarea
            className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
            placeholder="输入项目描述（可选）"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            候选人列表 <span className="text-gray-400 font-normal">(每行一位)</span>
          </label>
          <textarea
            className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none font-mono text-sm"
            placeholder="张三&#10;李四&#10;王五"
            rows={4}
            value={candidatesText}
            onChange={(e) => setCandidatesText(e.target.value)}
          />
          <p className="mt-1 text-sm text-gray-500">
            已输入 {candidates.length} 位候选人
          </p>
        </div>

        <div className="pt-3 border-t border-gray-200">
          <div className="flex items-center gap-2 text-gray-700 mb-3">
            <Shield size={18} />
            <span className="font-medium">受托人选择</span>
          </div>
          <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto p-2 bg-gray-50 rounded-lg">
            {trusteeUsers.length === 0 ? (
              <p className="col-span-2 text-sm text-gray-500 text-center py-2">
                暂无可用受托人
              </p>
            ) : (
              trusteeUsers.map((user) => (
                <motion.button
                  key={user.user_id}
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => toggleTrustee(user.user_id)}
                  className={`p-2 rounded-lg text-sm text-left transition-colors ${
                    selectedTrustees.includes(user.user_id)
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white border border-gray-200 text-gray-700 hover:border-indigo-300'
                  }`}
                >
                  {user.username}
                </motion.button>
              ))
            )}
          </div>
          <p className="mt-1 text-sm text-gray-500">
            已选择 {selectedTrustees.length} 位受托人
          </p>
        </div>

        <div className="pt-3 border-t border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-gray-700">
              <Users size={18} />
              <span className="font-medium">选民选择</span>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={selectAllVoters}
                className="text-xs text-indigo-600 hover:text-indigo-700"
              >
                全选
              </button>
              <button
                type="button"
                onClick={clearVoters}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                清空
              </button>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto p-2 bg-gray-50 rounded-lg">
            {voterUsers.length === 0 ? (
              <p className="col-span-3 text-sm text-gray-500 text-center py-2">
                暂无可用选民
              </p>
            ) : (
              voterUsers.map((user) => (
                <motion.button
                  key={user.user_id}
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => toggleVoter(user.user_id)}
                  className={`p-2 rounded-lg text-sm text-left transition-colors ${
                    selectedVoters.includes(user.user_id)
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white border border-gray-200 text-gray-700 hover:border-indigo-300'
                  }`}
                >
                  {user.username}
                </motion.button>
              ))
            )}
          </div>
          <p className="mt-1 text-sm text-gray-500">
            已选择 {selectedVoters.length} 位选民
          </p>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              handleReset()
              onClose()
            }}
          >
            取消
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            disabled={isLoading}
          >
            <Plus size={16} className="mr-1" />
            创建项目
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default CreateProjectForm
