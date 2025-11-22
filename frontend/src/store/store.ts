import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import productReducer from './slices/productSlice'
import operationReducer from './slices/operationSlice'
import warehouseReducer from './slices/warehouseSlice'
import categoryReducer from './slices/categorySlice'
import ledgerReducer from './slices/ledgerSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productReducer,
    operations: operationReducer,
    warehouses: warehouseReducer,
    categories: categoryReducer,
    ledger: ledgerReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

