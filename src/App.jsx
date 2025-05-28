import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

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
import AdminDashboard from "./pages/AdminDashboard";
import ManageItems from "./pages/admin/admin-items";
import AddItem from "./pages/admin/add-item";
import ViewItem from "./pages/admin/view-item"; // ✅ Uses :id param now
import EditItem from "./pages/admin/edit-item";
import Requests from "./pages/admin/admin-requests";
import ReviewRequest from "./pages/admin/review-request";
import AdminViewRequest from "./pages/admin/admin-view-request";
import AdminManageUsers from "./pages/admin/admin-users"; 
import ViewUser from "./pages/admin/view-user";
import EditUser from "./pages/admin/edit-user";
import AddUser from "./pages/admin/add-user";
import AdminRegister from "./pages/admin/admin-register.jsx";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* User Routes */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/useritems" element={<Items />} />
        <Route path="/useritem-details/:itemId" element={<ItemDetails />} />
        <Route path="/borrow/:itemId" element={<RequestForm />} />
        <Route path="/userprofile" element={<Profile />} />
        <Route path="/usereditprofile" element={<EditProfile />} />
        <Route path="/my-requests" element={<MyRequests />} />
        <Route path="/view-request/:id" element={<ViewRequest />} />

        {/* Admin Routes */}
        <Route path="/admin-register" element={<AdminRegister />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/admin-items" element={<ManageItems />} />
        <Route path="/add-item" element={<AddItem />} />
        <Route path="/view-item/:id" element={<ViewItem />} /> {/* ✅ Matches useParams().id */}
        <Route path="/edit-item/:id" element={<EditItem />} />
        <Route path="/admin-requests" element={<Requests />} />
        <Route path="/review-request/:id" element={<ReviewRequest />} />
        <Route path="/admin-view-request/:id" element={<AdminViewRequest />} />
        <Route path="/admin-users" element={<AdminManageUsers />} />
        <Route path="/view-user/:id" element={<ViewUser />} />
        <Route path="/edit-user/:id" element={<EditUser />} />
        <Route path="/add-user" element={<AddUser />} />
      </Routes>
    </Router>
  );
}

export default App;
