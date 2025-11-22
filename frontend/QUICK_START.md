# Quick Start Guide - StockMaster IMS

## ✅ Setup Complete!

The development server is running at: **http://localhost:3000/**

## 🔐 Login Credentials (Mock Mode)

### Manager Accounts (Full Access)
- **Manager 1:** `manager@stockmaster.com` / `password`
- **Manager 2:** `manager2@stockmaster.com` / `password`
- **Manager 3:** `manager3@stockmaster.com` / `password`

### Staff Accounts (Limited Access)
- **Staff 1:** `staff@stockmaster.com` / `staff123`
- **Staff 2:** `staff2@stockmaster.com` / `staff123`
- **Staff 3:** `staff3@stockmaster.com` / `staff123`

**Note:** All managers have the same password (`password`) and all staff have the same password (`staff123`). In production, each user would have a unique password.

## 📋 What's Available (Static/Mock Data)

### Pages You Can Test:

1. **Login Page** (`/login`)
   - Email/password authentication
   - Forgot password link (placeholder)

2. **Dashboard** (`/dashboard`)
   - KPI Cards showing:
     - Total Products
     - Low Stock Items
     - Pending Receipts
     - Pending Deliveries
     - Scheduled Transfers

3. **Products** (`/products`)
   - Product list with search and category filter
   - Create/Edit product modal
   - Sample products: Laptop, Office Chair, Printer Paper

4. **Operations:**
   - **Receipts** (`/operations/receipts`) - Incoming stock
   - **Deliveries** (`/operations/deliveries`) - Outgoing stock
   - **Transfers** (`/operations/transfers`) - Internal transfers
   - **Adjustments** (`/operations/adjustments`) - Stock adjustments

5. **Ledger** (`/ledger`)
   - Complete movement history
   - Filters: Document Type, Status, Warehouse, Date Range

6. **Settings:**
   - **Warehouses** (`/settings/warehouses`) - CRUD operations
   - **Locations** (`/settings/locations`) - CRUD operations

7. **Profile** (`/profile`)
   - User information display

## 🎨 Features to Check:

- ✅ Responsive design (try resizing browser)
- ✅ Mobile sidebar (hamburger menu on small screens)
- ✅ Filter bars on operations pages
- ✅ Status badges (Draft, Waiting, Ready, Done, Canceled)
- ✅ Data tables with sorting
- ✅ Form modals for create/edit
- ✅ Navigation sidebar
- ✅ User dropdown menu in topbar

## 📊 Mock Data Includes:

- 3 Sample Products
- 5 Product Categories
- 2 Warehouses
- 2 Locations
- 3 Sample Operations (Receipt, Delivery, Transfer)
- Movement ledger entries

## 🔄 Current Mode:

**Mock Mode Enabled** - All data is stored in memory and resets on page refresh.

To switch to real API mode, update `.env`:
```
VITE_USE_MOCK=false
VITE_API_BASE_URL=http://localhost:5000/api
```

## 🚀 Next Steps:

1. Open http://localhost:3000/ in your browser
2. Login with the credentials above
3. Navigate through all pages
4. Test create/edit forms
5. Check filters and search functionality
6. Test responsive design on mobile/tablet sizes

## 🐛 If You See Issues:

- Check browser console for errors
- Verify all dependencies are installed: `npm install` in frontend folder
- Make sure dev server is running: `npm run dev` in frontend folder

---

**Everything is ready to test!** 🎉

