import React, { useState, useEffect } from "react";

import {
  collection,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "../../firebaseconfig";
import "../../components/css/admin/admin-request.css";
import AdminHeader from "./AdminHeader";

// ⬇️ Popup import (you’ll create this next)
import AdminRequestPopup from "./review-request.jsx";
import AdminRequestReview from "./review-request.jsx";

const AdminRequests = () => {


  const [requests, setRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState("Pending");
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");

  // ⬇️ Popup state
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const snapshot = await getDocs(collection(db, "borrowRequests"));
      const fetched = await Promise.all(
          snapshot.docs.map(async (docSnap) => {
            const data = { id: docSnap.id, ...docSnap.data() };

            if (data.userId) {
              try {
                const userRef = doc(db, "users", data.userId);
                const userSnap = await getDoc(userRef);
                if (userSnap.exists()) {
                  const userData = userSnap.data();
                  data.borrowerName = `${userData.firstName} ${userData.lastName}`;
                }
              } catch (err) {
                console.error("User fetch error:", err);
              }
            }

            return data;
          })
      );
      setRequests(fetched);
    } catch (err) {
      console.error("Request fetch error:", err);
      setError("Failed to fetch requests.");
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await updateDoc(doc(db, "borrowRequests", id), { status: newStatus });
      fetchRequests();
    } catch (err) {
      console.error("Status update error:", err);
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
      <div className={`AR-container ${selectedRequest ? "modal-blurred" : ""}`}>
        <AdminHeader />

        <div className="AR-wrapper">
          <div className="AR-content">
            <div className="AR-header">
              <h1 className="AR-title">Manage Borrow Requests</h1>
            </div>

            {error && <p className="AR-error">{error}</p>}

            <div className="AR-filters">
              <input
                  type="text"
                  className="AR-search"
                  placeholder="Search by borrower or item..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
              />
              <select
                  className="AR-dropdown"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Denied">Denied</option>
                <option value="Returned">Returned</option>
                <option value="All">All</option>
              </select>
            </div>

            <div className="AR-grid">
              {filteredRequests.length > 0 ? (
                  filteredRequests.map((req) => (
                      <div
                          key={req.id}
                          className="AR-card"
                          onClick={() => setSelectedRequest(req)}
                          style={{ cursor: "pointer" }}
                      >
                        <div className="AR-card-content">
                          <h3 className="AR-borrower">{req.borrowerName || "Unknown"}</h3>
                          <p><strong>Item:</strong> {req.itemName || "Unknown"}</p>
                          <p><strong>Time Slot:</strong> {req.timeRange || `${req.startTime || ""} - ${req.returnTime || ""}`}</p>
                          <p>
                            <strong>Status:</strong>{" "}
                            <span className={`AR-status ${req.status?.toLowerCase()}`}>
                        {req.status}
                      </span>
                          </p>
                        </div>
                      </div>
                  ))
              ) : (
                  <p className="AR-empty">No requests found.</p>
              )}
            </div>
          </div>
        </div>

        {/* ⬇️ Request Modal (popup) */}
        {selectedRequest && (
            <AdminRequestReview
                request={selectedRequest}
                onClose={() => setSelectedRequest(null)}
            />
        )}
      </div>
  );
};

export default AdminRequests;
