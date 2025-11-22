import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { Warehouse, Location, CreateWarehouseDto, CreateLocationDto } from '@/types'
import { apiClient } from '@/lib/api'

interface WarehouseState {
  warehouses: Warehouse[]
  locations: Location[]
  selectedWarehouse: Warehouse | null
  isLoading: boolean
  error: string | null
}

const initialState: WarehouseState = {
  warehouses: [],
  locations: [],
  selectedWarehouse: null,
  isLoading: false,
  error: null,
}

// Warehouse actions
export const fetchWarehouses = createAsyncThunk(
  'warehouses/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get<Warehouse[]>('/warehouses')
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch warehouses')
    }
  }
)

export const createWarehouse = createAsyncThunk(
  'warehouses/create',
  async (data: CreateWarehouseDto, { rejectWithValue }) => {
    try {
      const response = await apiClient.post<Warehouse>('/warehouses', data)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create warehouse')
    }
  }
)

export const updateWarehouse = createAsyncThunk(
  'warehouses/update',
  async ({ id, data }: { id: string; data: Partial<CreateWarehouseDto> }, { rejectWithValue }) => {
    try {
      const response = await apiClient.patch<Warehouse>(`/warehouses/${id}`, data)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update warehouse')
    }
  }
)

export const deleteWarehouse = createAsyncThunk(
  'warehouses/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/warehouses/${id}`)
      return id
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete warehouse')
    }
  }
)

// Location actions
export const fetchLocations = createAsyncThunk(
  'locations/fetchAll',
  async (warehouseId: string | undefined, { rejectWithValue }) => {
    try {
      const response = await apiClient.get<Location[]>('/locations', {
        params: warehouseId ? { warehouseId } : {},
      })
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch locations')
    }
  }
)

export const createLocation = createAsyncThunk(
  'locations/create',
  async (data: CreateLocationDto, { rejectWithValue }) => {
    try {
      const response = await apiClient.post<Location>('/locations', data)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create location')
    }
  }
)

export const updateLocation = createAsyncThunk(
  'locations/update',
  async ({ id, data }: { id: string; data: Partial<CreateLocationDto> }, { rejectWithValue }) => {
    try {
      const response = await apiClient.patch<Location>(`/locations/${id}`, data)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update location')
    }
  }
)

export const deleteLocation = createAsyncThunk(
  'locations/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/locations/${id}`)
      return id
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete location')
    }
  }
)

const warehouseSlice = createSlice({
  name: 'warehouses',
  initialState,
  reducers: {
    setSelectedWarehouse: (state, action: PayloadAction<Warehouse | null>) => {
      state.selectedWarehouse = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      // Warehouses
      .addCase(fetchWarehouses.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchWarehouses.fulfilled, (state, action) => {
        state.isLoading = false
        state.warehouses = action.payload
      })
      .addCase(fetchWarehouses.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      .addCase(createWarehouse.fulfilled, (state, action) => {
        state.warehouses.push(action.payload)
      })
      .addCase(updateWarehouse.fulfilled, (state, action) => {
        const index = state.warehouses.findIndex((w) => w.id === action.payload.id)
        if (index !== -1) {
          state.warehouses[index] = action.payload
        }
      })
      .addCase(deleteWarehouse.fulfilled, (state, action) => {
        state.warehouses = state.warehouses.filter((w) => w.id !== action.payload)
      })
      // Locations
      .addCase(fetchLocations.fulfilled, (state, action) => {
        state.locations = action.payload
      })
      .addCase(createLocation.fulfilled, (state, action) => {
        state.locations.push(action.payload)
      })
      .addCase(updateLocation.fulfilled, (state, action) => {
        const index = state.locations.findIndex((l) => l.id === action.payload.id)
        if (index !== -1) {
          state.locations[index] = action.payload
        }
      })
      .addCase(deleteLocation.fulfilled, (state, action) => {
        state.locations = state.locations.filter((l) => l.id !== action.payload)
      })
  },
})

export const { setSelectedWarehouse } = warehouseSlice.actions
export default warehouseSlice.reducer

