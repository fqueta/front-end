import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { UserPrefsProvider } from "./contexts/UserPrefsContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { AppLayout } from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import ClientView from "./pages/ClientView";
import ServiceObjects from "./pages/ServiceObjects";
import Aircraft from "./pages/Aircraft";
import AircraftView from "./pages/AircraftView";
import Products from "./pages/Products";
import ProductView from "./pages/ProductView";
import Services from "./pages/Services";
import ServiceView from "./pages/ServiceView";
import Categories from "./pages/Categories";
import Permissions from "./pages/settings/Permissions";
import Users from "./pages/settings/Users";
import Login from "./pages/auth/Login";
import Metrics from "./pages/settings/Metrics";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import NotFound from "./pages/NotFound";
import { PermissionGuard } from "./components/auth/PermissionGuard";
import Dashboard2 from "./pages/Dashboard2";

console.log('App.tsx: Starting app initialization');
console.log('QueryClient available:', QueryClient);
console.log('QueryClientProvider available:', QueryClientProvider);

const queryClient = new QueryClient();
console.log('QueryClient instance created:', queryClient);

const App = () => {
  console.log('App component rendering');
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <UserPrefsProvider>
          <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Rotas públicas */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              
              {/* Rotas protegidas */}
              <Route path="/" element={
                <ProtectedRoute>
                  <AppLayout>
                    <Dashboard />
                  </AppLayout>
                </ProtectedRoute>
              } />
              <Route path="/painel2" element={
                <ProtectedRoute>
                  <AppLayout>
                    <Dashboard2 />
                  </AppLayout>
                </ProtectedRoute>
              } />
              <Route path="/clients" element={
                <ProtectedRoute>
                  <AppLayout>
                    <Clients />
                  </AppLayout>
                </ProtectedRoute>
              } />
              <Route path="/clients/:id" element={
                <ProtectedRoute>
                  <AppLayout>
                    <ClientView />
                  </AppLayout>
                </ProtectedRoute>
              } />
              <Route path="/service-objects" element={
                <ProtectedRoute>
                  <AppLayout>
                    <ServiceObjects />
                  </AppLayout>
                </ProtectedRoute>
              } />
              <Route path="/aircraft" element={
                <ProtectedRoute>
                  <AppLayout>
                    <Aircraft />
                  </AppLayout>
                </ProtectedRoute>
              } />
              <Route path="/aircraft/:id" element={
                <ProtectedRoute>
                  <AppLayout>
                    <AircraftView />
                  </AppLayout>
                </ProtectedRoute>
              } />
              <Route path="/products" element={
                <ProtectedRoute>
                  <AppLayout>
                    <Products />
                  </AppLayout>
                </ProtectedRoute>
              } />
              <Route path="/products/:id" element={
                <ProtectedRoute>
                  <AppLayout>
                    <ProductView />
                  </AppLayout>
                </ProtectedRoute>
              } />
              <Route path="/services" element={
                <ProtectedRoute>
                  <AppLayout>
                    <Services />
                  </AppLayout>
                </ProtectedRoute>
              } />
              <Route path="/services/:id" element={
                <ProtectedRoute>
                  <AppLayout>
                    <ServiceView />
                  </AppLayout>
                </ProtectedRoute>
              } />
              <Route path="/categories" element={
                <ProtectedRoute>
                  <AppLayout>
                    <Categories />
                  </AppLayout>
                </ProtectedRoute>
              } />
              <Route path="/settings/permissions" element={
                <ProtectedRoute>
                  <AppLayout>
                    <PermissionGuard 
                      required="settings.permissions.view" 
                      menuPath="/settings/permissions"
                      requireRemote={false}
                    >
                      <Permissions />
                    </PermissionGuard>
                  </AppLayout>
                </ProtectedRoute>
              } />
              <Route path="/settings/users" element={
                <ProtectedRoute>
                  <AppLayout>
                    <PermissionGuard 
                      menuPath="/settings/users"
                      requireRemote={false}
                    >
                      <Users />
                    </PermissionGuard>
                  </AppLayout>
                </ProtectedRoute>
              } />
              <Route path="/settings/metrics" element={
              <ProtectedRoute>
                <AppLayout>
                  <PermissionGuard required="settings.metrics.view">
                    <Metrics />
                  </PermissionGuard>
                </AppLayout>
              </ProtectedRoute>
            } />
              
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
          </TooltipProvider>
        </UserPrefsProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
