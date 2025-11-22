# Backend Implementation Guide - StockMaster IMS

This document provides complete specifications for building the backend API for StockMaster Inventory Management System.

## 📋 Table of Contents

1. [Database Schema](#database-schema)
2. [API Endpoints](#api-endpoints)
3. [Authentication & Authorization](#authentication--authorization)
4. [Data Models](#data-models)
5. [Business Logic](#business-logic)
6. [Technology Stack Recommendations](#technology-stack-recommendations)

---

## 🗄️ Database Schema

### Prisma Schema (PostgreSQL)

```prisma
// schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================
// USER MANAGEMENT
// ============================================

enum UserRole {
  MANAGER
  STAFF
}

model User {
  id            String   @id @default(uuid())
  email         String   @unique
  passwordHash  String   // bcrypt hashed password
  name          String
  role          UserRole @default(STAFF)
  avatar        String?
  isActive      Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  // Relations
  createdOperations Operation[] @relation("CreatedBy")
  validatedOperations Operation[] @relation("ValidatedBy")

  @@index([email])
  @@index([role])
}

// ============================================
// PRODUCT MANAGEMENT
// ============================================

model ProductCategory {
  id        String   @id @default(uuid())
  name      String   @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  products Product[]
}

model Product {
  id        String   @id @default(uuid())
  name      String
  sku       String   @unique
  category  String
  uom       String   // Unit of Measure (Unit, Kg, Liter, etc.)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  lineItems OperationLineItem[]
  stockMovements MoveLog[]

  @@index([sku])
  @@index([category])
}

// ============================================
// WAREHOUSE MANAGEMENT
// ============================================

model Warehouse {
  id        String   @id @default(uuid())
  name      String
  code      String   @unique
  address   String?
  city      String?
  country   String?
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  locations      Location[]
  operations     Operation[]
  sourceTransfers Operation[] @relation("SourceWarehouse")
  destTransfers  Operation[] @relation("DestinationWarehouse")
  stockMovements MoveLog[]
  stockLevels    StockLevel[]

  @@index([code])
  @@index([isActive])
}

model Location {
  id          String   @id @default(uuid())
  warehouseId String
  name        String
  code        String
  description String?
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  warehouse     Warehouse @relation(fields: [warehouseId], references: [id], onDelete: Cascade)
  stockMovements MoveLog[]
  stockLevels    StockLevel[]

  @@unique([warehouseId, code])
  @@index([warehouseId])
}

// ============================================
// OPERATIONS
// ============================================

enum DocumentType {
  RECEIPT
  DELIVERY
  TRANSFER
  ADJUSTMENT
}

enum OperationStatus {
  DRAFT
  WAITING
  READY
  DONE
  CANCELED
}

model Operation {
  id                    String         @id @default(uuid())
  documentType          DocumentType
  status                OperationStatus @default(DRAFT)
  documentNumber        String         @unique
  warehouseId           String?
  sourceWarehouseId     String?
  destinationWarehouseId String?
  supplierId            String?
  customerId            String?
  notes                 String?
  createdAt             DateTime       @default(now())
  updatedAt             DateTime       @updatedAt
  createdBy             String
  validatedAt           DateTime?
  validatedBy          String?

  // Relations
  warehouse         Warehouse?  @relation(fields: [warehouseId], references: [id])
  sourceWarehouse   Warehouse?  @relation("SourceWarehouse", fields: [sourceWarehouseId], references: [id])
  destWarehouse     Warehouse?  @relation("DestinationWarehouse", fields: [destinationWarehouseId], references: [id])
  creator           User        @relation("CreatedBy", fields: [createdBy], references: [id])
  validator         User?       @relation("ValidatedBy", fields: [validatedBy], references: [id])
  lineItems         OperationLineItem[]
  stockMovements    MoveLog[]

  @@index([documentType])
  @@index([status])
  @@index([warehouseId])
  @@index([createdAt])
  @@index([documentNumber])
}

model OperationLineItem {
  id          String   @id @default(uuid())
  operationId String
  productId   String
  quantity   Float
  uom        String
  unitPrice  Float?
  totalPrice Float?

  // Relations
  operation Operation @relation(fields: [operationId], references: [id], onDelete: Cascade)
  product   Product   @relation(fields: [productId], references: [id])

  @@index([operationId])
  @@index([productId])
}

// ============================================
// STOCK MANAGEMENT
// ============================================

model StockLevel {
  id          String   @id @default(uuid())
  productId  String
  warehouseId String
  locationId String?
  quantity   Float     @default(0)
  reserved   Float     @default(0) // Reserved for pending operations
  createdAt  DateTime  @default(now())
  updatedAt  DateTime  @updatedAt

  // Relations
  product   Product   @relation(fields: [productId], references: [id], onDelete: Cascade)
  warehouse Warehouse @relation(fields: [warehouseId], references: [id], onDelete: Cascade)
  location  Location? @relation(fields: [locationId], references: [id], onDelete: SetNull)

  @@unique([productId, warehouseId, locationId])
  @@index([productId])
  @@index([warehouseId])
}

enum MovementType {
  IN
  OUT
  TRANSFER
}

model MoveLog {
  id            String        @id @default(uuid())
  documentType  DocumentType
  documentId    String
  documentNumber String
  productId     String
  warehouseId   String
  locationId   String?
  quantity      Float
  quantityBefore Float
  quantityAfter  Float
  movementType  MovementType
  status        OperationStatus
  createdAt     DateTime      @default(now())
  createdBy     String

  // Relations
  product   Product   @relation(fields: [productId], references: [id])
  warehouse Warehouse @relation(fields: [warehouseId], references: [id])
  location  Location? @relation(fields: [locationId], references: [id])

  @@index([documentType])
  @@index([documentId])
  @@index([productId])
  @@index([warehouseId])
  @@index([createdAt])
  @@index([movementType])
}

// ============================================
// EXTERNAL ENTITIES (Optional)
// ============================================

model Supplier {
  id        String   @id @default(uuid())
  name      String
  email     String?
  phone     String?
  address   String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  receipts Operation[]
}

model Customer {
  id        String   @id @default(uuid())
  name      String
  email     String?
  phone     String?
  address   String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  deliveries Operation[]
}
```

---

## 🔌 API Endpoints

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### POST `/auth/login`
**Request:**
```json
{
  "email": "manager@stockmaster.com",
  "password": "password"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "manager@stockmaster.com",
    "name": "Manager User",
    "role": "MANAGER"
  },
  "token": "jwt-access-token",
  "refreshToken": "jwt-refresh-token"
}
```

#### POST `/auth/refresh`
**Request:**
```json
{
  "refreshToken": "jwt-refresh-token"
}
```

**Response:** Same as login

#### POST `/auth/logout`
**Request:** Headers only (Authorization: Bearer token)

**Response:** `204 No Content`

---

### Product Endpoints

#### GET `/products`
**Query Parameters:**
- `search` (string, optional) - Search by name or SKU
- `category` (string, optional) - Filter by category

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Laptop Computer",
    "sku": "LAP-001",
    "category": "Electronics",
    "uom": "Unit",
    "initialStock": 50,
    "stockPerWarehouse": {
      "warehouse-id-1": 30,
      "warehouse-id-2": 20
    },
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
]
```

#### GET `/products/:id`
**Response:** Single product object

#### POST `/products`
**Request:**
```json
{
  "name": "Product Name",
  "sku": "SKU-001",
  "category": "Category Name",
  "uom": "Unit"
}
```

**Response:** Created product object

#### PATCH `/products/:id`
**Request:** Partial product object

**Response:** Updated product object

#### DELETE `/products/:id`
**Response:** `204 No Content`

---

### Operation Endpoints

#### GET `/operations`
**Query Parameters:**
- `documentType` (RECEIPT | DELIVERY | TRANSFER | ADJUSTMENT, optional)
- `status` (DRAFT | WAITING | READY | DONE | CANCELED, optional)
- `warehouseId` (string, optional)
- `category` (string, optional)
- `dateFrom` (ISO date string, optional)
- `dateTo` (ISO date string, optional)

**Response:**
```json
[
  {
    "id": "uuid",
    "documentType": "RECEIPT",
    "status": "DONE",
    "documentNumber": "REC-001",
    "warehouseId": "uuid",
    "warehouseName": "Main Warehouse",
    "supplierId": "uuid",
    "supplierName": "Supplier A",
    "lineItems": [
      {
        "id": "uuid",
        "productId": "uuid",
        "productName": "Laptop Computer",
        "productSku": "LAP-001",
        "quantity": 10,
        "uom": "Unit",
        "unitPrice": 999.99,
        "totalPrice": 9999.90
      }
    ],
    "notes": "Optional notes",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z",
    "createdBy": "uuid",
    "validatedAt": "2024-01-01T00:00:00Z",
    "validatedBy": "uuid"
  }
]
```

#### GET `/operations/:id`
**Response:** Single operation object

#### POST `/operations`
**Request:**
```json
{
  "documentType": "RECEIPT",
  "warehouseId": "uuid",
  "supplierId": "uuid", // Optional, for RECEIPT
  "customerId": "uuid", // Optional, for DELIVERY
  "sourceWarehouseId": "uuid", // Required for TRANSFER
  "destinationWarehouseId": "uuid", // Required for TRANSFER
  "lineItems": [
    {
      "productId": "uuid",
      "quantity": 10,
      "uom": "Unit"
    }
  ],
  "notes": "Optional notes"
}
```

**Response:** Created operation object

#### PATCH `/operations/:id`
**Request:**
```json
{
  "status": "READY", // For status changes
  "lineItems": [...], // For editing DRAFT operations
  "notes": "Updated notes"
}
```

**Response:** Updated operation object

**Note:** 
- Only DRAFT operations can be edited (lineItems, notes)
- Status changes follow workflow: DRAFT → READY → DONE
- Only managers can cancel operations

---

### Warehouse Endpoints

#### GET `/warehouses`
**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Main Warehouse",
    "code": "WH-001",
    "address": "123 Main St",
    "city": "City",
    "country": "Country",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
]
```

#### POST `/warehouses`
**Request:**
```json
{
  "name": "Warehouse Name",
  "code": "WH-001",
  "address": "Address",
  "city": "City",
  "country": "Country"
}
```

#### PATCH `/warehouses/:id`
**Request:** Partial warehouse object

#### DELETE `/warehouses/:id`
**Response:** `204 No Content`

---

### Location Endpoints

#### GET `/locations`
**Query Parameters:**
- `warehouseId` (string, optional) - Filter by warehouse

**Response:**
```json
[
  {
    "id": "uuid",
    "warehouseId": "uuid",
    "warehouseName": "Main Warehouse",
    "name": "Aisle 1",
    "code": "A1",
    "description": "Description",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
]
```

#### POST `/locations`
**Request:**
```json
{
  "warehouseId": "uuid",
  "name": "Location Name",
  "code": "LOC-001",
  "description": "Optional description"
}
```

#### PATCH `/locations/:id`
**Request:** Partial location object

#### DELETE `/locations/:id`
**Response:** `204 No Content`

---

### Category Endpoints

#### GET `/categories`
**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Electronics"
  }
]
```

---

### Ledger Endpoints

#### GET `/ledger`
**Query Parameters:**
- `documentType` (RECEIPT | DELIVERY | TRANSFER | ADJUSTMENT, optional)
- `status` (DRAFT | WAITING | READY | DONE | CANCELED, optional)
- `warehouseId` (string, optional)
- `locationId` (string, optional)
- `productId` (string, optional)
- `category` (string, optional)
- `dateFrom` (ISO date string, optional)
- `dateTo` (ISO date string, optional)
- `movementType` (IN | OUT | TRANSFER, optional)

**Response:**
```json
[
  {
    "id": "uuid",
    "documentType": "RECEIPT",
    "documentId": "uuid",
    "documentNumber": "REC-001",
    "productId": "uuid",
    "productName": "Laptop Computer",
    "productSku": "LAP-001",
    "warehouseId": "uuid",
    "warehouseName": "Main Warehouse",
    "locationId": "uuid",
    "locationName": "Aisle 1",
    "quantity": 10,
    "quantityBefore": 20,
    "quantityAfter": 30,
    "movementType": "IN",
    "status": "DONE",
    "createdAt": "2024-01-01T00:00:00Z",
    "createdBy": "uuid"
  }
]
```

---

## 🔐 Authentication & Authorization

### JWT Token Structure

**Access Token Payload:**
```json
{
  "userId": "uuid",
  "email": "manager@stockmaster.com",
  "role": "MANAGER",
  "iat": 1234567890,
  "exp": 1234571490
}
```

**Refresh Token:** Long-lived token (7-30 days)

### Role-Based Permissions

#### Manager Permissions
- ✅ All CRUD operations on all entities
- ✅ Can delete products, operations, warehouses, locations
- ✅ Can access Settings pages
- ✅ Can cancel operations
- ✅ Can manage users (if user management is implemented)

#### Staff Permissions
- ✅ Create and edit products
- ✅ Create and edit operations
- ✅ Validate and complete operations
- ❌ Cannot delete products, operations, warehouses, locations
- ❌ Cannot access Settings pages
- ❌ Cannot cancel operations

### Authorization Middleware

```typescript
// Example middleware
function requirePermission(permission: Permission) {
  return (req, res, next) => {
    const user = req.user; // From JWT
    if (!hasPermission(user, permission)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    next();
  };
}

// Usage
router.delete('/products/:id', 
  authenticate, 
  requirePermission('products.delete'),
  deleteProduct
);
```

---

## 📊 Business Logic

### Operation Status Workflow

1. **DRAFT** → Created, can be edited
2. **READY** → Validated, ready for execution
3. **DONE** → Completed, stock updated
4. **CANCELED** → Cancelled (only managers)

**Status Transitions:**
- DRAFT → READY (Validate action)
- READY → DONE (Complete action)
- Any → CANCELED (Cancel action, managers only)

### Stock Management

#### When Operation Status Changes to DONE:

1. **RECEIPT:**
   - Increase stock in destination warehouse
   - Create MoveLog entries with movementType = IN

2. **DELIVERY:**
   - Decrease stock from source warehouse
   - Create MoveLog entries with movementType = OUT
   - Check if sufficient stock exists

3. **TRANSFER:**
   - Decrease stock from source warehouse
   - Increase stock in destination warehouse
   - Create MoveLog entries with movementType = TRANSFER

4. **ADJUSTMENT:**
   - Update stock to specified quantity
   - Create MoveLog entries with movementType = IN or OUT

#### Stock Level Calculation

```typescript
// Calculate current stock for a product in a warehouse
function getStockLevel(productId: string, warehouseId: string): number {
  const stockLevel = StockLevel.findUnique({
    where: { productId_warehouseId: { productId, warehouseId } }
  });
  return stockLevel?.quantity || 0;
}

// Calculate available stock (excluding reserved)
function getAvailableStock(productId: string, warehouseId: string): number {
  const stockLevel = StockLevel.findUnique({
    where: { productId_warehouseId: { productId, warehouseId } }
  });
  return (stockLevel?.quantity || 0) - (stockLevel?.reserved || 0);
}
```

### Document Number Generation

```typescript
// Generate unique document numbers
function generateDocumentNumber(type: DocumentType): string {
  const prefix = {
    RECEIPT: 'REC',
    DELIVERY: 'DEL',
    TRANSFER: 'TRF',
    ADJUSTMENT: 'ADJ'
  }[type];

  const count = await Operation.count({
    where: { documentType: type }
  });

  return `${prefix}-${String(count + 1).padStart(6, '0')}`;
}
```

---

## 🛠️ Technology Stack Recommendations

### Backend Framework
- **Node.js** with **Express** or **NestJS**
- **TypeScript** for type safety
- **Prisma** as ORM
- **PostgreSQL** as database

### Authentication
- **JWT** (jsonwebtoken) for access tokens
- **bcrypt** for password hashing
- **express-jwt** or **passport-jwt** for middleware

### Validation
- **Zod** or **Joi** for request validation
- **class-validator** (if using NestJS)

### Additional Libraries
- **date-fns** for date manipulation
- **uuid** for generating IDs
- **dotenv** for environment variables

### Project Structure

```
backend/
├── src/
│   ├── controllers/     # Route handlers
│   ├── services/         # Business logic
│   ├── models/          # Prisma models (generated)
│   ├── middleware/      # Auth, validation, etc.
│   ├── utils/           # Helper functions
│   ├── types/           # TypeScript types
│   └── app.ts           # Express app setup
├── prisma/
│   └── schema.prisma    # Database schema
├── .env                 # Environment variables
└── package.json
```

---

## 🔄 API Integration Notes

### Request Headers
All authenticated requests require:
```
Authorization: Bearer <access-token>
Content-Type: application/json
```

### Error Responses

**400 Bad Request:**
```json
{
  "message": "Validation error",
  "errors": {
    "field": "Error message"
  }
}
```

**401 Unauthorized:**
```json
{
  "message": "Invalid or expired token"
}
```

**403 Forbidden:**
```json
{
  "message": "Insufficient permissions"
}
```

**404 Not Found:**
```json
{
  "message": "Resource not found"
}
```

**500 Internal Server Error:**
```json
{
  "message": "Internal server error"
}
```

---

## 📝 Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/stockmaster"

# JWT
JWT_SECRET="your-secret-key"
JWT_REFRESH_SECRET="your-refresh-secret-key"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# Server
PORT=5000
NODE_ENV=development

# CORS
CORS_ORIGIN="http://localhost:3000"
```

---

## 🧪 Testing Recommendations

1. **Unit Tests:** Test business logic functions
2. **Integration Tests:** Test API endpoints
3. **E2E Tests:** Test complete workflows
4. **Load Tests:** Test performance under load

---

## 📚 Additional Notes

1. **Audit Trail:** All operations should log who created/validated them
2. **Soft Deletes:** Consider soft deletes for important entities
3. **Pagination:** Implement pagination for list endpoints
4. **Search:** Implement full-text search for products
5. **Caching:** Consider Redis for frequently accessed data
6. **File Uploads:** If needed, implement file storage for product images
7. **Notifications:** Consider implementing real-time notifications (WebSocket)
8. **Reports:** Generate reports on-demand or schedule them

---

## 🚀 Getting Started

1. Set up PostgreSQL database
2. Run Prisma migrations: `npx prisma migrate dev`
3. Seed initial data (categories, admin user, etc.)
4. Start the server
5. Test endpoints with Postman or similar tool

---

This documentation provides all the details needed to build a complete backend API that matches the frontend implementation.

