# Backend Integration Summary

This document summarizes the changes made to integrate the frontend with the backend API.

## Key Changes

### 1. API Client (`src/lib/api.ts`)
- **Removed mock mode**: All `USE_MOCK` references removed
- **Cookie-based authentication**: Changed from Bearer token to HTTP-only cookies
  - Added `withCredentials: true` to axios config
  - Removed Authorization header interceptor
  - Backend handles JWT via cookies automatically

### 2. Authentication (`src/store/slices/authSlice.ts`)
- **Updated endpoints**: Uses `/api/auth/signup`, `/api/auth/login`, `/api/auth/logout`, `/api/auth/me`
- **Removed token storage**: No longer stores tokens in localStorage (backend uses cookies)
- **Response format**: Backend returns `{ success: boolean, user: User, token?: string }`
- **Email-based login**: Already uses email (not loginId)

### 3. Operations (`src/store/slices/operationSlice.ts`)
- **Updated endpoints**: 
  - Receipts: `/api/operations/receipts`
  - Deliveries: `/api/operations/deliveries`
  - Transfers: `/api/operations/transfers`
  - Adjustments: `/api/operations/adjustments`
- **Data transformation**: 
  - Frontend uses `lineItems`, backend uses `lines`
  - Frontend uses `documentNumber`, backend uses `code` (backend transforms it)
- **Status changes**: Uses `/validate` endpoint for READY->DONE transitions
- **fetchOperationById**: Now requires both `id` and `documentType` parameters

### 4. Products (`src/store/slices/productSlice.ts`)
- **Removed mock mode**: All API calls now go to backend
- **Endpoints**: `/api/products` (GET, POST, PATCH, DELETE)

### 5. Warehouses & Locations (`src/store/slices/warehouseSlice.ts`)
- **Removed mock mode**: All API calls now go to backend
- **Endpoints**: 
  - Warehouses: `/api/warehouses`
  - Locations: `/api/locations` (with optional `warehouseId` filter)

### 6. Ledger (`src/store/slices/ledgerSlice.ts`)
- **Removed mock mode**: All API calls now go to backend
- **Endpoint**: `/api/ledger` (with filters)

### 7. Categories (`src/store/slices/categorySlice.ts`)
- **Removed mock mode**: All API calls now go to backend
- **Endpoint**: `/api/categories`

### 8. Environment Configuration
- **Created `.env` file**: `VITE_API_BASE_URL=http://localhost:5000/api`
- **Removed**: `VITE_USE_MOCK` (no longer needed)

## Backend API Structure

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login (sets HTTP-only cookie)
- `POST /api/auth/logout` - Logout (clears cookie)
- `GET /api/auth/me` - Get current user

### Operations
- `GET /api/operations` - List all operations (unified)
- `GET /api/operations/receipts` - List receipts
- `GET /api/operations/receipts/:id` - Get receipt
- `POST /api/operations/receipts` - Create receipt
- `PATCH /api/operations/receipts/:id` - Update receipt
- `POST /api/operations/receipts/:id/validate` - Validate receipt (READY->DONE)

Similar endpoints for deliveries, transfers, and adjustments.

### Products
- `GET /api/products` - List products
- `GET /api/products/:id` - Get product
- `POST /api/products` - Create product
- `PATCH /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Warehouses & Locations
- `GET /api/warehouses` - List warehouses
- `POST /api/warehouses` - Create warehouse
- `PATCH /api/warehouses/:id` - Update warehouse
- `DELETE /api/warehouses/:id` - Delete warehouse

- `GET /api/locations` - List locations (filter: warehouseId)
- `POST /api/locations` - Create location
- `PATCH /api/locations/:id` - Update location
- `DELETE /api/locations/:id` - Delete location

## Role-Based Access Control

The backend uses uppercase role names:
- `MANAGER` - Full access
- `STAFF` - Limited access (cannot delete, cannot access settings)

The frontend permissions system (`src/lib/permissions.ts`) already uses uppercase roles, so no changes needed.

## Data Format Differences

### Operations
- **Backend format**: Uses `code` and `lines`
- **Frontend format**: Uses `documentNumber` and `lineItems`
- **Solution**: Backend transforms data in the service layer to match frontend expectations

### User Roles
- **Backend**: Returns `MANAGER` or `STAFF` (uppercase)
- **Frontend**: Already expects uppercase roles

## Testing

1. **Start backend**: `cd backend && npm run dev` (runs on port 5000)
2. **Start frontend**: `cd frontend && npm run dev` (runs on port 5173)
3. **Test authentication**: Sign up or login
4. **Test operations**: Create receipts, deliveries, transfers, adjustments
5. **Test permissions**: Verify manager vs staff access

## Notes

- All API calls now require the backend to be running
- Authentication is handled via HTTP-only cookies (more secure)
- The backend transforms operation data to match frontend expectations
- Mock mode has been completely removed

