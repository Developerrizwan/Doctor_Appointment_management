import axios from 'axios'
import { isTokenUsable } from './axios'

// The platform-owner console is tenant-less. It uses its OWN token (separate
// storage key) so it never collides with a hospital user's session.
const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000'

export const PLATFORM_TOKEN_KEY = 'platform_token'
export const PLATFORM_USER_KEY = 'platform_user'

const platformApi = axios.create({
  baseURL: `${backendUrl}/api/platform`,
})

platformApi.interceptors.request.use((config) => {
  const token = localStorage.getItem(PLATFORM_TOKEN_KEY)
  if (isTokenUsable(token)) {
    config.headers.Authorization = `Bearer ${token.trim()}`
  } else if (config.headers && config.headers.Authorization) {
    delete config.headers.Authorization
  }
  return config
})

export const platformStore = {
  user: () => {
    try {
      return JSON.parse(localStorage.getItem(PLATFORM_USER_KEY)) || null
    } catch {
      return null
    }
  },
  set: (access, user) => {
    if (access) localStorage.setItem(PLATFORM_TOKEN_KEY, access)
    if (user) localStorage.setItem(PLATFORM_USER_KEY, JSON.stringify(user))
  },
  clear: () => {
    localStorage.removeItem(PLATFORM_TOKEN_KEY)
    localStorage.removeItem(PLATFORM_USER_KEY)
  },
}

export const isPlatformAuthed = () =>
  isTokenUsable(localStorage.getItem(PLATFORM_TOKEN_KEY))

export default platformApi
