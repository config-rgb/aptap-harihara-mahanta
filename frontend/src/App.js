import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import { Toaster } from "@/components/ui/sonner";
import HomePage from "@/pages/HomePage";
import MenuPage from "@/pages/MenuPage";
import CartPage from "@/pages/CartPage";
import OrderConfirmationPage from "@/pages/OrderConfirmationPage";
import AdminLoginPage from "@/pages/AdminLoginPage";
import AdminDashboardPage from "@/pages/AdminDashboardPage";
import AdminMenuPage from "@/pages/AdminMenuPage";
import AdminQRCodesPage from "@/pages/AdminQRCodesPage";

function App() {
    return (
        <BrowserRouter>
            <CartProvider>
                <Toaster position="top-right" theme="dark" richColors />
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/menu" element={<MenuPage />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/order-confirmation/:orderId" element={<OrderConfirmationPage />} />
                    <Route path="/admin/login" element={<AdminLoginPage />} />
                    <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
                    <Route path="/admin/menu" element={<AdminMenuPage />} />
                    <Route path="/admin/qr-codes" element={<AdminQRCodesPage />} />
                </Routes>
            </CartProvider>
        </BrowserRouter>
    );
}

export default App;
