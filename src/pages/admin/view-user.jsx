import React, { useEffect, useState } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import logo from "../../assets/CCSGadgetHub1.png";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebaseconfig";

const ViewUser = () => {
  const { id } = useParams();
  const location = useLocation();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userRef = doc(db, "users", id);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          setUser({ id: userSnap.id, ...userSnap.data() });
        } else {
          setError("User not found.");
        }
      } catch (err) {
        console.error("Error fetching user:", err);
        setError("Failed to load user.");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  if (loading) {
    return (
      <div className="admin-dashboard-container">
        <p>Loading user data...</p>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="admin-dashboard-container">
        <p>{error || "User not found."}</p>
        <Link to="/admin-users" className="back-arrow">←</Link>
      </div>
    );
  }

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
        <div style={{ display: "flex", alignItems: "center", maxWidth: "800px", margin: "0 auto" }}>
          <Link to="/admin-users" className="back-arrow">←</Link>
        </div>

        <div className="view-user-box">
          <h2 className="view-user-title">User Details</h2>

          <p><strong>Full Name:</strong> {user.firstName} {user.lastName}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Role:</strong> {user.role}</p>

          {user.role === "Student" && (
            <>
              <p><strong>Year Level:</strong> {user.yearLevel || "N/A"}</p>
              <p><strong>Course:</strong> {user.course || "N/A"}</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewUser;
