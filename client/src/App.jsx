import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Layout from './components/Layout';
import ProtectedRoute, { GuestRoute } from './components/ProtectedRoute';
import ComingSoon from './components/ComingSoon';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ChangePassword from './pages/ChangePassword';
import NotFound from './pages/NotFound';
import EquipmentDetails from './pages/EquipmentDetails';
import Catalog from './pages/user/Catalog';
import Operations from './pages/admin/Operations';
import Users from './pages/admin/Users';

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<Landing />} />

              {/* Guests only */}
              <Route element={<GuestRoute />}>
                <Route path="login" element={<Login />} />
                <Route path="signup" element={<Signup />} />
              </Route>

              {/* Any logged-in user */}
              <Route element={<ProtectedRoute />}>
                <Route path="account/password" element={<ChangePassword />} />
                <Route path="equipment/:id" element={<EquipmentDetails />} />
              </Route>

              {/* Normal users */}
              <Route element={<ProtectedRoute roles={['user']} />}>
                <Route path="catalog" element={<Catalog />} />
                <Route path="my-rentals" element={<ComingSoon title="My Rentals" />} />
              </Route>

              {/* Admins */}
              <Route path="admin" element={<ProtectedRoute roles={['admin']} />}>
                <Route index element={<ComingSoon title="Admin Dashboard" />} />
                <Route path="operations" element={<Operations />} />
                <Route path="users" element={<Users />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
