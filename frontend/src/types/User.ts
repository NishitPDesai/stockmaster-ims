export interface User {
  id: string
  email: string
  name: string
  role: string
  avatar?: string
}

export interface LoginCredentials {
  loginId: string
  password: string
}

export interface RegisterCredentials {
  loginId: string
  email: string
  password: string
}

export interface AuthResponse {
  user: User
  token: string
  refreshToken: string
}

