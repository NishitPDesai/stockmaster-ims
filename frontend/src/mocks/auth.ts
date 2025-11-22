import { User, LoginCredentials, AuthResponse } from '@/types'

const mockUser: User = {
  id: '1',
  email: 'admin@stockmaster.com',
  name: 'Admin User',
  role: 'admin',
}

export const mockAuth = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    if (credentials.email === 'admin@stockmaster.com' && credentials.password === 'password') {
      return {
        user: mockUser,
        token: 'mock-jwt-token',
        refreshToken: 'mock-refresh-token',
      }
    }

    throw new Error('Invalid credentials')
  },

  refresh: async (): Promise<AuthResponse> => {
    await new Promise((resolve) => setTimeout(resolve, 500))
    return {
      user: mockUser,
      token: 'mock-jwt-token-refreshed',
      refreshToken: 'mock-refresh-token-refreshed',
    }
  },
}

