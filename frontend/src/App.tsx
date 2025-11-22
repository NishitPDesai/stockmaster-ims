import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store/store";
import { Sidebar } from "./components/layout/Sidebar";
import { Topbar } from "./components/layout/Topbar";
import { ProtectedRoute } from "./components/routing/ProtectedRoute";
import { Login } from "./pages/Login";
import { Signup } from "./pages/Signup";
import { Dashboard } from "./pages/Dashboard";
import { Products } from "./pages/Products";
import { Receipts } from "./pages/operations/Receipts";
import { Deliveries } from "./pages/operations/Deliveries";
import { Transfers } from "./pages/operations/Transfers";
import { Adjustments } from "./pages/operations/Adjustments";
import { Ledger } from "./pages/Ledger";
import { Warehouses } from "./pages/settings/Warehouses";
import { Locations } from "./pages/settings/Locations";
import { Profile } from "./pages/Profile";
import { ErrorBoundary } from "./components/common/ErrorBoundary";
import { ToastContainer } from "./lib/toast";

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="lg:pl-64">
        <Topbar />
        <main className="min-h-screen">{children}</main>
      </div>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Navigate to="/dashboard" replace />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Dashboard />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/products"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Products />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/operations/receipts"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Receipts />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/operations/deliveries"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Deliveries />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/operations/transfers"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Transfers />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/operations/adjustments"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Adjustments />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/ledger"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Ledger />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings/warehouses"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Warehouses />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings/locations"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Locations />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Profile />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
          <ToastContainer />
        </BrowserRouter>
      </Provider>
    </ErrorBoundary>
  );
}

export default App;
