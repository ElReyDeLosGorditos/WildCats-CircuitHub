import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { 
  ProtectedRoute, 
  AdminRoute, 
  TeacherRoute, 
  StaffRoute,
  StudentRoute,
  AdminOrLabRoute
} from "./components/ProtectedRoute";
import { PublicRoute } from "./components/AutoRedirect";

import Login from "./pages/login";

// User pages
import Dashboard from "./pages/user/dashboard";
import Items from "./pages/user/items";
import ItemDetails from "./pages/user/itemdetails";
import RequestForm from "./pages/user/requestform";
import Register from './pages/user/register';
import Profile from "./pages/user/profile";
import EditProfile from "./pages/user/editprofile";
import MyRequests from "./pages/user/my-requests";
import ViewRequest from "./pages/user/view-request";

// Admin pages
import AdminDashboard from "./pages/AdminDashboard.jsx";
import ManageItems from "./pages/admin/admin-items";
import AddItem from "./pages/admin/add-item";
import ViewItem from "./pages/admin/view-item";
import EditItem from "./pages/admin/edit-item";
import Requests from "./pages/admin/admin-requests";
import ReviewRequest from "./pages/admin/review-request";
import AdminViewRequest from "./pages/admin/admin-view-request";
import AdminManageUsers from "./pages/admin/admin-users"; 
import ViewUser from "./pages/admin/view-user";
import EditUser from "./pages/admin/edit-user";
import AddUser from "./pages/admin/add-user";
import AdminRegister from "./pages/admin/admin-register.jsx";
import EquipmentMaintenance from "./pages/admin/equipment-maintenance.jsx";

// Public pages
import LandingPage from "./pages/user/landing.jsx";
import FeaturesPage from "./pages/features.jsx";
import HowItWorksPage from "./pages/howItWorks.jsx";
import FaqsPage from "./pages/faqs.jsx";
import ContactUsPage from "./pages/contactUs.jsx";

// Teacher pages
import TeacherDashboard from "./pages/teacher/t-dashboard.jsx";
import TeacherRequests from "./pages/teacher/t-requests.jsx";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes - Auto-redirect authenticated users */}
          <Route path="/" element={
            <PublicRoute>
              <LandingPage />
            </PublicRoute>
          } />
          <Route path="/register" element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } />
          <Route path="/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />
          <Route path="/features" element={
            <PublicRoute>
              <FeaturesPage />
            </PublicRoute>
          } />
          <Route path="/FAQs" element={
            <PublicRoute>
              <FaqsPage />
            </PublicRoute>
          } />
          <Route path="/ContactUs" element={
            <PublicRoute>
              <ContactUsPage />
            </PublicRoute>
          } />
          <Route path="/HowItWorks" element={
            <PublicRoute>
              <HowItWorksPage />
            </PublicRoute>
          } />

          {/* Student/User Routes - Protected */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/useritems" element={
            <ProtectedRoute>
              <Items />
            </ProtectedRoute>
          } />
          <Route path="/useritem-details/:itemId" element={
            <ProtectedRoute>
              <ItemDetails />
            </ProtectedRoute>
          } />
          <Route path="/borrow/:itemId" element={
            <ProtectedRoute>
              <RequestForm />
            </ProtectedRoute>
          } />
          <Route path="/userprofile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/usereditprofile" element={
            <ProtectedRoute>
              <EditProfile />
            </ProtectedRoute>
          } />
          <Route path="/my-requests" element={
            <ProtectedRoute>
              <MyRequests />
            </ProtectedRoute>
          } />
          <Route path="/view-request/:id" element={
            <ProtectedRoute>
              <ViewRequest />
            </ProtectedRoute>
          } />

          {/* Admin Routes - Admin Only */}
          <Route path="/admin-register" element={
            <AdminRoute>
              <AdminRegister />
            </AdminRoute>
          } />
          <Route path="/admin-dashboard" element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } />
          <Route path="/admin-items" element={
            <AdminRoute>
              <ManageItems />
            </AdminRoute>
          } />
          <Route path="/add-item" element={
            <AdminRoute>
              <AddItem />
            </AdminRoute>
          } />
          <Route path="/view-item/:id" element={
            <AdminRoute>
              <ViewItem />
            </AdminRoute>
          } />
          <Route path="/edit-item/:id" element={
            <AdminRoute>
              <EditItem />
            </AdminRoute>
          } />
          <Route path="/admin-requests" element={
            <AdminRoute>
              <Requests />
            </AdminRoute>
          } />
          <Route path="/review-request/:id" element={
            <AdminRoute>
              <ReviewRequest />
            </AdminRoute>
          } />
          <Route path="/admin-view-request/:id" element={
            <AdminRoute>
              <AdminViewRequest />
            </AdminRoute>
          } />
          <Route path="/admin-users" element={
            <AdminRoute>
              <AdminManageUsers />
            </AdminRoute>
          } />
          <Route path="/view-user/:id" element={
            <AdminRoute>
              <ViewUser />
            </AdminRoute>
          } />
          <Route path="/edit-user/:id" element={
            <AdminRoute>
              <EditUser />
            </AdminRoute>
          } />
          <Route path="/add-user" element={
            <AdminRoute>
              <AddUser />
            </AdminRoute>
          } />
          <Route path="/equipment-maintenance" element={
            <AdminOrLabRoute>
              <EquipmentMaintenance />
            </AdminOrLabRoute>
          } />

          {/* Teacher Routes - Teacher or Admin */}
          <Route path="/t-dashboard" element={
            <TeacherRoute>
              <TeacherDashboard />
            </TeacherRoute>
          } />
          <Route path="/t-requests" element={
            <TeacherRoute>
              <TeacherRequests />
            </TeacherRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
