import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { User, LoginCredentials, RegisterCredentials, AuthResponse } from '@/types'
import { apiClient, USE_MOCK } from '@/lib/api'
import { setStoredUser, clearStoredAuth, setAuthToken, setRefreshToken, getStoredUser, getAuthToken } from '@/lib/auth'
import { mockAuth } from '@/mocks/auth'

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Initialize state from localStorage for persistence
const storedUser = getStoredUser()
const storedToken = getAuthToken()

const initialState: AuthState = {
  user: storedUser,
  token: storedToken,
  isAuthenticated: !!(storedUser && storedToken),
  isLoading: false,
  error: null,
};

// Async thunks
export const login = createAsyncThunk(
  "auth/login",
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      if (USE_MOCK) {
        const response = await mockAuth.login(credentials);
        return response;
      }

      const response = await apiClient.post<{ success: boolean; user: User; token: string; refreshToken: string }>(
        "/auth/login",
        credentials
      );
      const { user, token, refreshToken } = response.data;

      setStoredUser(user);
      setAuthToken(token);
      setRefreshToken(refreshToken);

      return { user, token, refreshToken };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error?.message || "Login failed");
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (credentials: RegisterCredentials, { rejectWithValue }) => {
    try {
      if (USE_MOCK) {
        const response = await mockAuth.register(credentials)
        const { user, token, refreshToken } = response
        
        setStoredUser(user)
        setAuthToken(token)
        setRefreshToken(refreshToken)
        
        return { user, token, refreshToken }
      }

      const response = await apiClient.post<{ success: boolean; user: User; token: string; refreshToken: string }>('/auth/register', credentials)
      const { user, token, refreshToken } = response.data

      setStoredUser(user)
      setAuthToken(token)
      setRefreshToken(refreshToken)

      return { user, token, refreshToken }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Registration failed'
      return rejectWithValue(errorMessage)
    }
  }
)

export const logout = createAsyncThunk('auth/logout', async () => {
  clearStoredAuth()
  if (!USE_MOCK) {
    try {
      await apiClient.post("/auth/logout");
    } catch (error) {
      // Ignore logout errors
    }
  }
});

export const restoreAuth = createAsyncThunk(
  "auth/restore",
  async (_, { rejectWithValue }) => {
    try {
      // Get stored token and user from localStorage
      const storedToken = getAuthToken();
      const storedUser = getStoredUser();
      
      if (!storedToken || !storedUser) {
        clearStoredAuth();
        return rejectWithValue("No stored authentication found");
      }

      if (USE_MOCK) {
        const response = await mockAuth.refresh();
        return response;
      }

      // Use /auth/me endpoint to verify token and get current user
      const response = await apiClient.get<{ success: boolean; user: User }>(
        "/auth/me"
      );
      const { user } = response.data;

      setStoredUser(user);

      // Return the stored token since it's still valid
      return { user, token: storedToken, refreshToken: null };
    } catch (error: any) {
      clearStoredAuth();
      return rejectWithValue(
        error.response?.data?.message || "Auth restore failed"
      );
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      })
      // Register
      .addCase(register.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.user
        state.token = action.payload.token
        state.isAuthenticated = true
        state.error = null
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
        state.isAuthenticated = false
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      // Restore auth
      .addCase(restoreAuth.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(restoreAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(restoreAuth.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      });
  },
});

export const { setUser, clearError } = authSlice.actions;
export default authSlice.reducer;
