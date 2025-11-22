import { User } from '@/types'

export const getStoredUser = (): User | null => {
  const userStr = localStorage.getItem('user')
  if (!userStr) return null
  try {
    return JSON.parse(userStr)
  } catch {
    return null
  }
}

export const setStoredUser = (user: User): void => {
  localStorage.setItem('user', JSON.stringify(user))
}

export const clearStoredAuth = (): void => {
  localStorage.removeItem('user')
  localStorage.removeItem('auth_token')
  localStorage.removeItem('refresh_token')
}

export const getAuthToken = (): string | null => {
  return localStorage.getItem('auth_token')
}

export const setAuthToken = (token: string): void => {
  localStorage.setItem('auth_token', token)
}

export const getRefreshToken = (): string | null => {
  return localStorage.getItem('refresh_token')
}

export const setRefreshToken = (token: string): void => {
  localStorage.setItem('refresh_token', token)
}

