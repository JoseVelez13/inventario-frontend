import api from './api'

const TOKEN_KEY = 'auth_token'

async function login(credentials) {
  // Expecting backend at POST /auth/login/ returning { token } or { access }
  const res = await api.post('auth/login/', credentials)
  const token = res?.data?.token || res?.data?.access || res?.data?.key
  if (token) {
    try {
      localStorage.setItem(TOKEN_KEY, token)
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } catch (e) {
      // ignore storage errors
    }
  }
  return res
}

function logout() {
  try {
    localStorage.removeItem(TOKEN_KEY)
  } catch (e) {}
  delete api.defaults.headers.common['Authorization']
}

function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch (e) {
    return null
  }
}

function isAuthenticated() {
  return !!getToken()
}

export default {
  login,
  logout,
  getToken,
  isAuthenticated,
}
