
import { Navigate, Route, Routes } from 'react-router-dom';

import { ProtectedRoute } from './auth/ProtectedRoute';
import AdminRoute from './auth/AdminRoute';

import LoginPage from './pages/LoginPage';

import CustomerListPage from './pages/customers/CustomerListPage';
import CreateCustomerPage from './pages/customers/CreateCustomerPage';
import CustomerProfilePage from './pages/customers/CustomerProfilePage';
import EditCustomerPage from './pages/customers/EditCustomerPage';

import UserManagementPage from './pages/users/UserManagementPage';
import RegisterUserPage from './pages/users/RegisterUserPage';

export default function App() {
  return (
    <Routes>
      {/* Authentication */}
      <Route
        path="/login"
        element={<LoginPage />}
      />

      {/* Admin - User Management */}
      <Route
        path="/users"
        element={
          <ProtectedRoute>
            <AdminRoute>
              <UserManagementPage />
            </AdminRoute>
          </ProtectedRoute>
        }
      />

      {/* Admin - Register User */}
      <Route
        path="/users/new"
        element={
          <ProtectedRoute>
            <AdminRoute>
              <RegisterUserPage />
            </AdminRoute>
          </ProtectedRoute>
        }
      />

      {/* Customer List */}
      <Route
        path="/customers"
        element={
          <ProtectedRoute>
            <CustomerListPage />
          </ProtectedRoute>
        }
      />

      {/* Create Customer */}
      <Route
        path="/customers/new"
        element={
          <ProtectedRoute>
            <CreateCustomerPage />
          </ProtectedRoute>
        }
      />

      {/* Edit Customer */}
      <Route
        path="/customers/:id/edit"
        element={
          <ProtectedRoute>
            <EditCustomerPage />
          </ProtectedRoute>
        }
      />

      {/* Customer Profile */}
      <Route
        path="/customers/:id"
        element={
          <ProtectedRoute>
            <CustomerProfilePage />
          </ProtectedRoute>
        }
      />

      {/* Default Route */}
      <Route
        path="/"
        element={
          <Navigate
            to="/customers"
            replace
          />
        }
      />

      {/* Unknown Routes */}
      <Route
        path="*"
        element={
          <Navigate
            to="/customers"
            replace
          />
        }
      />
    </Routes>
  );
}
