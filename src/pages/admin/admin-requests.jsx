import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../../firebaseconfig";
import "../../components/css/admin/admin-request.css";
import AdminHeader from "./AdminHeader";
import AdminRequestReview from "./review-request.jsx";
import EditRequest from "./edit-request.jsx";
import AddRequest from "./add-request.jsx";

const AdminRequests = () => {
  const [requests, setRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [editRequest, setEditRequest] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      console.log("Fetching all borrow requests...");
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
      console.log("Fetched requests:", fetched);
      console.log("Total requests:", fetched.length);
      setRequests(fetched);
    } catch (err) {
      console.error("Request fetch error:", err);
      setError("Failed to fetch requests.");
    }
  };

  const groupRequestsByDate = (requests) => {
    const groups = {};
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const formatKey = (dateObj) => {
      const day = dateObj.getDate().toString().padStart(2, "0");
      const month = (dateObj.getMonth() + 1).toString().padStart(2, "0");
      const dayStr = dateObj.toLocaleDateString("en-US", {
        weekday: "short",
      }).toUpperCase();
      return `${day}/${month}, ${dayStr}`;
    };

    for (let req of requests) {
      if (!req.createdAt || !req.createdAt.seconds) continue;

      const created = new Date(req.createdAt.seconds * 1000);
      const createdDate = created.toDateString();
      const todayStr = today.toDateString();
      const yesterdayStr = yesterday.toDateString();

      let key = "";
      if (createdDate === todayStr) key = "Today";
      else if (createdDate === yesterdayStr) key = "Yesterday";
      else key = formatKey(created);

      if (!groups[key]) groups[key] = [];
      groups[key].push({ ...req, createdDate: created });
    }

    return groups;
  };

  const filteredRequests = requests.filter((req) => {
    const matchesStatus =
        statusFilter === "All" || req.status === statusFilter;
    
    const itemSearchText = Array.isArray(req.items) && req.items.length > 0
        ? req.items.map(item => item.name).join(' ')
        : req.itemName || '';
    
    const matchesSearch =
        req.borrowerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        itemSearchText.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const groupedRequests = groupRequestsByDate(filteredRequests);

  const sortedGroups = Object.entries(groupedRequests).sort(
      ([aKey, aReqs], [bKey, bReqs]) => {
        const getDateValue = (key, reqs) => {
          if (key === "Today") return new Date();
          if (key === "Yesterday") {
            const y = new Date();
            y.setDate(y.getDate() - 1);
            return y;
          }
          return reqs[0]?.createdDate || new Date(0);
        };
        return getDateValue(bKey, bReqs) - getDateValue(aKey, aReqs);
      }
  );

  const handleEditRequest = (req, e) => {
    e.stopPropagation();
    setEditRequest(req);
  };

  const handleCloseEdit = (shouldRefresh) => {
    setEditRequest(null);
    if (shouldRefresh) {
      fetchRequests();
    }
  };

  const handleDeleteRequest = (req, e) => {
    e.stopPropagation();
    setRequestToDelete(req);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteDoc(doc(db, "borrowRequests", requestToDelete.id));
      setRequests((prev) => prev.filter((req) => req.id !== requestToDelete.id));
      setShowDeleteConfirm(false);
      setRequestToDelete(null);
      // Close view modal if the deleted request was being viewed
      if (selectedRequest?.id === requestToDelete.id) {
        setSelectedRequest(null);
      }
    } catch (err) {
      console.error("Failed to delete request:", err);
      alert("Failed to delete request. Please try again.");
    }
  };

  const handleAddClose = (shouldRefresh) => {
    setShowAddModal(false);
    if (shouldRefresh) {
      fetchRequests();
    }
  };

  return (
      <div className="AR-container">
        <AdminHeader />

        <div className={`AR-wrapper ${selectedRequest || editRequest || showAddModal || showDeleteConfirm ? "blurred" : ""}`}>
          <div className="AR-content">
            <div className="AR-header">
              <h1 className="AR-title">Manage Borrow Requests</h1>
              <button className="AR-add-btn" onClick={() => setShowAddModal(true)}>
                + Create Request
              </button>
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
                <option value="All">All Status</option>
                <option value="Pending-Teacher">Pending (Teacher)</option>
                <option value="Pending-Admin">Pending (Admin)</option>
                <option value="Approved">Approved</option>
                <option value="Denied">Denied</option>
                <option value="Returned">Returned</option>
              </select>
            </div>

            {sortedGroups.map(([label, reqs]) => (
                <div key={label} className="AR-group">
                  <h2 className="AR-group-label">{label}</h2>
                  <div className="AR-grid">
                    {reqs.map((req) => (
                        <div
                            key={req.id}
                            className="AR-card"
                            onClick={() => setSelectedRequest(req)}
                            style={{ cursor: "pointer", position: "relative" }}
                        >
                          <div className="AR-card-actions">
                            <button
                              className="AR-edit-icon"
                              onClick={(e) => handleEditRequest(req, e)}
                              title="Edit Request"
                            >
                              ✏️
                            </button>
                            <button
                              className="AR-delete-icon"
                              onClick={(e) => handleDeleteRequest(req, e)}
                              title="Delete Request"
                            >
                              🗑️
                            </button>
                          </div>
                          <div className="AR-card-content">
                            <h3 className="AR-borrower">
                              {req.borrowerName || "Unknown"}
                            </h3>
                            <p>
                              <strong>Item(s):</strong>{" "}
                              {Array.isArray(req.items) && req.items.length > 0
                                  ? req.items.length > 1
                                      ? `${req.items[0].name} (+${req.items.length - 1} more)`
                                      : req.items[0].name
                                  : req.itemName || "Unknown"}
                            </p>
                            <p>
                              <strong>Time Slot:</strong>{" "}
                              {req.timeRange ||
                                  `${req.startTime || ""} - ${req.returnTime || ""}`}
                            </p>
                            <p>
                              <strong>Status:</strong>{" "}
                              <span
                                  className={`AR-status ${
                                      req.status === "Pending-Admin"
                                          ? "pending-admin"
                                          : req.status === "Pending-Teacher"
                                              ? "pending-teacher"
                                              : req.status === "Returned"
                                                  ? "returned"
                                                  : req.status.toLowerCase()
                                  }`}
                              >
                                {req.status === "Pending-Admin"
                                    ? "Pending (Admin)"
                                    : req.status === "Pending-Teacher"
                                        ? "Pending (Teacher)"
                                        : req.status}
                              </span>
                            </p>
                          </div>
                        </div>
                    ))}
                  </div>
                </div>
            ))}
          </div>
        </div>

        {selectedRequest && (
            <AdminRequestReview
                request={selectedRequest}
                onClose={() => {
                  setSelectedRequest(null);
                  fetchRequests();
                }}
            />
        )}

        {editRequest && (
            <EditRequest
                request={editRequest}
                onClose={handleCloseEdit}
            />
        )}

        {showAddModal && (
            <AddRequest onClose={handleAddClose} />
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
            <div className="AR-delete-modal-overlay">
              <div className="AR-delete-modal">
                <h3>Confirm Delete</h3>
                <p>
                  Are you sure you want to delete the request from{" "}
                  <strong>{requestToDelete?.borrowerName}</strong>?
                </p>
                <p className="AR-warning">This action cannot be undone.</p>
                <div className="AR-delete-buttons">
                  <button 
                    className="AR-cancel-delete-btn" 
                    onClick={() => setShowDeleteConfirm(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    className="AR-confirm-delete-btn" 
                    onClick={confirmDelete}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
        )}
      </div>
  );
};

export default AdminRequests;
