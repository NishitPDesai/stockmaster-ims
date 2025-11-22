import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  Operation,
  CreateOperationDto,
  UpdateOperationDto,
  OperationFilters,
  OperationStatus,
} from "@/types";
import { apiClient } from "@/lib/api";

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
      // Backend endpoint: /api/operations (returns all operations)
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
  async (
    { id, documentType }: { id: string; documentType: string },
    { rejectWithValue }
  ) => {
    try {
      // Determine the correct endpoint based on document type
      let endpoint = `/operations/receipts/${id}`;
      if (documentType === "DELIVERY") {
        endpoint = `/operations/deliveries/${id}`;
      } else if (documentType === "TRANSFER") {
        endpoint = `/operations/transfers/${id}`;
      } else if (documentType === "ADJUSTMENT") {
        endpoint = `/operations/adjustments/${id}`;
      }

      const response = await apiClient.get<Operation>(endpoint);
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
      // Determine the correct endpoint based on document type
      let endpoint = "/operations/receipts";
      if (data.documentType === "DELIVERY") {
        endpoint = "/operations/deliveries";
      } else if (data.documentType === "TRANSFER") {
        endpoint = "/operations/transfers";
      } else if (data.documentType === "ADJUSTMENT") {
        endpoint = "/operations/adjustments";
      }

      // Transform data to match backend format (lines instead of lineItems)
      const backendData = {
        ...data,
        lines: data.lineItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          uom: item.uom,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          // Receipt-specific fields
          locationId: data.warehouseId ? undefined : undefined, // Will be set per line
          orderedQty: item.quantity,
          receivedQty: item.quantity,
        })),
      };

      const response = await apiClient.post<Operation>(endpoint, backendData);
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
      // Determine the correct endpoint based on document type
      let endpoint = `/operations/receipts/${id}`;
      if (documentType === "DELIVERY") {
        endpoint = `/operations/deliveries/${id}`;
      } else if (documentType === "TRANSFER") {
        endpoint = `/operations/transfers/${id}`;
      } else if (documentType === "ADJUSTMENT") {
        endpoint = `/operations/adjustments/${id}`;
      }

      // Transform data to match backend format
      const backendData: any = { ...data };
      if (data.lineItems) {
        backendData.lines = data.lineItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          uom: item.uom,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
        }));
        delete backendData.lineItems;
      }

      const response = await apiClient.patch<Operation>(endpoint, backendData);
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
    {
      id,
      status,
      documentType,
    }: { id: string; status: OperationStatus; documentType: string },
    { rejectWithValue }
  ) => {
    try {
      // Determine the correct endpoint based on document type
      let endpoint = `/operations/receipts/${id}`;
      if (documentType === "DELIVERY") {
        endpoint = `/operations/deliveries/${id}`;
      } else if (documentType === "TRANSFER") {
        endpoint = `/operations/transfers/${id}`;
      } else if (documentType === "ADJUSTMENT") {
        endpoint = `/operations/adjustments/${id}`;
      }

      // For status changes, backend uses validate endpoint for READY->DONE
      if (status === "DONE") {
        const validateEndpoint = `${endpoint}/validate`;
        const response = await apiClient.post<Operation>(validateEndpoint);
        return response.data;
      } else {
        // For other status changes, use PATCH
        const response = await apiClient.patch<Operation>(endpoint, { status });
        return response.data;
      }
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
