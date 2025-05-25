import React, { useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import logo from "../../assets/CCSGadgetHub1.png";

const EditUser = () => {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    // Dummy user data for editing (you can later replace this with real fetch)
    const dummyUsers = [
        {
            id: "1",
            name: "Mica Ella Obeso",
            email: "micaella.obeso@cit.edu",
            role: "Student",
            yearLevel: "4th Year",
            course: "BSIT",
        },
        {
            id: "2",
            name: "John Smith",
            email: "john.smith@cit.edu",
            role: "Student",
            yearLevel: "3rd Year",
            course: "BSCS",
        },
        {
            id: "3",
            name: "Admin User",
            email: "admin@cit.edu",
            role: "Admin",
            yearLevel: "",
            course: "",
        },
    ];

    const user = dummyUsers.find((u) => u.id === id);

    // If no user found
    if (!user) {
        return (
            <div className="admin-dashboard-container">
                <p>User not found.</p>
                <Link to="/admin-users" className="back-arrow">←</Link>
            </div>
        );
    }

    // Controlled form states
    const [fullName, setFullName] = useState(user.name);
    const [email, setEmail] = useState(user.email);
    const [role, setRole] = useState(user.role);
    const [yearLevel, setYearLevel] = useState(user.yearLevel);
    const [course, setCourse] = useState(user.course);

    const handleSave = (e) => {
        e.preventDefault();
        console.log("Saving updated user data:", {
            fullName,
            email,
            role,
            yearLevel,
            course,
        });
        navigate(`/view-user/${id}`);
    };

    const handleCancel = () => {
        navigate(`/view-user/${id}`);
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

            {/* Form Section */}
            <div className="admin-dashboard-container">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", maxWidth: "800px", margin: "0 auto" }}>
                    <Link to="/admin-users" className="back-arrow">←</Link>
                </div>

                <div className="edit-user-box">
                    <h2 className="edit-user-title">Edit User</h2>

                    <form className="edit-user-form" onSubmit={handleSave}>
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
                                    <select value={yearLevel} onChange={(e) => setYearLevel(e.target.value)}>
                                        <option value="1st Year">1st Year</option>
                                        <option value="2nd Year">2nd Year</option>
                                        <option value="3rd Year">3rd Year</option>
                                        <option value="4th Year">4th Year</option>
                                    </select>
                                </div>

                                <div className="input-row">
                                    <label>Course:</label>
                                    <select value={course} onChange={(e) => setCourse(e.target.value)}>
                                        <option value="BSIT">BSIT</option>
                                        <option value="BSCS">BSCS</option>
                                    </select>
                                </div>
                            </>
                        )}

                        <div className="edit-btn-row">
                            <Link to={`/view-user/${id}`} className="cancel-link">Cancel</Link>
                            <button type="submit" className="edit-save-btn">Save</button>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditUser;
