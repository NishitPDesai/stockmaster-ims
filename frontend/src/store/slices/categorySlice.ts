import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { ProductCategory } from '@/types'
import { apiClient } from '@/lib/api'

interface CategoryState {
  items: ProductCategory[]
  isLoading: boolean
  error: string | null
}

const initialState: CategoryState = {
  items: [],
  isLoading: false,
  error: null,
}

export const fetchCategories = createAsyncThunk(
  'categories/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get<ProductCategory[]>('/categories')
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch categories')
    }
  }
)

const categorySlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.isLoading = false
        state.items = action.payload
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  },
})

export default categorySlice.reducer

