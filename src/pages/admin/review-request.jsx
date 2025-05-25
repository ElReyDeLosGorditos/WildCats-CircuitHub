import React, { useEffect, useState } from "react";
import { Link, useParams, useLocation, useNavigate } from "react-router-dom";
import logo from "../../assets/CCSGadgetHub1.png";
import { db } from "../../firebaseconfig";
import { doc, getDoc } from "firebase/firestore";

const AdminRequestReview = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [request, setRequest] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRequestAndUser = async () => {
      try {
        const docRef = doc(db, "borrowRequests", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const requestData = { id: docSnap.id, ...docSnap.data() };
          setRequest(requestData);

          // fetch the user details using userId
          if (requestData.userId) {
            const userRef = doc(db, "users", requestData.userId);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
              setUser(userSnap.data());
            }
          }
        } else {
          setError("Request not found.");
        }
      } catch (err) {
        console.error("Error fetching request:", err);
        setError("Failed to load request.");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchRequestAndUser();
    else setError("Invalid request ID.");
  }, [id]);

  const handleApprove = () => {
    alert("Request Approved!");
    navigate("/admin-requests");
  };

  const handleDeny = () => {
    alert("Request Denied!");
    navigate("/admin-requests");
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
              className={
                location.pathname === link.to
                  ? "navbar-link active-link"
                  : "navbar-link"
              }
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
        <Link to="/admin-requests" className="back-arrow">←</Link>

        {loading ? (
          <p>Loading request...</p>
        ) : error ? (
          <p>{error}</p>
        ) : (
          <div className="request-details-box">
            <h2>Review Request Details</h2>

            <h3 className="section-header">Request Timeline</h3>
            <p>
              <strong>Date Request Was Created:</strong>{" "}
              {request.createdAt?.seconds
                ? new Date(request.createdAt.seconds * 1000).toLocaleString()
                : "N/A"}
            </p>

            <h3 className="section-header">Borrowing Schedule</h3>
            <p><strong>Scheduled Borrow Date:</strong> {request.borrowDate}</p>
            <p><strong>Scheduled Time Slot:</strong> {request.timeRange || `${request.startTime} - ${request.returnTime}`}</p>

            <h3 className="section-header">Request Information</h3>
            <p><strong>Borrower Name:</strong> {user ? `${user.firstName} ${user.lastName}` : request.userName || "N/A"}</p>
            <p><strong>Item Requested:</strong> {request.itemName}</p>
            <p><strong>Reason for Borrowing:</strong> {request.reason}</p>
            <p><strong>Current Status:</strong> {request.status}</p>

            <div className="request-action-btns">
              <button className="approve-btn" onClick={handleApprove}>Approve</button>
              <button className="deny-btn" onClick={handleDeny}>Deny</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminRequestReview;
