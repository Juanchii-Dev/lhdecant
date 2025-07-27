import { Route, Switch } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastProvider } from "./components/ui/toast";
import { TooltipProvider } from "./components/ui/tooltip";
import { AuthProvider } from "./hooks/use-auth";
import { CartProvider } from "./hooks/use-cart";
import { Toaster } from "./components/ui/toaster";
import Navigation from "./components/navigation";
import Home from "./pages/home";
import CatalogPage from "./pages/catalog-page";
import AuthPage from "./pages/auth-page";
import AdminPage from "./pages/admin-page";
import NotFound from "./pages/not-found";
import ProfilePage from "./pages/profile-page";
import FavoritesPage from "./pages/favorites-page";
import OrdersPage from "./pages/orders-page";
import TrackingPage from "./pages/tracking-page";
import PaymentMethodsPage from "./pages/payment-methods-page";
import AddressesPage from "./pages/addresses-page";
import SettingsPage from "./pages/settings-page";

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
            <CartProvider>
              <Navigation />
              <Switch>
                <Route path="/" component={Home} />
                <Route path="/catalogo" component={CatalogPage} />
                <Route path="/auth" component={AuthPage} />
                <Route path="/admin" component={AdminPage} />
                <Route path="/profile" component={ProfilePage} />
                <Route path="/favorites" component={FavoritesPage} />
                <Route path="/orders" component={OrdersPage} />
                <Route path="/tracking" component={TrackingPage} />
                <Route path="/payment-methods" component={PaymentMethodsPage} />
                <Route path="/addresses" component={AddressesPage} />
                <Route path="/coupons" component={() => <div className="min-h-screen bg-black text-white pt-24 flex items-center justify-center"><h1 className="text-2xl text-luxury-gold">Códigos de Descuento - Próximamente</h1></div>} />
                <Route path="/reviews" component={() => <div className="min-h-screen bg-black text-white pt-24 flex items-center justify-center"><h1 className="text-2xl text-luxury-gold">Reseñas - Próximamente</h1></div>} />
                <Route path="/notifications" component={() => <div className="min-h-screen bg-black text-white pt-24 flex items-center justify-center"><h1 className="text-2xl text-luxury-gold">Notificaciones - Próximamente</h1></div>} />
                <Route path="/settings" component={SettingsPage} />
                <Route component={NotFound} />
              </Switch>
              <Toaster />
            </CartProvider>
          </AuthProvider>
        </TooltipProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
}
