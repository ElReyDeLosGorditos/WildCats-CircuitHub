import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebaseconfig.js";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  doc,
  getDoc,
} from "firebase/firestore";
import AdminHeader from "../pages/admin/AdminHeader"; // universal header
import "../components/css/admin/admin-dashboard.css";

const AdminDashboard = () => {
  const navigate = useNavigate();

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
            itemName: data.itemName || "Unnamed Item",
            borrowerName: data.userName || data.borrowerName || "Unknown User",
            requestDate: data.borrowDate || data.requestDate || "N/A",
          };
        });
        setPendingRequests(pendingList);

        const returnedSnap = await getDocs(query(reqRef, where("status", "==", "Returned")));
        setReturnedCount(returnedSnap.size);

        const activitySnap = await getDocs(query(reqRef, orderBy("createdAt", "desc"), limit(3)));
        const recent = await Promise.all(
            activitySnap.docs.map(async (docSnap) => {
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
                date: data.borrowDate || "N/A",
              };
            })
        );

        setRecentActivities(recent);
      } catch (err) {
        console.error("Dashboard data fetch error:", err);
      }
    };

    fetchDashboardData();
  }, []);

  const handleCardClick = (path) => {
    navigate(path);
  };

  const handleReview = (e, id) => {
    e.stopPropagation();
    navigate(`/review-request/${id}`);
  };

  return (
      <div className="admin-dashboard">
        <AdminHeader />

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
                    <li
                        key={log.id}
                        style={{
                          padding: "12px 0",
                          borderBottom: "1px solid #eee",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                    >
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
                        <p>
                          <strong>{req.itemName}</strong> - {req.borrowerName}
                        </p>
                        <span>{req.requestDate}</span>
                        <div className="review-btn-row">
                          <button
                              className="review-request-btn"
                              onClick={(e) => handleReview(e, req.id)}
                          >
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
      </div>
  );
};

export default AdminDashboard;
