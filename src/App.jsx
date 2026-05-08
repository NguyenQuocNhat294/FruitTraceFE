// src/App.jsx
import React from "react";
import { Routes, Route, Navigate, useParams } from "react-router-dom";

/* ── Redirect /batches/B001 → /trace?code=B001 ── */
const BatchRedirect = () => {
    const { id } = useParams();
    return <Navigate to={`/trace?code=${id}`} replace/>;
};

/* ===== Layouts ===== */
import AdminLayout from "./components/layout/AdminLayout";
import FarmLayout  from "./components/layout/FarmLayout";
import StaffLayout from "./components/layout/StaffLayout";

/* ===== Auth ===== */
import ProtectedRoute from "./components/auth/ProtectedRoute";
import LoginPage      from "./pages/LoginPage";
import RegisterPage   from "./pages/RegisterPage";

/* ===== Public ===== */
import LandingPage  from "./pages/LandingPage";
import TracePage    from "./pages/TracePage";
import ProductsPage from "./pages/ProductsPage";
import NotFoundPage from "./pages/NotFoundPage";

/* ===== Admin ===== */
import AdminDashboard    from "./pages/admin/AdminDashboard";
import AnalyticsPage     from "./pages/admin/AnalyticsPage";
import BatchesManagement from "./pages/admin/BatchesManagement";
import FarmsManagement   from "./pages/admin/FarmsManagement";
import BatchDetailPage   from "./pages/admin/BatchDetailPage";
import TraceLogsPage     from "./pages/admin/TraceLogsPage";
import InspectionsPage   from "./pages/admin/InspectionsPage";
import UsersManagement   from "./pages/admin/UsersManagement";
import SettingsPage      from "./pages/admin/SettingsPage";

/* ===== Farm ===== */
import FarmDashboard   from "./pages/farm/FarmDashboard";
import MyBatches       from "./pages/farm/MyBatches";
import CalendarPage    from "./pages/farm/CalendarPage";
import QRGenerator     from "./pages/farm/QRGenerator";
import GalleryPage     from "./pages/farm/GalleryPage";
import RevenuePage     from "./pages/farm/RevenuePage";
import StaffManagement from "./pages/farm/StaffManagement";
import CreateBatch from './pages/farm/CreateBatch';

/* ===== Staff ===== */
import StaffDashboard   from "./pages/staff/StaffDashboard";
import StaffBatchesPage from "./pages/staff/StaffBatchesPage";
import StaffTracePage   from "./pages/staff/StaffTracePage";
import StaffTasksPage   from "./pages/staff/StaffTasksPage";
import TimeTracking     from "./pages/staff/TimeTracking";
import ReportPage       from "./pages/staff/ReportPage";
import PhotoUpload      from "./pages/staff/PhotoUpload";

function App() {
    return (
        <div className="FRUITTRACE">
            <Routes>
                {/* ── Public ── */}
                <Route path="/"           element={<LandingPage />} />
                <Route path="/login"      element={<LoginPage />} />
                <Route path="/register"   element={<RegisterPage />} />
                <Route path="/trace"      element={<TracePage />} />
                <Route path="/products"   element={<ProductsPage />} />
                <Route path="/batches/:id" element={<BatchRedirect />} />

                {/* ── Admin ── */}
                <Route path="/admin" element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                        <AdminLayout />
                    </ProtectedRoute>
                }>
                    <Route index              element={<AdminDashboard />} />
                    <Route path="analytics"   element={<AnalyticsPage />} />
                    <Route path="users"       element={<UsersManagement />} />
                    <Route path="farms"       element={<FarmsManagement />} />
                    <Route path="batches"     element={<BatchesManagement />} />
                    <Route path="batches/:id" element={<BatchDetailPage />} />
                    <Route path="trace-logs"  element={<TraceLogsPage />} />
                    <Route path="inspections" element={<InspectionsPage />} />
                    <Route path="settings"    element={<SettingsPage />} />
                </Route>

                {/* ── Farm ── */}
                <Route path="/farm" element={
                    <ProtectedRoute allowedRoles={["admin","farm","farmer"]}>
                        <FarmLayout />
                    </ProtectedRoute>

                }>
                    <Route index                  element={<FarmDashboard />} />
                    <Route path="mybatches"        element={<MyBatches />} />
                    <Route path="calendar"         element={<CalendarPage />} />
                    <Route path="qr"               element={<QRGenerator />} />
                    <Route path="gallery"          element={<GalleryPage />} />
                    <Route path="revenue"          element={<RevenuePage />} />
                    <Route path="staff-management" element={<StaffManagement />} />
                    <Route path="/farm/mybatches/create" element={<CreateBatch/>}/>
                </Route>

                {/* ── Staff ── */}
                <Route path="/staff" element={
                    <ProtectedRoute allowedRoles={["admin","staff","customer"]}>
                        <StaffLayout />
                    </ProtectedRoute>
                }>
                    <Route index               element={<StaffDashboard />} />
                    <Route path="batches"       element={<StaffBatchesPage />} />
                    <Route path="trace"         element={<StaffTracePage />} />
                    <Route path="tasks"         element={<StaffTasksPage />} />
                    <Route path="time-tracking" element={<TimeTracking />} />
                    <Route path="report"        element={<ReportPage />} />
                    <Route path="photo-upload"  element={<PhotoUpload />} />
                </Route>

                {/* ── 404 ── */}
                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </div>
    );
}

export default App;