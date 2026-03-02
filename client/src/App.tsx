import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminLayout from '@/components/admin/AdminLayout';
import LoginPage from '@/pages/LoginPage';
import DashboardPage from '@/pages/admin/DashboardPage';
import SchedulePage from '@/pages/admin/SchedulePage';
import RoomsPage from '@/pages/admin/RoomsPage';
import CoursesPage from '@/pages/admin/CoursesPage';
import LecturersPage from '@/pages/admin/LecturersPage';
import BatchesPage from '@/pages/admin/BatchesPage';
import SettingsPage from '@/pages/admin/SettingsPage';
import DisplayPage from '@/pages/display/DisplayPage';

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/display" element={<DisplayPage />} />
            <Route path="/display/:buildingCode" element={<DisplayPage />} />

            {/* Protected admin routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardPage />} />
              <Route path="schedule" element={<SchedulePage />} />
              <Route path="rooms" element={<RoomsPage />} />
              <Route path="courses" element={<CoursesPage />} />
              <Route path="lecturers" element={<LecturersPage />} />
              <Route path="batches" element={<BatchesPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>

            {/* Redirect root to display */}
            <Route path="/" element={<Navigate to="/display" replace />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
