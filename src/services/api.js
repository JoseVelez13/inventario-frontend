import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8000/api/', // URL de Django
})

// If a token exists in localStorage, attach it to default headers
try {
  const token = localStorage.getItem('auth_token')
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
  }
} catch (e) {
  // In some environments (SSR/tests) localStorage may be unavailable — ignore
}

export default api
