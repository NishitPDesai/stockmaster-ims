import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { User, LoginCredentials, AuthResponse } from "@/types";
import { apiClient, USE_MOCK } from "@/lib/api";
import {
  setStoredUser,
  clearStoredAuth,
  setAuthToken,
  setRefreshToken,
} from "@/lib/auth";
import { mockAuth } from "@/mocks/auth";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
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

      const response = await apiClient.post<AuthResponse>(
        "/auth/login",
        credentials
      );
      const { user, token, refreshToken } = response.data;

      setStoredUser(user);
      setAuthToken(token);
      setRefreshToken(refreshToken);

      return { user, token, refreshToken };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Login failed");
    }
  }
);

export const signup = createAsyncThunk(
  "auth/signup",
  async (
    data: { name: string; email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      if (USE_MOCK) {
        // Mock signup - just create a user and log them in
        const mockUser: User = {
          id: Math.random().toString(),
          name: data.name,
          email: data.email,
          role: "STAFF",
        };
        const mockToken = "mock-token-" + Math.random();
        const mockRefreshToken = "mock-refresh-" + Math.random();

        setStoredUser(mockUser);
        setAuthToken(mockToken);
        setRefreshToken(mockRefreshToken);

        return {
          user: mockUser,
          token: mockToken,
          refreshToken: mockRefreshToken,
        };
      }

      const response = await apiClient.post<AuthResponse>("/auth/signup", data);
      const { user, token, refreshToken } = response.data;

      setStoredUser(user);
      setAuthToken(token);
      if (refreshToken) setRefreshToken(refreshToken);

      return { user, token, refreshToken };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Signup failed");
    }
  }
);

export const logout = createAsyncThunk("auth/logout", async () => {
  clearStoredAuth();
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

      return { user, token: null, refreshToken: null };
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
      // Signup
      .addCase(signup.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(signup.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      })
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
        state.isAuthenticated = true;
      })
      .addCase(restoreAuth.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
      });
  },
});

export const { setUser, clearError } = authSlice.actions;
export default authSlice.reducer;
