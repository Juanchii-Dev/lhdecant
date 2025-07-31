import React from "react";
import { Route, Switch } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./hooks/use-auth";
import { ToastProvider } from "./components/ui/toast";
import { TooltipProvider } from "./components/ui/tooltip";
import Navigation from "./components/navigation";
import { Toaster } from "./components/ui/toaster";
import Home from "./pages/home";
import CatalogPage from "./pages/catalog-page";
import AuthPage from "./pages/auth-page";
import AdminAuthPage from "./pages/admin-auth-page";
import AdminPage from "./pages/admin-page";
import AdminGuard from "./components/admin-guard";
import NotFound from "./pages/not-found";
import ProfilePage from "./pages/profile-page";
import FavoritesPage from "./pages/favorites-page";
import OrdersPage from "./pages/orders-page";
import TrackingPage from "./pages/tracking-page";
import PaymentMethodsPage from "./pages/payment-methods-page";
import AddressesPage from "./pages/addresses-page";
import SettingsPage from "./pages/settings-page";
import CouponsPage from "./pages/coupons-page";
import ReviewsPage from "./pages/reviews-page";
import NotificationsPage from "./pages/notifications-page";
import CollectionsPage from "./pages/collections-page";
import CheckoutPage from "./pages/checkout-page";
import SuccessPage from "./pages/success-page";
import { useAuthRefresh } from "./hooks/use-auth-refresh";

// Componente para verificación global de autenticación
function GlobalAuthCheck() {
  const { user } = useAuthRefresh();
  
  React.useEffect(() => {
    // Solo loggear si hay cambios importantes
    if (user) {
      console.log('✅ Usuario autenticado:', user.email);
    }
  }, [user]);
  
  return null; // No renderiza nada
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <TooltipProvider>
          <AuthProvider>
              <GlobalAuthCheck />
              <Navigation />
              <Switch>
                <Route path="/" component={Home} />
                <Route path="/catalogo" component={CatalogPage} />
                <Route path="/auth" component={AuthPage} />
                <Route path="/admin-auth" component={AdminAuthPage} />
                <Route path="/admin" component={() => (
                  <AdminGuard>
                    <AdminPage />
                  </AdminGuard>
                )} />
                <Route path="/profile" component={ProfilePage} />
                <Route path="/favorites" component={FavoritesPage} />
                <Route path="/orders" component={OrdersPage} />
                <Route path="/tracking" component={TrackingPage} />
                <Route path="/payment-methods" component={PaymentMethodsPage} />
                <Route path="/addresses" component={AddressesPage} />
                <Route path="/coupons" component={CouponsPage} />
                <Route path="/reviews" component={ReviewsPage} />
                <Route path="/notifications" component={NotificationsPage} />
                <Route path="/settings" component={SettingsPage} />
                <Route path="/colecciones" component={CollectionsPage} />
                <Route path="/checkout" component={CheckoutPage} />
                <Route path="/success" component={SuccessPage} />
                <Route component={NotFound} />
              </Switch>
              <Toaster />
          </AuthProvider>
        </TooltipProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
}
