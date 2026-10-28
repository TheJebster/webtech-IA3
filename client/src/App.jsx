import { lazy } from 'react';
import PagePreloader from './components/PagePreloader';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { CartProvider } from './context/CartContext';
import Layout from './components/Layout';
import ProtectedRoute, { GuestRoute } from './components/ProtectedRoute';

// Route pages are code-split: each one loads on first visit, and PagePreloader fetches the rest
// in the background once the browser is idle, so later page changes never wait on the network
const load = {
  Landing: () => import('./pages/Landing'),
  Login: () => import('./pages/Login'),
  Signup: () => import('./pages/Signup'),
  ChangePassword: () => import('./pages/ChangePassword'),
  NotFound: () => import('./pages/NotFound'),
  EquipmentDetails: () => import('./pages/EquipmentDetails'),
  Catalog: () => import('./pages/user/Catalog'),
  MyRentals: () => import('./pages/user/MyRentals'),
  RentalRequest: () => import('./pages/user/RentalRequest'),
  AdminHome: () => import('./pages/admin/AdminHome'),
  Operations: () => import('./pages/admin/Operations'),
  Users: () => import('./pages/admin/Users'),
};
const Landing = lazy(load.Landing);
const Login = lazy(load.Login);
const Signup = lazy(load.Signup);
const ChangePassword = lazy(load.ChangePassword);
const NotFound = lazy(load.NotFound);
const EquipmentDetails = lazy(load.EquipmentDetails);
const Catalog = lazy(load.Catalog);
const MyRentals = lazy(load.MyRentals);
const RentalRequest = lazy(load.RentalRequest);
const AdminHome = lazy(load.AdminHome);
const Operations = lazy(load.Operations);
const Users = lazy(load.Users);

const STORE_PAGES = ['Catalog', 'EquipmentDetails', 'Landing', 'Login', 'Signup', 'RentalRequest', 'MyRentals', 'ChangePassword', 'NotFound'];
const ADMIN_PAGES = ['AdminHome', 'Operations', 'Users'];

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <PagePreloader loaders={load} storePages={STORE_PAGES} adminPages={ADMIN_PAGES} />
            <Routes>
              <Route element={<Layout />}>
                <Route index element={<Landing />} />
                {/* Public storefront: anyone can browse */}
                <Route path="catalog" element={<Catalog />} />
                <Route path="equipment/:id" element={<EquipmentDetails />} />

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
