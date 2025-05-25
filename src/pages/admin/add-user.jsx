import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../../assets/CCSGadgetHub1.png";

const AddUser = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Controlled form fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Student");
  const [yearLevel, setYearLevel] = useState("");
  const [course, setCourse] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("Adding new user:", {
      fullName,
      email,
      role,
      yearLevel,
      course,
    });

    // After adding, go back to Manage Users
    navigate("/admin-users");
  };

  return (
    <div className="admin-dashboard">
      {/* Navbar */}
      <div className="navbar">
        <img src={logo} alt="CCS Gadget Hub Logo" />
        <nav>
          {[
            { label: "Dashboard", to: "/admin-dashboard" },
            { label: "Manage Items", to: "/admin-items" },
            { label: "Requests", to: "/admin-requests" },
            { label: "Manage Users", to: "/admin-users" },
          ].map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={location.pathname === link.to ? "navbar-link active-link" : "navbar-link"}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div style={{ marginLeft: "auto" }}>
          <Link to="/" className="logout-link">Log Out</Link>
        </div>
      </div>

      {/* Content */}
      <div className="admin-dashboard-container">
        <Link to="/admin-users" className="back-arrow">←</Link>

        <div className="add-user-box">
          <h2 className="add-user-title">Add New User</h2>

          <form className="add-user-form" onSubmit={handleSubmit}>
            <div className="input-row">
              <label>Full Name:</label>
              <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            </div>

            <div className="input-row">
              <label>Email:</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>

            <div className="input-row">
              <label>Role:</label>
              <select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="Student">Student</option>
                <option value="Admin">Admin</option>
              </select>
            </div>

            {role === "Student" && (
              <>
                <div className="input-row">
                  <label>Year Level:</label>
                  <select value={yearLevel} onChange={(e) => setYearLevel(e.target.value)} required={role === "Student"}>
                    <option value="">Select Year</option>
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                  </select>
                </div>

                <div className="input-row">
                  <label>Course:</label>
                  <select value={course} onChange={(e) => setCourse(e.target.value)} required={role === "Student"}>
                    <option value="">Select Course</option>
                    <option value="BSIT">BSIT</option>
                    <option value="BSCS">BSCS</option>
                    <option value="BSEMC">BSEMC</option>
                  </select>
                </div>
              </>
            )}

            <div className="edit-btn-row">
              <Link to="/admin-users" className="cancel-link">Cancel</Link>
              <button type="submit" className="edit-save-btn">Save</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddUser;
