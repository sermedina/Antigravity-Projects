import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/routing/ProtectedRoute';

// Layouts
import AdminLayout from './components/layout/AdminLayout';
import AuthLayout from './components/layout/AuthLayout';

// Features / Pages
import LoginPage from './features/auth/pages/LoginPage';
import DashboardPage from './features/dashboard/pages/DashboardPage';
import ContentDashboardPage from './features/dashboard/pages/ContentDashboardPage';
import UserDirectoryPage from './features/users/pages/UserDirectoryPage';
import UserDetailPage from './features/users/pages/UserDetailPage';
import SharedAccessPage from './features/users/pages/SharedAccessPage';
import CategoriesPage from './features/categories/pages/CategoriesPage';
import TransactionsAuditPage from './features/transactions/pages/TransactionsAuditPage';
import ContentLibraryPage from './features/learning/pages/ContentLibraryPage';
import ContentFormPage from './features/learning/pages/ContentFormPage';
import UserProgressPage from './features/learning/pages/UserProgressPage';
import RemindersPage from './features/reminders/pages/RemindersPage';
import SettingsPage from './features/settings/pages/SettingsPage';
import ProfilePage from './features/settings/pages/ProfilePage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Premium Dark Theme HSL tailored
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#6366f1', // Indigo
      light: '#818cf8',
      dark: '#4f46e5',
    },
    secondary: {
      main: '#8b5cf6', // Violet
      light: '#a78bfa',
      dark: '#7c3aed',
    },
    background: {
      default: '#0f172a', // Slate 900
      paper: '#1e293b',   // Slate 800
    },
    text: {
      primary: '#f8fafc',
      secondary: '#94a3b8',
    },
  },
  typography: {
    fontFamily: '"Outfit", "Inter", "Roboto", sans-serif',
    h4: {
      fontWeight: 800,
    },
    h5: {
      fontWeight: 800,
    },
    h6: {
      fontWeight: 700,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route
                path="/login"
                element={
                  <AuthLayout>
                    <LoginPage />
                  </AuthLayout>
                }
              />

              {/* Protected SYSTEM_ADMIN Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['SYSTEM_ADMIN']}>
                    <AdminLayout title="Dashboard Global">
                      <DashboardPage />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/users"
                element={
                  <ProtectedRoute allowedRoles={['SYSTEM_ADMIN']}>
                    <AdminLayout title="Directorio de Usuarios">
                      <UserDirectoryPage />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/users/:id"
                element={
                  <ProtectedRoute allowedRoles={['SYSTEM_ADMIN']}>
                    <AdminLayout title="Detalle del Usuario">
                      <UserDetailPage />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/shared-access"
                element={
                  <ProtectedRoute allowedRoles={['SYSTEM_ADMIN']}>
                    <AdminLayout title="Auditoría de Accesos Compartidos">
                      <SharedAccessPage />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/categories"
                element={
                  <ProtectedRoute allowedRoles={['SYSTEM_ADMIN']}>
                    <AdminLayout title="Categorías Globales">
                      <CategoriesPage />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/transactions"
                element={
                  <ProtectedRoute allowedRoles={['SYSTEM_ADMIN']}>
                    <AdminLayout title="Auditoría Transaccional">
                      <TransactionsAuditPage />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reminders"
                element={
                  <ProtectedRoute allowedRoles={['SYSTEM_ADMIN']}>
                    <AdminLayout title="Motor de Recordatorios">
                      <RemindersPage />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute allowedRoles={['SYSTEM_ADMIN']}>
                    <AdminLayout title="Configuración Global">
                      <SettingsPage />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />

              {/* Protected Shared SYSTEM_ADMIN / CONTENT_MANAGER Routes */}
              <Route
                path="/content-dashboard"
                element={
                  <ProtectedRoute allowedRoles={['SYSTEM_ADMIN', 'CONTENT_MANAGER']}>
                    <AdminLayout title="Dashboard de Contenidos">
                      <ContentDashboardPage />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/content"
                element={
                  <ProtectedRoute allowedRoles={['SYSTEM_ADMIN', 'CONTENT_MANAGER']}>
                    <AdminLayout title="Biblioteca CMS">
                      <ContentLibraryPage />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/content/new"
                element={
                  <ProtectedRoute allowedRoles={['SYSTEM_ADMIN', 'CONTENT_MANAGER']}>
                    <AdminLayout title="Nuevo Contenido Educativo">
                      <ContentFormPage />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/content/edit/:id"
                element={
                  <ProtectedRoute allowedRoles={['SYSTEM_ADMIN', 'CONTENT_MANAGER']}>
                    <AdminLayout title="Editar Contenido Educativo">
                      <ContentFormPage />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/user-progress"
                element={
                  <ProtectedRoute allowedRoles={['SYSTEM_ADMIN', 'CONTENT_MANAGER']}>
                    <AdminLayout title="Control de Aprendizaje">
                      <UserProgressPage />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute allowedRoles={['SYSTEM_ADMIN', 'CONTENT_MANAGER']}>
                    <AdminLayout title="Mi Perfil">
                      <ProfilePage />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />

              {/* Redirect to login or default dashboard */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
