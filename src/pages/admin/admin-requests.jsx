import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import logo from "../../assets/circuithubLogo2.png";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../firebaseconfig";

const AdminRequests = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState("Pending");
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const snapshot = await getDocs(collection(db, "borrowRequests"));
      const fetchedRequests = await Promise.all(
        snapshot.docs.map(async (docSnap) => {
          const data = { id: docSnap.id, ...docSnap.data() };

          // Fetch user name using userId
          if (data.userId) {
            try {
              const userRef = doc(db, "users", data.userId);
              const userSnap = await getDoc(userRef);
              if (userSnap.exists()) {
                const userData = userSnap.data();
                data.borrowerName = `${userData.firstName} ${userData.lastName}`;
              }
            } catch (err) {
              console.error("Error fetching user data:", err);
            }
          }

          return data;
        })
      );

      setRequests(fetchedRequests);
    } catch (err) {
      console.error("Error fetching requests:", err);
      setError("Failed to fetch requests.");
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const reqRef = doc(db, "borrowRequests", id);
      await updateDoc(reqRef, { status: newStatus });
      fetchRequests(); // Refresh data after update
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  const filteredRequests = requests.filter((req) => {
    const matchesStatus = statusFilter === "All" || req.status === statusFilter;
    const matchesSearch =
      req.borrowerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.itemName?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="admin-dashboard">
      {/* Navbar */}
      <div className="navbar">
        <img src={logo} alt="CircuitHub Logo" />
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
                location.pathname === link.to ? "navbar-link active-link" : "navbar-link"
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
        <h1 className="admin-welcome">Manage Requests</h1>
        {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}

        {/* Filters */}
        <div className="admin-filters-row">
          <input
            type="text"
            placeholder="Search by borrower or item..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="admin-search-bar"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="admin-filter-dropdown"
          >
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Denied">Denied</option>
            <option value="Returned">Returned</option>
          </select>
        </div>

        {/* Requests List */}
        <div className="admin-requests-grid">
          {filteredRequests.length > 0 ? (
            filteredRequests.map((req) => (
              <div
                key={req.id}
                className="admin-request-card fixed-card-width"
                onClick={() => {
                  if (req.status === "Pending") return;
                  navigate(`/admin-view-request/${req.id}`);
                }}
                style={{
                  cursor: req.status !== "Pending" ? "pointer" : "default",
                }}
              >
                <h3>{req.borrowerName || "Unknown"}</h3>
                <p><strong>Item:</strong> {req.itemName || "Unknown"}</p>
                <p><strong>Time Slot:</strong> {req.timeRange || `${req.startTime || ""} - ${req.returnTime || ""}`}</p>
                <p>
                  <strong>Status:</strong>{" "}
                  <span className={`status-badge ${req.status?.toLowerCase()}`}>
                    {req.status}
                  </span>
                </p>

                {req.status === "Pending" && (
                  <div className="request-action-btns">
                    <button
                      className="approve-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusUpdate(req.id, "Approved");
                      }}
                    >
                      Approve
                    </button>
                    <button
                      className="deny-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusUpdate(req.id, "Denied");
                      }}
                    >
                      Deny
                    </button>
                    <button
                      className="review-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/review-request/${req.id}`);
                      }}
                    >
                      Review Request
                    </button>
                  </div>
                )}

                {req.status === "Approved" && (
                  <div className="request-action-btns">
                    <button
                      className="mark-returned-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusUpdate(req.id, "Returned");
                      }}
                    >
                      Mark as Returned
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p>No requests found for current filters.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminRequests;
