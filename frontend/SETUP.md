# Setup Instructions

## Quick Start

1. **Install Dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Create Environment File**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and set:
   - `VITE_USE_MOCK=true` for development with mock data
   - `VITE_API_BASE_URL=http://localhost:5000/api` for backend connection

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Access Application**
   - Open http://localhost:3000
   - Login with any user:
     - **Managers:** `manager@stockmaster.com`, `manager2@stockmaster.com`, `manager3@stockmaster.com` / `password`
     - **Staff:** `staff@stockmaster.com`, `staff2@stockmaster.com`, `staff3@stockmaster.com` / `staff123`

## Project Structure

All files have been created in the `frontend/` directory:

- ✅ Configuration files (package.json, vite.config.ts, tsconfig.json, tailwind.config.cjs)
- ✅ TypeScript types and interfaces
- ✅ Redux store with all slices
- ✅ API client with JWT interceptor
- ✅ All UI components (Sidebar, Topbar, FilterBar, DataTable, etc.)
- ✅ All pages (Login, Dashboard, Products, Operations, Ledger, Settings)
- ✅ Form components with validation
- ✅ Mock API implementations
- ✅ Backend integration JSON specification
- ✅ README with documentation

## Next Steps

1. Run `npm install` to install all dependencies
2. The linter errors you see are expected until dependencies are installed
3. After installation, run `npm run dev` to start the development server
4. The app will work in mock mode by default (VITE_USE_MOCK=true)

## Notes

- All components are fully typed with TypeScript
- Responsive design with mobile-first approach
- Accessible with ARIA labels and keyboard navigation
- Ready for backend integration (see backend-integration.json)

