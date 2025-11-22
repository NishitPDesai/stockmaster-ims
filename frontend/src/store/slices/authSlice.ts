import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { User, LoginCredentials, AuthResponse } from '@/types'
import { apiClient, USE_MOCK } from '@/lib/api'
import { setStoredUser, clearStoredAuth, setAuthToken, setRefreshToken } from '@/lib/auth'
import { mockAuth } from '@/mocks/auth'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
}

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      if (USE_MOCK) {
        const response = await mockAuth.login(credentials)
        return response
      }

      const response = await apiClient.post<AuthResponse>('/auth/login', credentials)
      const { user, token, refreshToken } = response.data

      setStoredUser(user)
      setAuthToken(token)
      setRefreshToken(refreshToken)

      return { user, token, refreshToken }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Login failed')
    }
  }
)

export const logout = createAsyncThunk('auth/logout', async () => {
  clearStoredAuth()
  if (!USE_MOCK) {
    try {
      await apiClient.post('/auth/logout')
    } catch (error) {
      // Ignore logout errors
    }
  }
})

export const refreshAuth = createAsyncThunk(
  'auth/refresh',
  async (_, { rejectWithValue }) => {
    try {
      if (USE_MOCK) {
        const response = await mockAuth.refresh()
        return response
      }

      const refreshToken = localStorage.getItem('refresh_token')
      if (!refreshToken) {
        throw new Error('No refresh token')
      }

      const response = await apiClient.post<AuthResponse>('/auth/refresh', {
        refreshToken,
      })

      const { user, token, refreshToken: newRefreshToken } = response.data

      setStoredUser(user)
      setAuthToken(token)
      setRefreshToken(newRefreshToken)

      return { user, token, refreshToken: newRefreshToken }
    } catch (error: any) {
      clearStoredAuth()
      return rejectWithValue(error.response?.data?.message || 'Refresh failed')
    }
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload
      state.isAuthenticated = true
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.user
        state.token = action.payload.token
        state.isAuthenticated = true
        state.error = null
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
        state.isAuthenticated = false
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null
        state.token = null
        state.isAuthenticated = false
        state.error = null
      })
      // Refresh
      .addCase(refreshAuth.fulfilled, (state, action) => {
        state.user = action.payload.user
        state.token = action.payload.token
        state.isAuthenticated = true
        state.error = null
      })
      .addCase(refreshAuth.rejected, (state) => {
        state.user = null
        state.token = null
        state.isAuthenticated = false
      })
  },
})

export const { setUser, clearError } = authSlice.actions
export default authSlice.reducer

