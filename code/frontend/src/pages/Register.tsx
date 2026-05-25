import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Lock, User, Shield, Zap, AlertCircle, Download, Check, Users } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import './Auth.css'

export default function Register() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState<string>('voter')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState<'form' | 'keygen' | 'success'>('form')
  const [generatedKeys, setGeneratedKeys] = useState<{
    publicKey: string
    privateKey: string
  } | null>(null)
  const navigate = useNavigate()
  const { register } = useAuthStore()

  const generateMockKeys = () => {
    const publicKey = Array.from({ length: 64 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('')
    const privateKey = Array.from({ length: 128 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('')
    return { publicKey, privateKey }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!username || !password) {
      setError('请填写所有必填项')
      return
    }

    if (password !== confirmPassword) {
      setError('两次输入的密码不一致')
      return
    }

    if (password.length < 6) {
      setError('密码长度至少为6位')
      return
    }

    setIsLoading(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 500))
      setStep('keygen')

      await new Promise((resolve) => setTimeout(resolve, 2000))
      const keys = generateMockKeys()
      setGeneratedKeys(keys)

      await new Promise((resolve) => setTimeout(resolve, 500))
      setStep('success')
    } catch {
      setError('注册失败，请重试')
      setStep('form')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownloadPrivateKey = () => {
    if (!generatedKeys) return
    const blob = new Blob([generatedKeys.privateKey], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `latticevote_private_key_${username}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleComplete = async () => {
    if (!generatedKeys) return
    const success = await register(username, password, role)
    if (success) {
      navigate('/login')
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-background">
        <div className="grid-pattern"></div>
        <motion.div
          className="glow-orb orb-1"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="glow-orb orb-2"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.2, 0.4],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      <motion.div
        className="auth-card register-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <AnimatePresence mode="wait">
          {step === 'form' && (
            <motion.div
              key="form"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <motion.div
                className="auth-header"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <div className="logo-container">
                  <motion.div
                    className="logo-icon"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Shield size={40} />
                  </motion.div>
                  <h1 className="logo-text">LatticeVote</h1>
                </div>
                <p className="tagline">创建您的安全投票账户</p>
              </motion.div>

              <div className="security-features">
                <motion.div
                  className="feature-item"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Zap size={16} className="feature-icon" />
                  <span>自动生成密钥对</span>
                </motion.div>
                <motion.div
                  className="feature-item"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Shield size={16} className="feature-icon" />
                  <span>基于格的数字签名</span>
                </motion.div>
              </div>

              <form onSubmit={handleSubmit} className="auth-form">
                {error && (
                  <motion.div
                    className="error-message"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                  >
                    <AlertCircle size={16} />
                    <span>{error}</span>
                  </motion.div>
                )}

                <motion.div
                  className="input-group"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="input-icon">
                    <User size={20} />
                  </div>
                  <input
                    type="text"
                    placeholder="用户名"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="auth-input"
                  />
                </motion.div>

                <motion.div
                  className="input-group"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <div className="input-icon">
                    <Lock size={20} />
                  </div>
                  <input
                    type="password"
                    placeholder="密码"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="auth-input"
                  />
                </motion.div>

                <motion.div
                  className="input-group"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.65 }}
                >
                  <div className="input-icon">
                    <Lock size={20} />
                  </div>
                  <input
                    type="password"
                    placeholder="确认密码"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="auth-input"
                  />
                </motion.div>

                <motion.div
                  className="role-selector"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <label className="role-label">选择角色</label>
                  <div className="role-options">
                    <motion.button
                      type="button"
                      className={`role-option ${role === 'voter' ? 'active' : ''}`}
                      onClick={() => setRole('voter')}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <User size={20} />
                      <span>选民</span>
                    </motion.button>
                    <motion.button
                      type="button"
                      className={`role-option ${role === 'trustee' ? 'active' : ''}`}
                      onClick={() => setRole('trustee')}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Users size={20} />
                      <span>受托人</span>
                    </motion.button>
                  </div>
                </motion.div>

                <motion.button
                  type="submit"
                  className="auth-button"
                  disabled={isLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  {isLoading ? '注册中...' : '注册'}
                </motion.button>
              </form>

              <motion.div
                className="auth-footer"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
              >
                <p>
                  已有账户？{' '}
                  <Link to="/login" className="auth-link">
                    立即登录
                  </Link>
                </p>
              </motion.div>
            </motion.div>
          )}

          {step === 'keygen' && (
            <motion.div
              key="keygen"
              className="keygen-step"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <div className="logo-container">
                <motion.div
                  className="logo-icon"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                >
                  <Shield size={50} />
                </motion.div>
              </div>
              <h2>正在生成密钥对</h2>
              <p className="keygen-info">基于格密码的安全密钥生成中...</p>
              <div className="keygen-progress">
                <motion.div
                  className="progress-bar"
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 2, ease: 'easeInOut' }}
                />
              </div>
              <div className="lattice-animation">
                {Array.from({ length: 16 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="lattice-node"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      delay: i * 0.1,
                      duration: 0.3,
                    }}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {step === 'success' && (
            <motion.div
              key="success"
              className="success-step"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <motion.div
                className="success-icon"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
              >
                <Check size={50} />
              </motion.div>
              <h2>注册成功！</h2>
              <p className="success-info">
                您的公钥已上传至服务器，私钥请妥善保存。
              </p>

              <div className="key-info">
                <div className="key-item">
                  <span className="key-label">公钥 (已上传)</span>
                  <code className="key-value">
                    {generatedKeys?.publicKey.slice(0, 24)}...
                  </code>
                </div>
                <div className="key-item private">
                  <span className="key-label">私钥 (请下载保存)</span>
                  <motion.button
                    className="download-btn"
                    onClick={handleDownloadPrivateKey}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Download size={18} />
                    <span>下载私钥</span>
                  </motion.button>
                </div>
              </div>

              <div className="warning-box">
                <AlertCircle size={18} />
                <p>
                  <strong>重要提醒：</strong>
                  私钥是您投票签名的唯一凭证，请务必安全保存。丢失私钥将无法恢复投票资格。
                </p>
              </div>

              <motion.button
                className="auth-button success-btn"
                onClick={handleComplete}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                进入控制台
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
