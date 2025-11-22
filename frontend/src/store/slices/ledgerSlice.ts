import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { MoveLog, LedgerFilters } from '@/types'
import { apiClient } from '@/lib/api'

interface LedgerState {
  items: MoveLog[]
  isLoading: boolean
  error: string | null
  filters: LedgerFilters
}

const initialState: LedgerState = {
  items: [],
  isLoading: false,
  error: null,
  filters: {},
}

export const fetchLedger = createAsyncThunk(
  'ledger/fetchAll',
  async (filters: LedgerFilters | undefined, { rejectWithValue }) => {
    try {
      const response = await apiClient.get<MoveLog[]>('/ledger', { params: filters })
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch ledger')
    }
  }
)

const ledgerSlice = createSlice({
  name: 'ledger',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<LedgerFilters>>) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearFilters: (state) => {
      state.filters = {}
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLedger.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchLedger.fulfilled, (state, action) => {
        state.isLoading = false
        state.items = action.payload
      })
      .addCase(fetchLedger.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  },
})

export const { setFilters, clearFilters } = ledgerSlice.actions
export default ledgerSlice.reducer

