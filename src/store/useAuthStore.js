import { create } from 'zustand'
import api from '../lib/api'
import { useCartStore } from './useCartStore'

const saveCartForUser = (userId) => {
  const items = useCartStore.getState().items
  if (userId && items.length > 0) {
    localStorage.setItem(`cart-user-${userId}`, JSON.stringify(items))
  }
}

const restoreCartForUser = (userId) => {
  if (!userId) return
  const saved = localStorage.getItem(`cart-user-${userId}`)
  if (saved) {
    try {
      useCartStore.setState({ items: JSON.parse(saved) })
    } catch {}
  }
}

export const useAuthStore = create((set, get) => {
  if (typeof window !== 'undefined') {
    window.addEventListener('auth-logout', () => {
      saveCartForUser(get().user?.id)
      useCartStore.getState().clearCart()
      set({ user: null, token: null })
    })
  }

  return {
    user: null,
    token: localStorage.getItem('token') || null,
    loading: false,

    login: (userData, token) => {
      localStorage.setItem('token', token)
      set({ user: userData, token })
      restoreCartForUser(userData.id)
    },

    logout: async () => {
      try {
        await api.post('/auth/logout')
      } catch (err) {
        console.error('Error logging out:', err)
      } finally {
        saveCartForUser(get().user?.id)
        localStorage.removeItem('token')
        useCartStore.getState().clearCart()
        set({ user: null, token: null })
      }
    },

    emailLogin: async (email, password) => {
      set({ loading: true })
      try {
        const response = await api.post('/auth/login', { email, password })
        const { user: userData, token: userToken } = response.data
        localStorage.setItem('token', userToken)
        set({ user: userData, token: userToken, loading: false })
        restoreCartForUser(userData.id)
        return { success: true }
      } catch (err) {
        set({ loading: false })
        const message = err.response?.data?.message || 'Đăng nhập thất bại'
        return { success: false, message }
      }
    },

    updateProfile: async (data) => {
      const response = await api.put('/auth/profile', data)
      set({ user: response.data })
      return response.data
    },

    fetchUser: async () => {
      const token = localStorage.getItem('token')
      if (!token) return null

      set({ loading: true })
      try {
        const response = await api.get('/auth/me')
        set({ user: response.data, loading: false })
        return response.data
      } catch (err) {
        localStorage.removeItem('token')
        set({ user: null, token: null, loading: false })
        return null
      }
    }
  }
})
