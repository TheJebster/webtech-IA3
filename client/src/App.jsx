import { lazy } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { CartProvider } from './context/CartContext';
import Layout from './components/Layout';
import ProtectedRoute, { GuestRoute } from './components/ProtectedRoute';

// Route pages are code-split: each one loads on first visit
const Landing = lazy(() => import('./pages/Landing'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const ChangePassword = lazy(() => import('./pages/ChangePassword'));
const NotFound = lazy(() => import('./pages/NotFound'));
const EquipmentDetails = lazy(() => import('./pages/EquipmentDetails'));
const Catalog = lazy(() => import('./pages/user/Catalog'));
const MyRentals = lazy(() => import('./pages/user/MyRentals'));
const RentalRequest = lazy(() => import('./pages/user/RentalRequest'));
const AdminHome = lazy(() => import('./pages/admin/AdminHome'));
const Operations = lazy(() => import('./pages/admin/Operations'));
const Users = lazy(() => import('./pages/admin/Users'));
const Credits = lazy(() => import('./pages/Credits'));

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <Routes>
              <Route element={<Layout />}>
                <Route index element={<Landing />} />
                {/* Public storefront: anyone can browse */}
                <Route path="catalog" element={<Catalog />} />
                <Route path="equipment/:id" element={<EquipmentDetails />} />
                <Route path="credits" element={<Credits />} />

                {/* Guests only */}
                <Route element={<GuestRoute />}>
                  <Route path="login" element={<Login />} />
                  <Route path="signup" element={<Signup />} />
                </Route>

                {/* Any logged-in user */}
                <Route element={<ProtectedRoute />}>
                  <Route path="account/password" element={<ChangePassword />} />
                </Route>

                {/* Normal users */}
                <Route element={<ProtectedRoute roles={['user']} />}>
                  <Route path="rental-request" element={<RentalRequest />} />
                  <Route path="my-rentals" element={<MyRentals />} />
                </Route>

                {/* Admins */}
                <Route path="admin" element={<ProtectedRoute roles={['admin']} />}>
                  <Route index element={<AdminHome />} />
                  <Route path="operations" element={<Operations />} />
                  <Route path="users" element={<Users />} />
                </Route>

                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
