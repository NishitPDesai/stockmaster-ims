# StockMaster Inventory Management System - Frontend

A complete, production-ready frontend for the StockMaster Inventory Management System built with React, TypeScript, Tailwind CSS, and Redux Toolkit.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm

### Installation

```bash
cd frontend
npm install
```

### Development

```bash
npm run dev
```

The application will start at `http://localhost:3000`

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the `frontend` directory:

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_USE_MOCK=true
VITE_APP_NAME=StockMaster IMS
```

### Mock Mode vs Real API

- **Mock Mode** (`VITE_USE_MOCK=true`): Uses local mock data for development
- **Real API** (`VITE_USE_MOCK=false`): Connects to backend API at `VITE_API_BASE_URL`

## 🔐 User Accounts (Mock Mode)

### Manager Accounts (Full Access)
- **Manager 1:** `manager@stockmaster.com` / `password`
- **Manager 2:** `manager2@stockmaster.com` / `password`
- **Manager 3:** `manager3@stockmaster.com` / `password`

### Staff Accounts (Limited Access)
- **Staff 1:** `staff@stockmaster.com` / `staff123`
- **Staff 2:** `staff2@stockmaster.com` / `staff123`
- **Staff 3:** `staff3@stockmaster.com` / `staff123`

**Note:** The system supports multiple managers and staff. All managers share the same password (`password`) and all staff share the same password (`staff123`) in mock mode. In production, each user would have unique credentials.

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── common/          # Common components (FilterBar, DataTable, etc.)
│   │   ├── forms/           # Form components
│   │   ├── layout/          # Layout components (Sidebar, Topbar)
│   │   ├── routing/         # Route components (ProtectedRoute)
│   │   └── ui/              # shadcn UI components
│   ├── lib/                 # Utility functions
│   │   ├── api.ts           # Axios instance with JWT interceptor
│   │   ├── auth.ts          # Auth helpers
│   │   ├── format.ts        # Date/number formatting
│   │   └── utils.ts         # General utilities
│   ├── mocks/               # Mock API implementations
│   ├── pages/               # Page components
│   │   ├── operations/     # Operations pages
│   │   └── settings/        # Settings pages
│   ├── store/               # Redux store
│   │   ├── slices/         # Redux slices
│   │   ├── hooks.ts        # Typed Redux hooks
│   │   └── store.ts        # Store configuration
│   ├── types/               # TypeScript type definitions
│   ├── App.tsx              # Main app component with routing
│   ├── main.tsx             # Entry point
│   └── index.css            # Global styles
├── backend-integration.json # API contract specification
├── package.json
├── tsconfig.json
├── tailwind.config.cjs
└── vite.config.ts
```

## 🎨 Features

### Pages

- **Login** - Authentication page with 2 user accounts
- **Dashboard** - KPI overview with key metrics
- **Products** - Product management with search and filters
- **Operations**
  - **Receipts** - Incoming stock management
  - **Deliveries** - Outgoing stock management
  - **Transfers** - Internal warehouse transfers
  - **Adjustments** - Stock count adjustments
- **Ledger** - Complete movement history
- **Settings**
  - **Warehouses** - Warehouse CRUD
  - **Locations** - Location CRUD
- **Profile** - User profile page

### Components

- **FilterBar** - Reusable filter component for operations
- **DataTable** - Generic table component
- **StatusBadge** - Status indicator badges
- **KPICard** - Dashboard metric cards
- **Sidebar** - Collapsible navigation sidebar
- **Topbar** - Header with user menu

### State Management

Redux Toolkit slices for:
- Authentication
- Products
- Operations
- Warehouses & Locations
- Categories
- Ledger

## 🔌 Backend Integration

### API Contract

See `backend-integration.json` for complete API specification.

### Key Endpoints

- `POST /auth/login` - User authentication
- `GET /products` - List products
- `GET /operations` - List operations with filters
- `GET /ledger` - Movement history
- `GET /warehouses` - List warehouses
- `GET /locations` - List locations

### JWT Authentication

The app automatically:
- Attaches JWT token to requests
- Refreshes token on 401 errors
- Redirects to login on auth failure

## 🎯 Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **Redux Toolkit** - State management
- **React Router v6** - Routing
- **React Hook Form + Zod** - Form validation
- **Axios** - HTTP client
- **Lucide React** - Icons

## 📱 Responsive Design

- Mobile-first approach
- Breakpoints: `sm`, `md`, `lg`, `xl`
- Collapsible sidebar on mobile
- Touch-friendly interactions

## ♿ Accessibility

- Semantic HTML
- ARIA labels and roles
- Keyboard navigation
- Focus management
- Screen reader support

## 🧪 Testing

Run linter:

```bash
npm run lint
```

## 📝 Notes for Backend Team

1. **Authentication**: Implement JWT-based auth with refresh tokens
2. **CORS**: Enable CORS for frontend origin
3. **Error Format**: Return errors in `{ message: string }` format
4. **Pagination**: Consider adding pagination for large datasets
5. **Validation**: Validate all inputs on backend
6. **Prisma Models**: See `backend-integration.json` for suggested schema

## 📄 License

Proprietary - All rights reserved

