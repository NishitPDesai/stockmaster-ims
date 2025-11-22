# User Accounts - StockMaster IMS

## Available User Accounts (Mock Mode)

### Manager Accounts (Full Access)

#### Manager 1
- **Email:** `manager@stockmaster.com`
- **Password:** `password`
- **Role:** `manager`
- **Name:** Manager User

#### Manager 2
- **Email:** `manager2@stockmaster.com`
- **Password:** `password`
- **Role:** `manager`
- **Name:** Senior Manager

#### Manager 3
- **Email:** `manager3@stockmaster.com`
- **Password:** `password`
- **Role:** `manager`
- **Name:** Operations Manager

**Manager Access:**
- All pages accessible
- Can create, edit, delete all entities
- Full warehouse and location management
- All operations (Receipts, Deliveries, Transfers, Adjustments)
- System settings access
- Can cancel operations

### Staff Accounts (Limited Access)

#### Staff 1
- **Email:** `staff@stockmaster.com`
- **Password:** `staff123`
- **Role:** `staff`
- **Name:** Staff User

#### Staff 2
- **Email:** `staff2@stockmaster.com`
- **Password:** `staff123`
- **Role:** `staff`
- **Name:** Warehouse Staff

#### Staff 3
- **Email:** `staff3@stockmaster.com`
- **Password:** `staff123`
- **Role:** `staff`
- **Name:** Inventory Staff

**Staff Access:**
- View products and operations
- Create and edit products
- Create and edit operations (Receipts, Deliveries, Transfers, Adjustments)
- Validate and complete operations
- Cannot delete products, operations, warehouses, or locations
- Cannot access Settings pages
- Cannot cancel operations

## Testing Both Users

1. **Login as Manager:**
   - Use `manager@stockmaster.com` / `password`
   - Test full functionality

2. **Logout and Login as Staff:**
   - Click user menu → Logout
   - Login with `staff@stockmaster.com` / `staff123`
   - Test staff-level access

## Role-Based Access Control (Future)

The system is ready for role-based access control:
- User role is stored in Redux state: `state.auth.user.role`
- Can be used to conditionally show/hide features
- Can be used to restrict API calls on backend
- Roles: `manager` (full access) and `staff` (limited access)

## Adding More Users

Edit `frontend/src/mocks/auth.ts` to add more users:
```typescript
const mockUsers: Record<string, User> = {
  manager: { ... },
  staff: { ... },
  // Add more users here
}
```
