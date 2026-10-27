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
              </Route>

              {/* Normal users */}
              <Route element={<ProtectedRoute roles={['user']} />}>
                <Route path="catalog" element={<ComingSoon title="Browse Equipment" />} />
                <Route path="my-rentals" element={<ComingSoon title="My Rentals" />} />
              </Route>

              {/* Admins */}
              <Route path="admin" element={<ProtectedRoute roles={['admin']} />}>
                <Route index element={<ComingSoon title="Admin Dashboard" />} />
                <Route path="operations" element={<ComingSoon title="Operations" />} />
                <Route path="users" element={<ComingSoon title="User Management" />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
