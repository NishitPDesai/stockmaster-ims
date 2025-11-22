import { User, LoginCredentials, AuthResponse } from '@/types'

// Multiple managers and staff users
const mockUsers: Record<string, User> = {
  manager1: {
    id: '1',
    email: 'manager@stockmaster.com',
    name: 'Manager User',
    role: 'manager',
  },
  manager2: {
    id: '2',
    email: 'manager2@stockmaster.com',
    name: 'Senior Manager',
    role: 'manager',
  },
  manager3: {
    id: '3',
    email: 'manager3@stockmaster.com',
    name: 'Operations Manager',
    role: 'manager',
  },
  staff1: {
    id: '4',
    email: 'staff@stockmaster.com',
    name: 'Staff User',
    role: 'staff',
  },
  staff2: {
    id: '5',
    email: 'staff2@stockmaster.com',
    name: 'Warehouse Staff',
    role: 'staff',
  },
  staff3: {
    id: '6',
    email: 'staff3@stockmaster.com',
    name: 'Inventory Staff',
    role: 'staff',
  },
}

const mockCredentials: Record<string, string> = {
  'manager@stockmaster.com': 'password',
  'manager2@stockmaster.com': 'password',
  'manager3@stockmaster.com': 'password',
  'staff@stockmaster.com': 'staff123',
  'staff2@stockmaster.com': 'staff123',
  'staff3@stockmaster.com': 'staff123',
}

export const mockAuth = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const expectedPassword = mockCredentials[credentials.email]
    
    if (!expectedPassword || credentials.password !== expectedPassword) {
      throw new Error('Invalid credentials')
    }

    // Find user by email
    const userKey = Object.keys(mockUsers).find(
      key => mockUsers[key].email === credentials.email
    )

    if (!userKey) {
      throw new Error('User not found')
    }

    const user = mockUsers[userKey]
    return {
      user,
      token: `mock-jwt-token-${user.id}`,
      refreshToken: `mock-refresh-token-${user.id}`,
    }
  },

  refresh: async (): Promise<AuthResponse> => {
    await new Promise((resolve) => setTimeout(resolve, 500))
    // In real app, this would get user from token
    // For mock, return first manager user
    return {
      user: mockUsers.manager1,
      token: 'mock-jwt-token-refreshed',
      refreshToken: 'mock-refresh-token-refreshed',
    }
  },
}
