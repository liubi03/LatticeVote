import { motion } from 'framer-motion'
import {
  Play,
  Pause,
  Square,
  CheckCircle,
  Clock,
  Users,
  Calendar,
  MoreVertical
} from 'lucide-react'
import type { Project } from '../../types/index'

interface ProjectCardProps {
  project: Project
  onStart?: () => void
  onPause?: () => void
  onFinish?: () => void
  onView?: () => void
}

const statusConfig = {
  draft: {
    label: '草稿',
    color: 'bg-gray-100 text-gray-700',
    icon: Clock,
  },
  active: {
    label: '进行中',
    color: 'bg-green-100 text-green-700',
    icon: Play,
  },
  paused: {
    label: '已暂停',
    color: 'bg-yellow-100 text-yellow-700',
    icon: Pause,
  },
  finished: {
    label: '已结束',
    color: 'bg-blue-100 text-blue-700',
    icon: Square,
  },
  tallied: {
    label: '已计票',
    color: 'bg-purple-100 text-purple-700',
    icon: CheckCircle,
  },
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onStart,
  onPause,
  onFinish,
  onView,
}) => {
  const status = statusConfig[project.status]
  const StatusIcon = status.icon

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300"
    >
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {project.name}
            </h3>
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
              {project.description}
            </p>
          </div>
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${status.color}`}>
            <StatusIcon size={12} />
            <span>{status.label}</span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
          <div className="flex items-center gap-1">
            <Users size={14} />
            <span>{project.candidates.length} 位候选人</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar size={14} />
            <span>{formatDate(project.created_at)}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {project.candidates.slice(0, 3).map((candidate, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs rounded-md"
            >
              {candidate}
            </span>
          ))}
          {project.candidates.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
              +{project.candidates.length - 3}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
          {project.status === 'draft' && onStart && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onStart}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
            >
              <Play size={14} />
              启动
            </motion.button>
          )}

          {project.status === 'active' && onPause && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onPause}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-yellow-600 text-white text-sm font-medium rounded-lg hover:bg-yellow-700 transition-colors"
            >
              <Pause size={14} />
              暂停
            </motion.button>
          )}

          {project.status === 'paused' && onStart && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onStart}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
            >
              <Play size={14} />
              继续
            </motion.button>
          )}

          {(project.status === 'active' || project.status === 'paused') && onFinish && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onFinish}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Square size={14} />
              结束
            </motion.button>
          )}

          {onView && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onView}
              className="px-3 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              <MoreVertical size={14} />
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default ProjectCard
