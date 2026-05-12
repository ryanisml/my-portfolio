import { useEffect, useRef, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFloppyDisk, faPen, faPlus, faTrash, faXmark } from '@fortawesome/free-solid-svg-icons'
import ReCAPTCHA from 'react-google-recaptcha'
import { useNavigate } from 'react-router-dom'

const ADMIN_SESSION_KEY = 'portfolio_admin_session'
const ADMIN_SESSION_DURATION_MS = 10 * 60 * 1000 * 24
const NOTIFICATION_DURATION_MS = 4000
const PROTECTED_SOCIAL_LABELS = new Set(['linkedin', 'github'])
const SUPPORTED_SOCIAL_ICONS = [
  'faInstagram',
  'faLinkedin',
  'faGithub',
  'faXTwitter',
  'faGoogle',
  'faFacebook',
  'faYoutube',
  'faSteam',
]

const TAB_CONFIG = {
  projects: {
    label: 'Projects',
    description: 'Portfolio projects, links, and detail content.',
  },
  slides: {
    label: 'Slides',
    description: 'Landing slide texts like eyebrow, title, and description.',
  },
  skills: {
    label: 'Skills',
    description: 'Skill groups and ordering shown in the skills section.',
  },
  experiences: {
    label: 'Experiences',
    description: 'Work experience records and timeline content.',
  },
  social: {
    label: 'Social Links',
    description: 'Footer social links and icon mapping names.',
  },
  contact: {
    label: 'Contact',
    description: 'Public contact details and map location.',
  },
  messages: {
    label: 'Messages',
    description: 'Inbox from contact form submissions.',
  },
}

const TAB_CRUD_CONFIG = {
  projects: { path: '/api/projects', idKey: 'slug' },
  slides: { path: '/api/slides', idKey: 'id' },
  skills: { path: '/api/skills', idKey: 'id' },
  experiences: { path: '/api/experiences', idKey: 'id' },
  social: { path: '/api/social-links', idKey: 'id' },
  contact: { path: '/api/contact' },
  messages: { path: '/api/messages', idKey: 'id' },
}

const saveAdminSession = (password) => {
  try {
    const expiresAt = Date.now() + ADMIN_SESSION_DURATION_MS
    sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify({ password, expiresAt }))
    return expiresAt
  } catch {
    return null
  }
}

const readAdminSession = () => {
  try {
    const raw = sessionStorage.getItem(ADMIN_SESSION_KEY)
    if (!raw) return null

    const parsed = JSON.parse(raw)
    if (!parsed?.password || !parsed?.expiresAt || Date.now() >= parsed.expiresAt) {
      sessionStorage.removeItem(ADMIN_SESSION_KEY)
      return null
    }

    return parsed
  } catch {
    sessionStorage.removeItem(ADMIN_SESSION_KEY)
    return null
  }
}

const clearAdminSession = () => {
  try {
    sessionStorage.removeItem(ADMIN_SESSION_KEY)
  } catch {
    // No-op if storage is unavailable.
  }
}

export default function AdminPanel() {
  const navigate = useNavigate()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [activeTab, setActiveTab] = useState('projects')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [notification, setNotification] = useState(null)
  const [captchaToken, setCaptchaToken] = useState(null)
  const recaptchaRef = useRef(null)
  const sessionTimeoutRef = useRef(null)
  const notificationTimeoutRef = useRef(null)

  // Data states
  const [projects, setProjects] = useState([])
  const [slides, setSlides] = useState([])
  const [skills, setSkills] = useState([])
  const [experiences, setExperiences] = useState([])
  const [socialLinks, setSocialLinks] = useState([])
  const [contact, setContact] = useState({})
  const [messages, setMessages] = useState([])

  // Form states
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState({})
  const [isEditorOpen, setIsEditorOpen] = useState(false)

  const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'
  const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY
  const captchaConfigured = !!RECAPTCHA_SITE_KEY && RECAPTCHA_SITE_KEY !== 'your_recaptcha_site_key_here'

  const activeTabConfig = TAB_CONFIG[activeTab]

  const getItemIdentifier = (tab, item) => {
    const idKey = TAB_CRUD_CONFIG[tab]?.idKey
    return idKey ? item?.[idKey] : undefined
  }

  const clearNotificationTimeout = () => {
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current)
      notificationTimeoutRef.current = null
    }
  }

  const showNotification = (text, tone = 'info') => {
    clearNotificationTimeout()
    setNotification({ text, tone })
    notificationTimeoutRef.current = setTimeout(() => {
      setNotification(null)
    }, NOTIFICATION_DURATION_MS)
  }

  const getActiveItems = () => {
    if (activeTab === 'projects') return projects
    if (activeTab === 'slides') return slides
    if (activeTab === 'skills') return skills
    if (activeTab === 'experiences') return experiences
    if (activeTab === 'social') return socialLinks
    if (activeTab === 'contact') return [contact]
    if (activeTab === 'messages') return messages
    return []
  }

  const getEditItemName = () => {
    if (!editingItem) return ''
    return (
      editingItem.name
      || editingItem.title
      || editingItem.skillName
      || editingItem.label
      || editingItem.role
      || editingItem.slideId
      || 'Selected item'
    )
  }

  const openCreateEditor = () => {
    setEditingItem(null)
    setFormData(activeTab === 'contact' ? contact : {})
    setIsEditorOpen(true)
  }

  const openEditEditor = (item) => {
    setEditingItem(item)
    setFormData(item)
    setIsEditorOpen(true)
  }

  const closeEditor = () => {
    setEditingItem(null)
    setFormData(activeTab === 'contact' ? contact : {})
    setIsEditorOpen(false)
  }

  // Check database connectivity
  const checkDatabaseConnection = async () => {
    try {
      const response = await fetch(`${API_URL}/health`)
      const data = await response.json()

      if (!response.ok || data.database !== 'connected') {
        setMessage(`❌ Database Error: ${data.message || 'Database is not connected'}\n\n${data.hint || 'Please ensure the database is running and properly configured.'}`)
        return false
      }
      return true
    } catch (error) {
      setMessage(`❌ Connection Error: Cannot reach backend server.\n\nMake sure the backend is running at ${API_URL}`)
      return false
    }
  }

  // Verify reCAPTCHA token server-side
  const verifyCaptcha = async (token) => {
    const response = await fetch(`${API_URL}/api/verify-captcha`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })

    if (response.ok) {
      return { ok: true }
    }

    let payload = {}
    try {
      payload = await response.json()
    } catch {
      payload = {}
    }

    return {
      ok: false,
      message: payload.message || 'Captcha verification failed. Please try again.',
      hint: payload.hint,
      errorCodes: payload.errorCodes,
    }
  }

  const clearSessionTimeout = () => {
    if (sessionTimeoutRef.current) {
      clearTimeout(sessionTimeoutRef.current)
      sessionTimeoutRef.current = null
    }
  }

  const scheduleSessionExpiry = (expiresAt) => {
    clearSessionTimeout()
    const remainingMs = expiresAt - Date.now()

    if (remainingMs <= 0) {
      clearAdminSession()
      setIsAuthenticated(false)
      setPassword('')
      setMessage('Session expired. Please login again.')
      return
    }

    sessionTimeoutRef.current = setTimeout(() => {
      clearAdminSession()
      setIsAuthenticated(false)
      setPassword('')
      setMessage('Session expired. Please login again.')
    }, remainingMs)
  }

  // Login handler
  const handleLogin = async (e) => {
    e.preventDefault()
    const normalizedPassword = password.trim()
    if (!normalizedPassword) return

    if (captchaConfigured && !captchaToken) {
      setMessage('Please complete the reCAPTCHA challenge.')
      return
    }

    setLoading(true)
    setMessage('')

    try {
      // Verify captcha server-side first (only if configured)
      if (captchaConfigured) {
        const captchaResult = await verifyCaptcha(captchaToken)
        if (!captchaResult.ok) {
          const errorCodesText = Array.isArray(captchaResult.errorCodes) && captchaResult.errorCodes.length
            ? `\n\nError codes: ${captchaResult.errorCodes.join(', ')}`
            : ''
          const hintText = captchaResult.hint ? `\n\nHint: ${captchaResult.hint}` : ''

          setMessage(`❌ ${captchaResult.message}${hintText}${errorCodesText}`)
          recaptchaRef.current?.reset()
          setCaptchaToken(null)
          setLoading(false)
          return
        }
      }

      // Check database connection
      const dbConnected = await checkDatabaseConnection()
      if (!dbConnected) {
        recaptchaRef.current?.reset()
        setCaptchaToken(null)
        setLoading(false)
        return
      }

      // Validate credentials against a protected endpoint before opening the admin UI.
      const authCheck = await fetch(`${API_URL}/api/projects/admin/all`, {
        headers: getAuthHeaders(normalizedPassword),
      })

      if (!authCheck.ok) {
        setMessage('Invalid admin password.')
        recaptchaRef.current?.reset()
        setCaptchaToken(null)
        setLoading(false)
        return
      }

      // Authenticate
      setIsAuthenticated(true)
      setPassword(normalizedPassword)
      const expiresAt = saveAdminSession(normalizedPassword)
      if (expiresAt) {
        scheduleSessionExpiry(expiresAt)
      }
      await loadAllData(normalizedPassword)
    } catch (error) {
      console.error('Login error:', error)
      setMessage('Login failed. Please try again.')
      recaptchaRef.current?.reset()
      setCaptchaToken(null)
    } finally {
      setLoading(false)
    }
  }

  // Get auth headers
  const getAuthHeaders = (authPassword = password) => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${String(authPassword || '').trim()}`,
  })

  useEffect(() => {
    const existingSession = readAdminSession()
    if (!existingSession) return

    const restoredPassword = String(existingSession.password || '').trim()
    if (!restoredPassword) {
      clearAdminSession()
      return
    }

    setPassword(restoredPassword)
    setIsAuthenticated(true)
    scheduleSessionExpiry(existingSession.expiresAt)
    loadAllData(restoredPassword)
  }, [])

  // Set page title based on authentication state
  useEffect(() => {
    document.title = isAuthenticated ? 'Portfolio Admin Panel' : 'Portfolio Admin Login'
  }, [isAuthenticated])

  useEffect(() => () => clearSessionTimeout(), [])
  useEffect(() => () => clearNotificationTimeout(), [])

  // Load all data
  const loadAllData = async (authPassword = password) => {
    setLoading(true)
    try {
      const [projRes, slidesRes, skillsRes, expRes, socialRes, contactRes, messagesRes] = await Promise.all([
        fetch(`${API_URL}/api/projects/admin/all`, { headers: getAuthHeaders(authPassword) }),
        fetch(`${API_URL}/api/slides`, { headers: getAuthHeaders(authPassword) }),
        fetch(`${API_URL}/api/skills/admin/all`, { headers: getAuthHeaders(authPassword) }),
        fetch(`${API_URL}/api/experiences/admin/all`, { headers: getAuthHeaders(authPassword) }),
        fetch(`${API_URL}/api/social-links`, { headers: getAuthHeaders(authPassword) }),
        fetch(`${API_URL}/api/contact`, { headers: getAuthHeaders(authPassword) }),
        fetch(`${API_URL}/api/messages/admin/all`, { headers: getAuthHeaders(authPassword) }),
      ])

      if (projRes.ok) setProjects(await projRes.json())
      if (slidesRes.ok) setSlides(await slidesRes.json())
      if (skillsRes.ok) setSkills(await skillsRes.json())
      if (expRes.ok) setExperiences(await expRes.json())
      if (socialRes.ok) setSocialLinks(await socialRes.json())
      if (contactRes.ok) setContact(await contactRes.json())
      if (messagesRes.ok) setMessages(await messagesRes.json())
    } catch (error) {
      console.error('Error loading data:', error)
      showNotification('Error loading data', 'error')
    } finally {
      setLoading(false)
    }
  }

  // Generic save handler
  const handleSave = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      let url, method
      let payload = { ...formData }

      if (activeTab === 'projects') {
        const normalizeStringList = (value, key) => {
          if (!Array.isArray(value)) return []
          return value
            .map((entry) => {
              if (typeof entry === 'string') return entry
              if (entry && typeof entry === 'object') return entry[key] || ''
              return ''
            })
            .map((entry) => String(entry).trim())
            .filter(Boolean)
        }

        payload = {
          ...payload,
          responsibilities: normalizeStringList(formData.responsibilities, 'item'),
          impacts: normalizeStringList(formData.impacts, 'item'),
          technologies: normalizeStringList(formData.technologies, 'techName'),
          images: normalizeStringList(formData.images, 'imageUrl'),
        }
      }

      if (activeTab === 'experiences') {
        const normalizeHighlights = (value) => {
          if (!Array.isArray(value)) return []
          return value
            .map((highlight) => {
              const title = typeof highlight === 'string'
                ? highlight
                : (highlight?.title || '').trim()

              const subHighlightsRaw = Array.isArray(highlight?.subHighlights)
                ? highlight.subHighlights
                : []

              const subHighlights = subHighlightsRaw
                .map((sub) => {
                  if (typeof sub === 'string') return sub
                  if (sub && typeof sub === 'object') return sub.item || ''
                  return ''
                })
                .map((sub) => String(sub).trim())
                .filter(Boolean)

              if (!title) return null
              return { title, subHighlights }
            })
            .filter(Boolean)
        }

        payload = {
          ...payload,
          highlights: normalizeHighlights(formData.highlights),
        }
      }

      if (activeTab === 'skills' || activeTab === 'slides' || activeTab === 'experiences') {
        if (payload.sortOrder !== undefined && payload.sortOrder !== null && payload.sortOrder !== '') {
          payload.sortOrder = Number(payload.sortOrder)
        }
      }

      if (activeTab === 'skills') {
        if (payload.groupId !== undefined && payload.groupId !== null && payload.groupId !== '') {
          payload.groupId = Number(payload.groupId)
        }
      }

      if (activeTab === 'contact') {
        const parseOptionalNumber = (value) => {
          if (value === '' || value === null || value === undefined) return null
          const parsed = Number(value)
          return Number.isNaN(parsed) ? null : parsed
        }

        payload = {
          ...payload,
          latitude: parseOptionalNumber(payload.latitude),
          longitude: parseOptionalNumber(payload.longitude),
        }
      }

      if (activeTab === 'social') {
        payload = {
          ...payload,
          label: String(payload.label || '').trim(),
        }

        const isLinkedInEdit = String(editingItem?.label || '').trim().toLowerCase() === 'linkedin'
        if (isLinkedInEdit) {
          if (payload.label.toLowerCase() !== 'linkedin') {
            showNotification('LinkedIn label cannot be edited.', 'error')
            setLoading(false)
            return
          }
          if (String(payload.icon || '').trim() !== String(editingItem?.icon || '').trim()) {
            showNotification('LinkedIn icon cannot be edited.', 'error')
            setLoading(false)
            return
          }
        }

        if (!payload.label) {
          showNotification('Label is required.', 'error')
          setLoading(false)
          return
        }

        const normalizedLabel = payload.label.toLowerCase()
        const duplicate = socialLinks.find(
          (link) => link.label?.trim().toLowerCase() === normalizedLabel && link.id !== editingItem?.id,
        )

        if (duplicate) {
          showNotification('Label must be unique. This label already exists.', 'error')
          setLoading(false)
          return
        }
      }

      if (activeTab === 'slides' && !editingItem) {
        showNotification('Slides cannot be added. You can only edit existing slides.', 'error')
        setLoading(false)
        return
      }

      const tabCrudConfig = TAB_CRUD_CONFIG[activeTab]
      if (!tabCrudConfig) {
        showNotification('Unsupported admin section.', 'error')
        setLoading(false)
        return
      }

      const editIdentifier = editingItem ? getItemIdentifier(activeTab, editingItem) : undefined
      if (editingItem && (editIdentifier === undefined || editIdentifier === null || editIdentifier === '')) {
        showNotification('Unable to save: invalid item identifier.', 'error')
        setLoading(false)
        return
      }

      url = `${API_URL}${tabCrudConfig.path}${editingItem ? `/${editIdentifier}` : ''}`
      method = activeTab === 'contact' ? 'PUT' : editingItem ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        showNotification(`${activeTabConfig.label} ${editingItem ? 'updated' : 'created'} successfully`, 'success')
        setEditingItem(null)
        setFormData(activeTab === 'contact' ? contact : {})
        setIsEditorOpen(false)
        await loadAllData()
      } else {
        const error = await response.json()
        showNotification(`Error: ${error.message}`, 'error')
      }
    } catch (error) {
      console.error('Error saving:', error)
      showNotification('Error saving data', 'error')
    } finally {
      setLoading(false)
    }
  }

  // Delete handler
  const handleDelete = async (item) => {
    if (activeTab === 'slides') {
      showNotification('Slides cannot be deleted.', 'error')
      return
    }

    if (activeTab === 'social' && PROTECTED_SOCIAL_LABELS.has(String(item.label || '').trim().toLowerCase())) {
      showNotification(`${item.label} cannot be deleted.`, 'error')
      return
    }

    if (!confirm('Are you sure you want to delete this item?')) return

    setLoading(true)
    try {
      const tabCrudConfig = TAB_CRUD_CONFIG[activeTab]
      const identifier = getItemIdentifier(activeTab, item)

      if (!tabCrudConfig?.idKey || identifier === undefined || identifier === null || identifier === '') {
        showNotification('Unable to delete: invalid item identifier.', 'error')
        setLoading(false)
        return
      }

      const url = `${API_URL}${tabCrudConfig.path}/${identifier}`

      const response = await fetch(url, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      })

      if (response.ok) {
        showNotification('Item deleted successfully', 'success')
        await loadAllData()
      } else {
        showNotification('Error deleting item', 'error')
      }
    } catch (error) {
      console.error('Error deleting:', error)
      showNotification('Error deleting item', 'error')
    } finally {
      setLoading(false)
    }
  }

  // Mark message as read
  const handleMarkRead = async (item) => {
    try {
      const response = await fetch(`${API_URL}/api/messages/${item.id}/read`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
      })
      if (response.ok) {
        setMessages((prev) => prev.map((m) => (m.id === item.id ? { ...m, isRead: true } : m)))
      }
    } catch (error) {
      console.error('Error marking message as read:', error)
    }
  }

  const handleReload = async () => {
    const activePassword = String(password || readAdminSession()?.password || '').trim()
    if (!activePassword) {
      showNotification('Cannot reload: missing admin session.', 'error')
      return
    }

    await loadAllData(activePassword)
    showNotification('Data reloaded.', 'success')
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full">
          <h1 className="text-3xl font-bold text-white mb-8 text-center">Admin Login</h1>

          {message && (
            <div className="bg-red-600 text-white p-4 rounded mb-6 text-sm whitespace-pre-wrap">
              {message}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded focus:outline-none focus:border-blue-500 disabled:opacity-50"
            />
            {captchaConfigured ? (
              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={RECAPTCHA_SITE_KEY}
                theme="dark"
                onChange={(token) => setCaptchaToken(token)}
                onExpired={() => setCaptchaToken(null)}
                className="flex justify-center"
              />
            ) : (
              <div className="flex items-start gap-3 rounded border border-yellow-500/40 bg-yellow-500/10 p-3 text-sm text-yellow-300">
                <span className="mt-0.5 shrink-0">⚠️</span>
                <span>
                  reCAPTCHA is not configured. Set{' '}
                  <code className="rounded bg-yellow-500/20 px-1 font-mono text-xs">VITE_RECAPTCHA_SITE_KEY</code>{' '}
                  and{' '}
                  <code className="rounded bg-yellow-500/20 px-1 font-mono text-xs">RECAPTCHA_SECRET_KEY</code>{' '}
                  to enable brute-force protection.
                </span>
              </div>
            )}
            <button
              type="submit"
              disabled={loading || (captchaConfigured && !captchaToken)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Checking...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex flex-col items-center gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-center text-2xl font-bold leading-tight sm:text-left sm:text-4xl">Portfolio Admin Panel</h1>
          <div className="flex w-full justify-center gap-2 sm:w-auto sm:justify-start sm:items-center">
            <button
              onClick={handleReload}
              disabled={loading}
              className="flex-1 rounded bg-slate-600 px-4 py-2 text-sm font-semibold hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none"
            >
              {loading ? 'Reloading...' : 'Reload'}
            </button>
            <button
              onClick={() => {
                clearSessionTimeout()
                clearAdminSession()
                setIsAuthenticated(false)
                setPassword('')
                navigate('/')
              }}
              className="flex-1 rounded bg-red-600 px-4 py-2 text-sm font-semibold hover:bg-red-700 sm:flex-none"
            >
              Logout
            </button>
          </div>
        </div>

        {notification && (
          <div
            className={`mb-4 flex items-center justify-between gap-3 rounded p-3 text-sm ${
              notification.tone === 'success'
                ? 'bg-emerald-600 text-white'
                : notification.tone === 'error'
                  ? 'bg-red-600 text-white'
                  : 'bg-blue-600 text-white'
            }`}
          >
            <span>{notification.text}</span>
            <button onClick={() => setNotification(null)}>×</button>
          </div>
        )}

        <div className="mb-4 rounded-lg border border-blue-500/30 bg-blue-500/10 p-4">
          <p className="text-sm text-blue-100">
            Tip: Choose a section, click an item to edit, then click <span className="font-semibold">Update</span>. For new entries, leave edit mode and use <span className="font-semibold">Create</span>.
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6 grid grid-cols-2 gap-2 md:grid-cols-4 xl:grid-cols-7">
          {Object.keys(TAB_CONFIG).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab)
                setIsEditorOpen(false)
                setEditingItem(null)
                setFormData(tab === 'contact' ? contact : {})
              }}
              className={`rounded-lg border px-3 py-3 text-left transition ${
                activeTab === tab
                  ? 'border-blue-400 bg-blue-500/15 text-blue-200'
                  : 'border-gray-700 bg-gray-800/80 text-gray-300 hover:border-gray-500 hover:text-white'
              }`}
            >
              <p className="font-semibold">{TAB_CONFIG[tab].label}</p>
              <p className="mt-1 text-xs opacity-80">{TAB_CONFIG[tab].description}</p>
            </button>
          ))}
        </div>

        <div className="mb-6 rounded-lg border border-gray-700 bg-gray-800/80 p-4">
          <p className="text-sm uppercase tracking-wide text-gray-400">Current section</p>
          <h2 className="mt-1 text-2xl font-bold text-white">{activeTabConfig.label}</h2>
          <p className="mt-1 text-sm text-gray-300">{activeTabConfig.description}</p>
        </div>

        <div className="rounded-lg border border-gray-700 bg-gray-800 p-6">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-xl font-bold">{activeTabConfig.label} Table</h3>
              <p className="text-sm text-gray-400">All records are shown in table format. Use actions to edit or delete.</p>
            </div>
            {activeTab !== 'messages' && activeTab !== 'contact' && activeTab !== 'slides' && (
              <button
                onClick={openCreateEditor}
                aria-label={`Add ${activeTabConfig.label}`}
                title={`Add ${activeTabConfig.label}`}
                className="flex h-10 w-10 items-center justify-center rounded bg-blue-600 text-lg font-semibold hover:bg-blue-700"
              >
                <FontAwesomeIcon icon={faPlus} />
              </button>
            )}
          </div>

          <AdminList
            activeTab={activeTab}
            items={getActiveItems()}
            onEdit={(item) => openEditEditor(activeTab === 'contact' ? contact : item)}
            onDelete={handleDelete}
            onMarkRead={handleMarkRead}
            loading={loading}
          />
        </div>

        <AdminEditorModal
          isOpen={isEditorOpen && activeTab !== 'messages'}
          title={activeTab === 'contact' ? 'Edit Contact' : editingItem ? `Edit ${activeTabConfig.label}` : `Create ${activeTabConfig.label}`}
          subtitle={
            activeTab === 'contact'
              ? 'Only one contact record is supported. Update it here.'
              : editingItem
                ? `Updating ${getEditItemName()}`
                : `Add a new ${activeTabConfig.label.toLowerCase()} entry.`
          }
          onClose={closeEditor}
        >
          <AdminForm
            activeTab={activeTab}
            formData={formData}
            setFormData={setFormData}
            editingItem={editingItem}
            onSave={handleSave}
            onCancel={closeEditor}
            loading={loading}
          />
        </AdminEditorModal>
      </div>
    </div>
  )
}

// Form Component
function AdminForm({ activeTab, formData, setFormData, editingItem, onSave, onCancel, loading }) {
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const formatExperienceHighlights = (highlights) => {
    if (!Array.isArray(highlights) || !highlights.length) return ''

    return highlights
      .map((highlight) => {
        const title = typeof highlight === 'string' ? highlight : highlight?.title || ''
        const subHighlightsRaw = Array.isArray(highlight?.subHighlights) ? highlight.subHighlights : []

        const subLines = subHighlightsRaw
          .map((sub) => {
            if (typeof sub === 'string') return sub
            if (sub && typeof sub === 'object') return sub.item || ''
            return ''
          })
          .map((sub) => String(sub).trim())
          .filter(Boolean)
          .map((sub) => `  - ${sub}`)

        return [String(title).trim(), ...subLines].filter(Boolean).join('\n')
      })
      .filter(Boolean)
      .join('\n\n')
  }

  const parseExperienceHighlights = (value) => {
    if (!value || typeof value !== 'string') return []

    const blocks = value
      .split(/\n\s*\n/)
      .map((block) => block.trim())
      .filter(Boolean)

    return blocks
      .map((block) => {
        const lines = block
          .split('\n')
          .map((line) => line.trim())
          .filter(Boolean)

        if (!lines.length) return null

        const title = lines[0]
        const subHighlights = lines
          .slice(1)
          .map((line) => line.replace(/^[-*]\s+/, '').replace(/^\d+[.)]\s+/, '').trim())
          .filter(Boolean)

        if (!title) return null
        return { title, subHighlights }
      })
      .filter(Boolean)
  }

  const handleArrayChange = (field, index, value) => {
    const arr = formData[field] || []
    arr[index] = value
    setFormData((prev) => ({ ...prev, [field]: [...arr] }))
  }

  const requiredHint = (
    <p className="text-xs text-amber-300">Fields marked with * are required.</p>
  )

  if (activeTab === 'projects') {
    return (
      <form onSubmit={onSave} className="space-y-4 text-sm">
        {requiredHint}
        <input
          type="text"
          name="slug"
          placeholder="Slug *"
          value={formData.slug || ''}
          onChange={handleChange}
          disabled={!!editingItem}
          required={!editingItem}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded disabled:opacity-50"
        />
        <input
          type="text"
          name="name"
          placeholder="Project Name *"
          value={formData.name || ''}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded"
        />
        <input
          type="text"
          name="summary"
          placeholder="Summary *"
          value={formData.summary || ''}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded"
        />
        <input
          type="text"
          name="coverImage"
          placeholder="Cover Image URL"
          value={formData.coverImage || ''}
          onChange={handleChange}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded"
        />
        <input
          type="text"
          name="liveUrl"
          placeholder="Live URL"
          value={formData.liveUrl || ''}
          onChange={handleChange}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded"
        />
        <input
          type="text"
          name="repoUrl"
          placeholder="Repo URL"
          value={formData.repoUrl || ''}
          onChange={handleChange}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded"
        />

        <div>
          <label className="block text-gray-300 mb-2">Responsibilities (one per line)</label>
          <textarea
            value={(formData.responsibilities || [])
              .map((entry) => (typeof entry === 'string' ? entry : entry?.item || ''))
              .filter(Boolean)
              .join('\n')}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                responsibilities: e.target.value.split('\n').filter(Boolean),
              }))
            }
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded h-20"
            placeholder="One per line"
          />
        </div>

        <div>
          <label className="block text-gray-300 mb-2">Impacts (one per line)</label>
          <textarea
            value={(formData.impacts || [])
              .map((entry) => (typeof entry === 'string' ? entry : entry?.item || ''))
              .filter(Boolean)
              .join('\n')}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                impacts: e.target.value.split('\n').filter(Boolean),
              }))
            }
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded h-20"
            placeholder="One per line"
          />
        </div>

        <div>
          <label className="block text-gray-300 mb-2">Technologies (one per line)</label>
          <textarea
            value={(formData.technologies || [])
              .map((entry) => (typeof entry === 'string' ? entry : entry?.techName || ''))
              .filter(Boolean)
              .join('\n')}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                technologies: e.target.value.split('\n').filter(Boolean),
              }))
            }
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded h-20"
            placeholder="One per line"
          />
        </div>

        <div>
          <label className="block text-gray-300 mb-2">Images (one per line)</label>
          <textarea
            value={(formData.images || [])
              .map((entry) => (typeof entry === 'string' ? entry : entry?.imageUrl || ''))
              .filter(Boolean)
              .join('\n')}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                images: e.target.value.split('\n').filter(Boolean),
              }))
            }
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded h-20"
            placeholder="One per line"
          />
          <div className="mt-2 rounded border border-gray-600 bg-gray-800/70 p-3 text-xs text-gray-300">
            <p className="font-semibold text-gray-200">Image URL reference</p>
            <p className="mt-1">Use direct public image URLs (preferably ending with .jpg, .jpeg, .png, or .webp), one URL per line.</p>
            <p className="mt-2 break-words text-gray-400">Example: https://placehold.co/1200x720/png?text=Project+Preview+01</p>
            <p className="mt-1 break-words text-gray-400">Example: https://placehold.co/1200x720/webp?text=Project+Preview+02</p>
            <a
              href="https://placehold.co"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block text-blue-300 underline hover:text-blue-200"
            >
              Generate placeholder images (Placehold)
            </a>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            aria-label={editingItem ? 'Update' : 'Create'}
            title={editingItem ? 'Update' : 'Create'}
            className="flex h-10 w-10 items-center justify-center rounded bg-blue-600 text-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <FontAwesomeIcon icon={faFloppyDisk} />
          </button>
          {editingItem && (
            <button
              type="button"
              onClick={onCancel}
              aria-label="Cancel"
              title="Cancel"
              className="flex h-10 w-10 items-center justify-center rounded bg-gray-600 text-lg hover:bg-gray-700"
            >
              <FontAwesomeIcon icon={faXmark} />
            </button>
          )}
        </div>
      </form>
    )
  }

  if (activeTab === 'slides') {
    return (
      <form onSubmit={onSave} className="space-y-4 text-sm">
        {requiredHint}
        <input
          type="text"
          name="slideId"
          placeholder="Slide ID *"
          value={formData.slideId || ''}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded"
        />
        <input
          type="text"
          name="eyebrow"
          placeholder="Eyebrow *"
          value={formData.eyebrow || ''}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded"
        />
        <input
          type="text"
          name="title"
          placeholder="Title *"
          value={formData.title || ''}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded"
        />
        <textarea
          name="description"
          placeholder="Description *"
          value={formData.description || ''}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded h-20"
        />
        <input
          type="text"
          name="accent"
          placeholder="Accent Color"
          value={formData.accent || ''}
          onChange={handleChange}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded"
        />
        <input
          type="text"
          name="sectionClassDark"
          placeholder="Dark Class"
          value={formData.sectionClassDark || ''}
          onChange={handleChange}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded"
        />
        <input
          type="text"
          name="sectionClassLight"
          placeholder="Light Class"
          value={formData.sectionClassLight || ''}
          onChange={handleChange}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded"
        />
        <input
          type="number"
          name="sortOrder"
          placeholder="Sort Order"
          value={formData.sortOrder || 0}
          onChange={handleChange}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded"
        />
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            aria-label={editingItem ? 'Update' : 'Create'}
            title={editingItem ? 'Update' : 'Create'}
            className="flex h-10 w-10 items-center justify-center rounded bg-blue-600 text-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <FontAwesomeIcon icon={faFloppyDisk} />
          </button>
          {editingItem && (
            <button
              type="button"
              onClick={onCancel}
              aria-label="Cancel"
              title="Cancel"
              className="flex h-10 w-10 items-center justify-center rounded bg-gray-600 text-lg hover:bg-gray-700"
            >
              <FontAwesomeIcon icon={faXmark} />
            </button>
          )}
        </div>
      </form>
    )
  }

  if (activeTab === 'skills') {
    return (
      <form onSubmit={onSave} className="space-y-4 text-sm">
        {requiredHint}
        <input
          type="text"
          name="skillName"
          placeholder="Skill Name *"
          value={formData.skillName || ''}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded"
        />
        <select
          name="groupId"
          value={formData.groupId !== undefined ? String(formData.groupId) : ''}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded"
        >
          <option value="" disabled>Select Skill Group</option>
          <option value="0">Group 0</option>
          <option value="1">Group 1</option>
          <option value="2">Group 2</option>
        </select>
        <input
          type="number"
          name="sortOrder"
          placeholder="Sort Order"
          value={formData.sortOrder || 0}
          onChange={handleChange}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded"
        />
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            aria-label={editingItem ? 'Update' : 'Create'}
            title={editingItem ? 'Update' : 'Create'}
            className="flex h-10 w-10 items-center justify-center rounded bg-blue-600 text-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <FontAwesomeIcon icon={faFloppyDisk} />
          </button>
          {editingItem && (
            <button
              type="button"
              onClick={onCancel}
              aria-label="Cancel"
              title="Cancel"
              className="flex h-10 w-10 items-center justify-center rounded bg-gray-600 text-lg hover:bg-gray-700"
            >
              <FontAwesomeIcon icon={faXmark} />
            </button>
          )}
        </div>
      </form>
    )
  }

  if (activeTab === 'experiences') {
    return (
      <form onSubmit={onSave} className="space-y-4 text-sm">
        {requiredHint}
        <input
          type="text"
          name="role"
          placeholder="Role *"
          value={formData.role || ''}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded"
        />
        <input
          type="text"
          name="company"
          placeholder="Company *"
          value={formData.company || ''}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded"
        />
        <input
          type="text"
          name="period"
          placeholder="Period (e.g., Jan 2020 - Dec 2021) *"
          value={formData.period || ''}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded"
        />
        <input
          type="number"
          name="sortOrder"
          placeholder="Sort Order"
          value={formData.sortOrder || 0}
          onChange={handleChange}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded"
        />
        <div>
          <label className="mb-2 block text-gray-300">Details / Highlights</label>
          <textarea
            value={formatExperienceHighlights(formData.highlights)}
            onChange={(e) => {
              setFormData((prev) => ({
                ...prev,
                highlights: parseExperienceHighlights(e.target.value),
              }))
            }}
            className="h-44 w-full rounded border border-gray-600 bg-gray-700 px-3 py-2"
            placeholder={[
              'Lead frontend migration',
              '  - Built reusable components',
              '  - Improved performance by 30%',
              '',
              'Mentored junior developers',
              '  - Weekly code reviews',
            ].join('\n')}
          />
          <p className="mt-2 text-xs text-gray-400">
            Use one block per highlight. First line is the title, following lines are sub-points. Separate blocks with an empty line.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            aria-label={editingItem ? 'Update' : 'Create'}
            title={editingItem ? 'Update' : 'Create'}
            className="flex h-10 w-10 items-center justify-center rounded bg-blue-600 text-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <FontAwesomeIcon icon={faFloppyDisk} />
          </button>
          {editingItem && (
            <button
              type="button"
              onClick={onCancel}
              aria-label="Cancel"
              title="Cancel"
              className="flex h-10 w-10 items-center justify-center rounded bg-gray-600 text-lg hover:bg-gray-700"
            >
              <FontAwesomeIcon icon={faXmark} />
            </button>
          )}
        </div>
      </form>
    )
  }

  if (activeTab === 'social') {
    const isLinkedInEdit = String(editingItem?.label || '').trim().toLowerCase() === 'linkedin'

    return (
      <form onSubmit={onSave} className="space-y-4 text-sm">
        {requiredHint}
        <input
          type="text"
          name="label"
          placeholder="Label (e.g., Instagram) *"
          value={formData.label || ''}
          onChange={handleChange}
          disabled={isLinkedInEdit}
          required
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded disabled:cursor-not-allowed disabled:opacity-60"
        />
        <input
          type="text"
          name="href"
          placeholder="URL *"
          value={formData.href || ''}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded"
        />
        <input
          type="text"
          name="icon"
          placeholder="Icon (e.g., faInstagram) *"
          value={formData.icon || ''}
          onChange={handleChange}
          disabled={isLinkedInEdit}
          required
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded disabled:cursor-not-allowed disabled:opacity-60"
        />
        <div className="rounded border border-gray-600 bg-gray-800/70 p-3 text-xs text-gray-300">
          <p className="font-semibold text-gray-200">Supported icon values:</p>
          <p className="mt-1 break-words">{SUPPORTED_SOCIAL_ICONS.join(', ')}</p>
          <a
            href="https://fontawesome.com/search?s=brands%2Cregular&ic=free-collection"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block text-blue-300 underline hover:text-blue-200"
          >
            Browse Font Awesome brand icons
          </a>
        </div>
        {isLinkedInEdit && (
          <p className="text-xs text-amber-300">LinkedIn label and icon are protected and cannot be edited.</p>
        )}
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            aria-label={editingItem ? 'Update' : 'Create'}
            title={editingItem ? 'Update' : 'Create'}
            className="flex h-10 w-10 items-center justify-center rounded bg-blue-600 text-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <FontAwesomeIcon icon={faFloppyDisk} />
          </button>
          {editingItem && (
            <button
              type="button"
              onClick={onCancel}
              aria-label="Cancel"
              title="Cancel"
              className="flex h-10 w-10 items-center justify-center rounded bg-gray-600 text-lg hover:bg-gray-700"
            >
              <FontAwesomeIcon icon={faXmark} />
            </button>
          )}
        </div>
      </form>
    )
  }

  if (activeTab === 'contact') {
    return (
      <form onSubmit={onSave} className="space-y-4 text-sm">
        {requiredHint}
        <input
          type="email"
          name="email"
          placeholder="Email *"
          value={formData.email || ''}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded"
        />
        <input
          type="tel"
          name="phone"
          placeholder="Phone *"
          value={formData.phone || ''}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded"
        />
        <input
          type="text"
          name="address"
          placeholder="Address *"
          value={formData.address || ''}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded"
        />
        <input
          type="text"
          name="location"
          placeholder="Location *"
          value={formData.location || ''}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded"
        />
        <input
          type="number"
          name="latitude"
          placeholder="Latitude"
          step="0.0001"
          value={formData.latitude || ''}
          onChange={handleChange}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded"
        />
        <input
          type="number"
          name="longitude"
          placeholder="Longitude"
          step="0.0001"
          value={formData.longitude || ''}
          onChange={handleChange}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded"
        />
        <input
          type="text"
          name="message"
          placeholder="Message Label *"
          value={formData.message || ''}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded"
        />
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            aria-label="Update Contact"
            title="Update Contact"
            className="flex h-10 w-10 items-center justify-center rounded bg-blue-600 text-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <FontAwesomeIcon icon={faFloppyDisk} />
          </button>
        </div>
      </form>
    )
  }
}

function AdminEditorModal({ isOpen, title, subtitle, onClose, children }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl border border-gray-700 bg-gray-900 p-6 shadow-2xl">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-2xl font-bold text-white">{title}</h3>
            <p className="mt-1 text-sm text-gray-400">{subtitle}</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            title="Close"
            className="flex h-9 w-9 items-center justify-center rounded bg-gray-700 text-lg hover:bg-gray-600"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

function IconActionButton({
  onClick,
  type = 'button',
  disabled = false,
  ariaLabel,
  title,
  icon,
  tone = 'primary',
  size = 'sm',
}) {
  const toneClass = tone === 'danger'
    ? 'bg-red-600 hover:bg-red-700 disabled:opacity-40'
    : 'bg-blue-600 hover:bg-blue-700 disabled:opacity-50'
  const sizeClass = size === 'lg' ? 'h-10 w-10 text-lg' : 'h-7 w-7 text-xs'

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      title={title}
      className={`flex items-center justify-center rounded ${sizeClass} ${toneClass} disabled:cursor-not-allowed`}
    >
      <FontAwesomeIcon icon={icon} />
    </button>
  )
}

// List Component
function AdminList({ activeTab, items, onEdit, onDelete, onMarkRead, loading }) {
  if (loading) {
    return <AdminTableSkeleton />
  }

  if (items.length === 0) {
    return <p className="text-gray-400">No items found</p>
  }

  const headersByTab = {
    projects: ['Name', 'Slug', 'Summary', 'Actions'],
    slides: ['Slide', 'Eyebrow', 'Title', 'Description', 'Actions'],
    skills: ['Skill', 'Group', 'Sort', 'Actions'],
    experiences: ['Role', 'Company', 'Period', 'Actions'],
    social: ['Label', 'URL', 'Icon', 'Actions'],
    contact: ['Email', 'Phone', 'Location', 'Address', 'Actions'],
    messages: ['Name', 'Email', 'Message', 'Created', 'Status', 'Actions'],
  }

  const headers = headersByTab[activeTab] || []

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-700">
      <table className="min-w-full divide-y divide-gray-700 text-sm">
        <thead className="bg-gray-800/80">
          <tr>
            {headers.map((header) => (
              <th key={header} className="px-4 py-3 text-left font-semibold text-gray-200">{header}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700 bg-gray-900/50">
          {items.map((item) => (
            <tr key={item.id || item.slug || 'contact'} className="align-top">
              {activeTab === 'projects' && (
                <>
                  <td className="px-4 py-3 font-medium text-white">{item.name}</td>
                  <td className="px-4 py-3 text-gray-300">{item.slug}</td>
                  <td className="max-w-md truncate px-4 py-3 text-gray-300">{item.summary}</td>
                </>
              )}

              {activeTab === 'slides' && (
                <>
                  <td className="px-4 py-3 font-medium text-white">{item.slideId}</td>
                  <td className="px-4 py-3 text-gray-300">{item.eyebrow}</td>
                  <td className="px-4 py-3 text-gray-300">{item.title}</td>
                  <td className="max-w-md truncate px-4 py-3 text-gray-300">{item.description}</td>
                </>
              )}

              {activeTab === 'skills' && (
                <>
                  <td className="px-4 py-3 font-medium text-white">{item.skillName}</td>
                  <td className="px-4 py-3 text-gray-300">{item.groupId}</td>
                  <td className="px-4 py-3 text-gray-300">{item.sortOrder}</td>
                </>
              )}

              {activeTab === 'experiences' && (
                <>
                  <td className="px-4 py-3 font-medium text-white">{item.role}</td>
                  <td className="px-4 py-3 text-gray-300">{item.company}</td>
                  <td className="px-4 py-3 text-gray-300">{item.period}</td>
                </>
              )}

              {activeTab === 'social' && (
                <>
                  <td className="px-4 py-3 font-medium text-white">{item.label}</td>
                  <td className="max-w-xs truncate px-4 py-3 text-gray-300">{item.href}</td>
                  <td className="px-4 py-3 text-gray-300">{item.icon}</td>
                </>
              )}

              {activeTab === 'contact' && (
                <>
                  <td className="px-4 py-3 text-gray-300">{item.email}</td>
                  <td className="px-4 py-3 text-gray-300">{item.phone}</td>
                  <td className="px-4 py-3 text-gray-300">{item.location}</td>
                  <td className="px-4 py-3 text-gray-300">{item.address}</td>
                </>
              )}

              {activeTab === 'messages' && (
                <>
                  <td className="px-4 py-3 font-medium text-white">{item.name}</td>
                  <td className="px-4 py-3 text-gray-300">{item.email}</td>
                  <td className="max-w-md whitespace-pre-wrap break-words px-4 py-3 text-gray-300">{item.body}</td>
                  <td className="px-4 py-3 text-gray-400">{new Date(item.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-3 text-gray-300">{item.isRead ? 'Read' : 'Unread'}</td>
                </>
              )}

              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-2">
                  {activeTab !== 'messages' && (
                    <IconActionButton
                      onClick={() => onEdit(item)}
                      aria-label="Edit"
                      title="Edit"
                      icon={faPen}
                    />
                  )}
                  {activeTab === 'messages' && !item.isRead && (
                    <button onClick={() => onMarkRead(item)} className="rounded bg-blue-600 px-3 py-1 text-xs hover:bg-blue-700">Mark read</button>
                  )}
                  {activeTab !== 'contact' && activeTab !== 'slides' && (
                    <IconActionButton
                      onClick={() => onDelete(item)}
                      disabled={activeTab === 'social' && PROTECTED_SOCIAL_LABELS.has(String(item.label || '').trim().toLowerCase())}
                      aria-label="Delete"
                      title="Delete"
                      icon={faTrash}
                      tone="danger"
                    />
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function AdminTableSkeleton() {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-700">
      <table className="min-w-full divide-y divide-gray-700">
        <thead className="bg-gray-800/80">
          <tr>
            {Array.from({ length: 5 }).map((_, index) => (
              <th key={index} className="px-4 py-3">
                <div className="loading-shimmer h-4 w-24 rounded bg-gray-700" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700 bg-gray-900/50">
          {Array.from({ length: 6 }).map((_, rowIndex) => (
            <tr key={rowIndex}>
              {Array.from({ length: 5 }).map((_, cellIndex) => (
                <td key={cellIndex} className="px-4 py-3">
                  <div className="loading-shimmer h-3 w-full rounded bg-gray-700" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
