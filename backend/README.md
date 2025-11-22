# StockMaster Backend

Node.js + TypeScript + Express + Prisma backend for the StockMaster Inventory Management System.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Auth**: JWT with HTTP-only cookies

## Project Structure

```
backend/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── app.ts                 # Express app setup
│   ├── server.ts              # HTTP server entry point
│   ├── config/
│   │   └── index.ts           # Environment configuration
│   ├── lib/
│   │   └── prisma.ts          # Prisma client singleton
│   ├── middleware/
│   │   └── auth.ts            # Authentication middleware
│   └── modules/
│       ├── auth/              # Authentication endpoints
│       ├── products/          # Product CRUD
│       ├── warehouses/        # Warehouse CRUD
│       ├── locations/         # Location CRUD
│       ├── categories/        # Category listing
│       ├── operations/        # Receipts, deliveries, transfers, adjustments
│       ├── ledger/            # Stock move history
│       └── dashboard/         # KPI aggregations
├── .env                       # Environment variables
└── package.json
```

## Setup

1. **Install dependencies**:
   ```bash
   cd backend
   npm install
   ```

2. **Configure environment** (create `.env` from `.env.example`):
   ```env
   DATABASE_URL=postgresql://user:password@localhost:5432/stockmaster
   PORT=5000
   JWT_SECRET=your_secure_random_secret_here
   COOKIE_NAME=sm_auth
   OTP_EXPIRES_MIN=15
   ```

3. **Run Prisma migrations**:
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```

   Server will run at `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/login` - Login (sets JWT cookie)
- `POST /api/auth/logout` - Logout (clears cookie)
- `GET /api/auth/me` - Get current user

### Products
- `GET /api/products` - List products (filters: search, category, warehouseId, locationId, lowStockOnly)
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (requires MANAGER)
- `PATCH /api/products/:id` - Update product
- `DELETE /api/products/:id` - Soft delete product (requires MANAGER)
- `GET /api/products/:id/stock` - Get stock by location for a product

### Warehouses
- `GET /api/warehouses` - List warehouses
- `GET /api/warehouses/:id` - Get warehouse by ID
- `POST /api/warehouses` - Create warehouse (requires MANAGER)
- `PATCH /api/warehouses/:id` - Update warehouse (requires MANAGER)
- `DELETE /api/warehouses/:id` - Soft delete warehouse (requires MANAGER)

### Locations
- `GET /api/locations` - List locations (filter: warehouseId)
- `GET /api/locations/:id` - Get location by ID
- `POST /api/locations` - Create location (requires MANAGER)
- `PATCH /api/locations/:id` - Update location (requires MANAGER)
- `DELETE /api/locations/:id` - Soft delete location (requires MANAGER)

### Categories
- `GET /api/categories` - List all product categories

### Operations

#### Receipts (Incoming Stock)
- `GET /api/operations/receipts` - List receipts
- `GET /api/operations/receipts/:id` - Get receipt details
- `POST /api/operations/receipts` - Create receipt
- `PATCH /api/operations/receipts/:id` - Update receipt
- `POST /api/operations/receipts/:id/validate` - Validate receipt (increases stock)

#### Deliveries (Outgoing Stock)
- `GET /api/operations/deliveries` - List deliveries
- `GET /api/operations/deliveries/:id` - Get delivery details
- `POST /api/operations/deliveries` - Create delivery
- `PATCH /api/operations/deliveries/:id` - Update delivery
- `POST /api/operations/deliveries/:id/validate` - Validate delivery (decreases stock)

#### Internal Transfers
- `GET /api/operations/transfers` - List transfers
- `GET /api/operations/transfers/:id` - Get transfer details
- `POST /api/operations/transfers` - Create transfer
- `PATCH /api/operations/transfers/:id` - Update transfer
- `POST /api/operations/transfers/:id/validate` - Validate transfer (moves stock between locations)

#### Inventory Adjustments
- `GET /api/operations/adjustments` - List adjustments
- `GET /api/operations/adjustments/:id` - Get adjustment details
- `POST /api/operations/adjustments` - Create adjustment (requires MANAGER)
- `PATCH /api/operations/adjustments/:id` - Update adjustment (requires MANAGER)
- `POST /api/operations/adjustments/:id/validate` - Validate adjustment (adjusts stock to counted quantity)

### Ledger
- `GET /api/ledger` - List stock move history (filters: productId, warehouseId, locationId, moveType, status, dateFrom, dateTo)

### Dashboard
- `GET /api/dashboard` - Get aggregated KPIs (filters: warehouseId, locationId, category)
  Returns: `totalProducts`, `productsInStock`, `lowStockItems`, `outOfStockItems`, `pendingReceipts`, `pendingDeliveries`, `pendingTransfers`

## Stock Management Logic

### Receipt Validation
When a receipt is validated:
1. For each line, the `receivedQty` (or `orderedQty`) is added to `StockQuant` at the target location
2. A `StockMove` entry is created with `moveType: RECEIPT`
3. Receipt status is updated to `DONE`

### Delivery Validation
When a delivery is validated:
1. Stock availability is checked for each line
2. If sufficient stock exists, quantity is reduced from the source location
3. A `StockMove` entry is created with `moveType: DELIVERY`
4. Delivery status is updated to `DONE`
5. If insufficient stock, validation fails with an error

### Internal Transfer Validation
When an internal transfer is validated:
1. Stock availability is checked at the source location
2. Stock is reduced from source location and increased at destination location
3. A `StockMove` entry is created with `moveType: INTERNAL`
4. Transfer status is updated to `DONE`

### Inventory Adjustment Validation
When an adjustment is validated:
1. The difference between `countedQty` and `previousQty` is calculated
2. `StockQuant` is updated to the counted quantity
3. A `StockMove` entry is created with `moveType: ADJUSTMENT`
4. Adjustment status is updated to `DONE`

All stock operations use database transactions to ensure consistency.

## Development

- **Run tests**: (Not yet implemented)
- **Build for production**: `npm run build`
- **Start production**: `npm start`

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | - |
| `PORT` | Server port | `5000` |
| `JWT_SECRET` | Secret key for JWT signing | - |
| `COOKIE_NAME` | Name of auth cookie | `sm_auth` |
| `OTP_EXPIRES_MIN` | OTP expiration time in minutes | `15` |

## Authentication Flow

1. User signs up or logs in via `/api/auth/signup` or `/api/auth/login`
2. Server generates a JWT and stores it in an HTTP-only cookie
3. Frontend includes the cookie automatically in subsequent requests
4. Middleware `attachUser` validates the JWT and attaches `req.user`
5. Protected routes use `requireAuth` and optionally `requireRole(['MANAGER'])`

## Database Models

See `prisma/schema.prisma` for the complete data model.

Key entities:
- **User** - System users (manager/staff roles)
- **Warehouse** - Physical warehouse locations
- **Location** - Storage locations within warehouses
- **Product** - Items in inventory
- **StockQuant** - Current stock quantity per product+location
- **StockMove** - Historical log of all stock movements
- **Receipt** - Incoming stock documents
- **DeliveryOrder** - Outgoing stock documents
- **InternalTransfer** - Stock movement between locations
- **InventoryAdjustment** - Stock corrections

## Notes

- All "delete" operations are soft deletes (setting `isActive = false`)
- Only MANAGER role can create/delete products, warehouses, locations, and adjustments
- Stock is tracked at the location level (product + location = unique stock quantity)
- All timestamps are stored in UTC and returned as ISO 8601 strings
