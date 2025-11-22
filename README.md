# StockMaster IMS - Inventory Management System

A modern, full-stack inventory management system built with React + TypeScript (frontend) and Node.js + Express + Prisma (backend).

## Features

- ✅ **Authentication** - JWT-based auth with role management (Manager/Staff)
- ✅ **Product Management** - CRUD operations for products with categories and UOM
- ✅ **Warehouse & Location Management** - Multi-warehouse support with location tracking
- ✅ **Stock Operations**:
  - Receipts (incoming stock)
  - Deliveries (outgoing stock)
  - Internal Transfers (between locations)
  - Inventory Adjustments (stock corrections)
- ✅ **Stock Ledger** - Complete history of all stock movements
- ✅ **Dashboard** - KPIs and statistics with filters
- ✅ **Responsive UI** - Built with React, TypeScript, TailwindCSS, and shadcn/ui

## Tech Stack

### Frontend
- React 18 + TypeScript
- Vite (build tool)
- Redux Toolkit (state management)
- TailwindCSS + shadcn/ui (styling)
- Axios (HTTP client)
- React Router (routing)

### Backend
- Node.js + TypeScript
- Express.js (HTTP server)
- Prisma ORM
- PostgreSQL (database)
- JWT authentication
- bcrypt (password hashing)

## Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn

### 1. Clone the repository
```bash
git clone <repo-url>
cd stockmaster-ims
```

### 2. Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env and set your DATABASE_URL and JWT_SECRET

# Run migrations
npx prisma generate
npx prisma migrate dev --name init

# Start backend server
npm run dev
```

Backend will run at `http://localhost:5000`

### 3. Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Configure environment (already set to use local backend)
# Check frontend/.env - VITE_USE_MOCK should be false

# Start frontend dev server
npm run dev
```

Frontend will run at `http://localhost:5173`

### 4. Access the Application

Open your browser and navigate to `http://localhost:5173`

**First Time Setup:**
1. Click "Sign Up" to create an account
2. Use the credentials to log in
3. Start managing your inventory!

## Project Structure

```
stockmaster-ims/
├── frontend/              # React frontend application
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Page components
│   │   ├── store/        # Redux slices
│   │   ├── lib/          # Utilities and API client
│   │   └── types/        # TypeScript types
│   └── package.json
│
├── backend/               # Express backend API
│   ├── prisma/
│   │   └── schema.prisma # Database schema
│   ├── src/
│   │   ├── modules/      # Feature modules (auth, products, operations, etc.)
│   │   ├── middleware/   # Express middleware
│   │   ├── lib/          # Utilities (Prisma client, etc.)
│   │   └── config/       # Configuration
│   └── package.json
│
└── README.md             # This file
```

## API Endpoints

See [`backend/README.md`](backend/README.md) for complete API documentation.

Key endpoints:
- `/api/auth/*` - Authentication
- `/api/products/*` - Product management
- `/api/warehouses/*` - Warehouse management
- `/api/locations/*` - Location management
- `/api/operations/*` - Stock operations (receipts, deliveries, transfers, adjustments)
- `/api/ledger` - Stock movement history
- `/api/dashboard` - Dashboard KPIs

## Database Schema

The system uses the following main entities:

- **User** - System users with roles (Manager/Staff)
- **Warehouse** - Physical warehouse locations
- **Location** - Storage locations within warehouses
- **Product** - Items in inventory
- **StockQuant** - Current stock levels (product + location)
- **StockMove** - Historical log of stock movements
- **Receipt, DeliveryOrder, InternalTransfer, InventoryAdjustment** - Operation documents

See `backend/prisma/schema.prisma` for the complete schema.

## Stock Management Logic

### Receipts (Incoming Stock)
- Create a receipt with lines (product + location + quantity)
- Validate the receipt to increase stock at target locations
- Creates stock move entries with type `RECEIPT`

### Deliveries (Outgoing Stock)
- Create a delivery with lines (product + source location + quantity)
- Validate the delivery (checks stock availability first)
- Decreases stock and creates stock move entries with type `DELIVERY`

### Internal Transfers
- Move stock from one location to another within the system
- Validates stock availability at source before transfer
- Creates stock move entries with type `INTERNAL`

### Inventory Adjustments
- Correct stock levels based on physical counts
- Managers only
- Creates stock move entries with type `ADJUSTMENT`

All operations are transactional and maintain referential integrity.

## Development

### Backend Development
```bash
cd backend
npm run dev          # Start with hot reload
npm run build        # Build for production
npm start            # Run production build
```

### Frontend Development
```bash
cd frontend
npm run dev          # Start with hot reload
npm run build        # Build for production
npm run preview      # Preview production build
```

### Database Management
```bash
cd backend
npx prisma studio              # Open Prisma Studio (visual DB editor)
npx prisma migrate dev         # Create a new migration
npx prisma migrate reset       # Reset database (WARNING: deletes all data)
npx prisma generate            # Regenerate Prisma Client
```

## Environment Variables

### Backend (`.env`)
```env
DATABASE_URL=postgresql://user:password@localhost:5432/stockmaster
PORT=5000
JWT_SECRET=your_secure_secret_here
COOKIE_NAME=sm_auth
OTP_EXPIRES_MIN=15
```

### Frontend (`.env`)
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_USE_MOCK=false
VITE_APP_NAME=StockMaster IMS
```

## User Roles

- **Manager**: Full access including creating/deleting products, warehouses, locations, and performing adjustments
- **Staff**: Can perform daily operations (receipts, deliveries, transfers) but cannot delete or create master data

## Future Enhancements

- [ ] Add Zod validation schemas
- [ ] Implement OTP-based password reset
- [ ] Add reporting and analytics
- [ ] Barcode/QR code scanning
- [ ] Export to Excel/CSV
- [ ] Email notifications
- [ ] Multi-tenant support
- [ ] Mobile app
