# Debugging Guide

## If Pages Are Still Crashing:

### 1. Check Browser Console
Open browser DevTools (F12) and check the Console tab for errors.

### 2. Common Issues:

**Issue: "Cannot read property of undefined"**
- ✅ Fixed: Added safety checks with `|| []` and `|| {}`
- ✅ Fixed: DataTable now handles undefined data

**Issue: "Network Error" or "Connection Refused"**
- ✅ Fixed: Mock mode is enabled in .env
- ⚠️ **Action Required**: Restart dev server if you just created .env

**Issue: Redux state not loading**
- Check if `USE_MOCK` is being read correctly
- Check browser console for Redux errors

### 3. Restart Dev Server:

```bash
# Stop current server (Ctrl+C)
cd frontend
npm run dev
```

### 4. Clear Browser Cache:
- Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
- Or clear browser cache completely

### 5. Check Environment Variables:

The .env file should contain:
```
VITE_USE_MOCK=true
VITE_API_BASE_URL=http://localhost:5000/api
```

### 6. Verify Mock Data:

Mock data files should exist in:
- `src/mocks/products.ts`
- `src/mocks/operations.ts`
- `src/mocks/categories.ts`
- `src/mocks/warehouses.ts`
- `src/mocks/auth.ts`

### 7. Check Redux DevTools:

Install Redux DevTools browser extension to see state:
- Check if data is loading in Redux store
- Check for any rejected actions

---

**If still crashing, please share:**
1. Browser console error message
2. Which page is crashing
3. Any Redux errors

