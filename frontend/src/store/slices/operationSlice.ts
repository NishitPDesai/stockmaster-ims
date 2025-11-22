import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  Operation,
  CreateOperationDto,
  UpdateOperationDto,
  OperationFilters,
} from "@/types";
import { apiClient, USE_MOCK } from "@/lib/api";
import { mockOperations } from "@/mocks/operations";

interface OperationState {
  items: Operation[];
  selectedOperation: Operation | null;
  isLoading: boolean;
  error: string | null;
  filters: OperationFilters;
}

const initialState: OperationState = {
  items: [],
  selectedOperation: null,
  isLoading: false,
  error: null,
  filters: {},
};

export const fetchOperations = createAsyncThunk(
  "operations/fetchAll",
  async (filters: OperationFilters | undefined, { rejectWithValue }) => {
    try {
      if (USE_MOCK) {
        return mockOperations.getAll(filters);
      }
      const response = await apiClient.get<Operation[]>("/operations", {
        params: filters,
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch operations"
      );
    }
  }
);

export const fetchOperationById = createAsyncThunk(
  "operations/fetchById",
  async (id: string, { rejectWithValue }) => {
    try {
      if (USE_MOCK) {
        return mockOperations.getById(id);
      }
      const response = await apiClient.get<Operation>(`/operations/${id}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch operation"
      );
    }
  }
);

export const createOperation = createAsyncThunk(
  "operations/create",
  async (data: CreateOperationDto, { rejectWithValue }) => {
    try {
      if (USE_MOCK) {
        return mockOperations.create(data);
      }

      // Determine the correct endpoint based on document type
      let endpoint = "/operations/receipts";
      if (data.documentType === "DELIVERY") {
        endpoint = "/operations/deliveries";
      } else if (data.documentType === "TRANSFER") {
        endpoint = "/operations/transfers";
      } else if (data.documentType === "ADJUSTMENT") {
        endpoint = "/operations/adjustments";
      }

      const response = await apiClient.post<Operation>(endpoint, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create operation"
      );
    }
  }
);

export const updateOperation = createAsyncThunk(
  "operations/update",
  async (
    {
      id,
      data,
      documentType,
    }: { id: string; data: UpdateOperationDto; documentType?: string },
    { rejectWithValue }
  ) => {
    try {
      if (USE_MOCK) {
        return mockOperations.update(id, data);
      }

      // Determine the correct endpoint based on document type
      let endpoint = `/operations/receipts/${id}`;
      if (documentType === "DELIVERY") {
        endpoint = `/operations/deliveries/${id}`;
      } else if (documentType === "TRANSFER") {
        endpoint = `/operations/transfers/${id}`;
      } else if (documentType === "ADJUSTMENT") {
        endpoint = `/operations/adjustments/${id}`;
      }

      const response = await apiClient.patch<Operation>(endpoint, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update operation"
      );
    }
  }
);

export const changeOperationStatus = createAsyncThunk(
  "operations/changeStatus",
  async (
    { id, status }: { id: string; status: OperationStatus },
    { rejectWithValue }
  ) => {
    try {
      if (USE_MOCK) {
        return mockOperations.update(id, { status });
      }
      const response = await apiClient.patch<Operation>(`/operations/${id}`, {
        status,
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to change operation status"
      );
    }
  }
);

const operationSlice = createSlice({
  name: "operations",
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<OperationFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {};
    },
    setSelectedOperation: (state, action: PayloadAction<Operation | null>) => {
      state.selectedOperation = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOperations.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOperations.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchOperations.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchOperationById.fulfilled, (state, action) => {
        state.selectedOperation = action.payload;
      })
      .addCase(createOperation.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(updateOperation.fulfilled, (state, action) => {
        const index = state.items.findIndex((o) => o.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.selectedOperation?.id === action.payload.id) {
          state.selectedOperation = action.payload;
        }
      });
  },
});

export const { setFilters, clearFilters, setSelectedOperation } =
  operationSlice.actions;
export default operationSlice.reducer;
