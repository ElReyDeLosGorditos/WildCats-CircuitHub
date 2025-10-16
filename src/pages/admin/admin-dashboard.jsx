import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../../assets/circuithubLogo2.png";
import "../../admin.css";
import { db , storage} from "../../firebaseconfig";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  doc,
  getDoc
} from "firebase/firestore";

const AdminDashboard = () => {

  const location = useLocation();
  const navigate = useNavigate();

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [approvedCount, setApprovedCount] = useState(0);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [returnedCount, setReturnedCount] = useState(0);
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const itemsSnap = await getDocs(collection(db, "items"));
        setTotalItems(itemsSnap.size);

        const reqRef = collection(db, "borrowRequests");

        const approvedSnap = await getDocs(query(reqRef, where("status", "==", "Approved")));
        setApprovedCount(approvedSnap.size);

        const pendingSnap = await getDocs(query(reqRef, where("status", "==", "Pending")));
        const pendingList = pendingSnap.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data, // include all original fields
          };
        });
        setPendingRequests(pendingList);

        const returnedSnap = await getDocs(query(reqRef, where("status", "==", "Returned")));
        setReturnedCount(returnedSnap.size);

        const activitySnap = await getDocs(query(reqRef, orderBy("createdAt", "desc"), limit(3)));
        const recent = await Promise.all(activitySnap.docs.map(async (docSnap) => {
          const data = docSnap.data();
          let fullName = data.userName || data.borrowerName || "Unknown User";

          if (data.userId) {
            const userRef = doc(db, "users", data.userId);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
              const user = userSnap.data();
              fullName = `${user.firstName} ${user.lastName}`;
            }
          }

          return {
            id: docSnap.id,
            text: `${fullName} ${data.status?.toLowerCase()} to borrow ${data.itemName || "an item"}`,
            date: data.borrowDate || "N/A"
          };
        }));

        setRecentActivities(recent);
      } catch (err) {
        console.error("Dashboard data fetch error:", err);
      }
    };

    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => (document.body.style.overflow = 'auto');
  }, [showModal]);

  const navLinks = [
    { label: "Dashboard", to: "/admin-dashboard" },
    { label: "Manage Items", to: "/admin-items" },
    { label: "Requests", to: "/admin-requests" },
    {label: "Maintenance", to: "/equipment-maintenance"},
    { label: "Manage Users", to: "/admin-users" },
  ];

  const handleCardClick = (path) => {
    navigate(path);
  };

  const handleReview = (e, request) => {
    e.stopPropagation();
    setSelectedRequest(request);
    setShowModal(true);
    // navigate(`/review-request/${request.id}`, { state: { request } });
  };

  useEffect(() => {
    setShowModal(false);
    setSelectedRequest(null);
  }, []);


  console.log("showModal:", showModal, "selectedRequest:", selectedRequest);
  console.log("rendered", showModal, selectedRequest);
  return (
    <div className="admin-dashboard">
      <div className="navbar">
        <img src={logo} alt="CircuitHub Logo" />
        <nav>
          {navLinks.map((link) => (
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

      <div className="admin-dashboard-container">
        <h1 className="admin-welcome">Welcome back, Admin!</h1>
        <p className="admin-subtext">Here's an overview of recent gadget hub activity.</p>

        <div className="admin-cards">
          <div className="admin-card clickable" onClick={() => handleCardClick("/admin-items")}>
            <h3>{totalItems}</h3>
            <p>Total Items</p>
          </div>
          <div className="admin-card clickable" onClick={() => handleCardClick("/admin-requests")}>
            <h3>{approvedCount}</h3>
            <p>Approved Requests</p>
          </div>
          <div className="admin-card clickable" onClick={() => handleCardClick("/admin-requests")}>
            <h3>{pendingRequests.length}</h3>
            <p>Pending Requests</p>
          </div>
          <div className="admin-card clickable" onClick={() => handleCardClick("/admin-requests")}>
            <h3>{returnedCount}</h3>
            <p>Returned</p>
          </div>
        </div>

        <div className="admin-columns">
          <div className="admin-activity-box clickable" onClick={() => handleCardClick("/admin-requests")}>
            <h3>Recent Activity</h3>
            <ul style={{ listStyleType: "none", padding: 0, margin: 0 }}>
              {recentActivities.map((log) => (
                <li key={log.id} style={{ padding: "12px 0", borderBottom: "1px solid #eee", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>{log.text}</div>
                  <div style={{ color: "#888", fontSize: "0.85em" }}>{log.date}</div>
                </li>
              ))}
            </ul>
          </div>

          <div className="admin-pending-box clickable" onClick={() => handleCardClick("/admin-requests")}>
            <h3>Pending Approvals</h3>
            {pendingRequests.length > 0 ? (
              pendingRequests.map((req) => (
                <div key={req.id} className="pending-request">
                  <p><strong>{req.itemName}</strong> - {req.borrowerName}</p>
                  <span>{req.requestDate}</span>
                  <div className="review-btn-row">
                    <button className="review-request-btn" onClick={(e) => handleReview(e, req)}>
                      Review Request
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p>No pending requests.</p>
            )}
          </div>
        </div>
      </div>

      {showModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>Review Request</h2>
              <p><strong>Item:</strong> {selectedRequest.itemName}</p>
              <p><strong>Borrower:</strong> {selectedRequest.borrowerName}</p>
              <p><strong>Date:</strong> {selectedRequest.requestDate}</p>
              <button onClick={() => setShowModal(false)}>Close</button>
            </div>
          </div>
      )}

    </div>
  );
};

export default AdminDashboard;
