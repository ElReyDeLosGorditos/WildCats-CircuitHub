import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../firebaseconfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import "../../components/css/admin/review-request.css";

const AdminRequestReview = ({ request, onClose }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (request?.userId) {
          const userSnap = await getDoc(doc(db, "users", request.userId));
          if (userSnap.exists()) {
            setUser(userSnap.data());
          }
        }
      } catch (err) {
        console.error("User fetch failed:", err);
        setError("Failed to load user info.");
      } finally {
        setLoading(false);
      }
    };

    if (request) {
      fetchUser();
    } else {
      setError("No request data.");
      setLoading(false);
    }
  }, [request]);

  const updateStatus = async (status) => {
    try {
      await updateDoc(doc(db, "borrowRequests", request.id), { status });
      onClose(); // Close modal
    } catch (err) {
      console.error("Status update failed:", err);
    }
  };

  return (
      <div className="RR-overlay" onClick={onClose}>
        <div className="RR-modal" onClick={(e) => e.stopPropagation()}>
          {loading ? (
              <p>Loading request...</p>
          ) : error ? (
              <p>{error}</p>
          ) : (
              <>
                <h2 className="RR-title">Review Request</h2>

                <div className="RR-section">
                  <h3 className="RR-subtitle">Request Timeline</h3>
                  <p><strong>Created:</strong> {request.createdAt?.seconds ? new Date(request.createdAt.seconds * 1000).toLocaleString() : "N/A"}</p>
                </div>

                <div className="RR-section">
                  <h3 className="RR-subtitle">Borrowing Schedule</h3>
                  <p><strong>Date:</strong> {request.borrowDate}</p>
                  <p><strong>Time Slot:</strong> {request.timeRange || `${request.startTime} - ${request.returnTime}`}</p>
                </div>

                <div className="RR-section">
                  <h3 className="RR-subtitle">Request Info</h3>
                  <p><strong>Borrower:</strong> {user ? `${user.firstName} ${user.lastName}` : "Unknown"}</p>
                  <p><strong>Item:</strong> {request.itemName}</p>
                  <p><strong>Reason:</strong> {request.reason}</p>
                  <p><strong>Status:</strong> {request.status}</p>
                </div>

                <div className="RR-buttons">
                  <button className="RR-approve" onClick={() => updateStatus("Approved")}>Approve</button>
                  <button className="RR-deny" onClick={() => updateStatus("Denied")}>Deny</button>
                </div>
              </>
          )}
        </div>
      </div>
  );
};

export default AdminRequestReview;
