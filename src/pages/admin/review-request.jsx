import React, { useEffect, useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { db } from "../../firebaseconfig";
import { doc, getDoc, updateDoc, Timestamp } from "firebase/firestore";
import "../../components/css/admin/review-request.css";

const AdminRequestReview = ({ request: propRequest, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  const [currentRequest, setCurrentRequest] = useState(propRequest || location.state?.request || null);
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(!currentRequest);

  useEffect(() => {
    const fetchRequestAndUser = async () => {
      try {
        let requestToUse = currentRequest;

        // If no request data is present, fetch from Firestore using the URL param
        if (!requestToUse && id) {
          const docRef = doc(db, "borrowRequests", id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            requestToUse = { id: docSnap.id, ...docSnap.data() };
            setCurrentRequest(requestToUse);
          } else {
            setError("Request not found.");
            setLoading(false);
            return;
          }
        }

        // Fetch user details
        if (requestToUse?.userId) {
          const userSnap = await getDoc(doc(db, "users", requestToUse.userId));
          if (userSnap.exists()) {
            setUser(userSnap.data());
          }
        }
      } catch (err) {
        console.error("Error loading request/user:", err);
        setError("Failed to load request or user data.");
      } finally {
        setLoading(false);
      }
    };

    fetchRequestAndUser();
  }, [id, propRequest, location.state]);

  const [successMsg, setSuccessMsg] = useState(""); // Add this near your other state

  const updateStatus = async (status) => {
    try {
      const requestRef = doc(db, "borrowRequests", currentRequest.id);
      const updateData = { status };

      if (status === "Returned") {
        updateData.returnDate = Timestamp.now();
      }

      await updateDoc(requestRef, updateData);
      setCurrentRequest(prev => ({ ...prev, ...updateData }));

      // Navigate back to dashboard after approval or denial
      if (status === "Approved" || status === "Denied") {
        navigate("/admin-dashboard");
      }

      // Optional: for "Returned" you might want to stay on page
    } catch (err) {
      console.error("Status update failed:", err);
      setError("Failed to update request status.");
    }
  };

  const renderItemNames = (req) => {
    if (Array.isArray(req?.items) && req.items.length > 0) {
      return req.items.map(item => item.name).join(", ");
    }
    return req?.itemName || "N/A";
  };

  if (loading) {
    return (
        <div className="RR-overlay">
          <div className="RR-modal" onClick={(e) => e.stopPropagation()}>
            <p>Loading request...</p>
          </div>
        </div>
    );
  }

  if (error || !currentRequest) {
    return (
        <div className="RR-overlay">
          <div className="RR-modal" onClick={(e) => e.stopPropagation()}>
            <p>{error || "No request data available."}</p>
            <button className="RR-close-btn" onClick={onClose}>Close</button>
          </div>
        </div>
    );
  }

  const showApproveDenyButtons = currentRequest.status === "Pending";
  const showReturnButton = currentRequest.status === "Approved";
  const showNoActionButtons = ["Returned", "Denied", "Cancelled"].includes(currentRequest.status);

  return (
      <div className="RR-overlay" onClick={onClose}>
        <div className="RR-modal" onClick={(e) => e.stopPropagation()}>
          <h2 className="RR-title">Review Request</h2>

          <div className="RR-section">
            <h3 className="RR-subtitle">Request Timeline</h3>
            <p><strong>Created:</strong> {currentRequest.createdAt?.seconds ? new Date(currentRequest.createdAt.seconds * 1000).toLocaleString() : "N/A"}</p>
          </div>

          <div className="RR-section">
            <h3 className="RR-subtitle">Borrowing Schedule</h3>
            <p><strong>Date:</strong> {currentRequest.borrowDate}</p>
            <p><strong>Time Slot:</strong> {currentRequest.timeRange || `${currentRequest.startTime} - ${currentRequest.returnTime}`}</p>
          </div>

          <div className="RR-section">
            <h3 className="RR-subtitle">Request Info</h3>
            <p><strong>Borrower:</strong> {user ? `${user.firstName} ${user.lastName}` : "Unknown"}</p>
            <p><strong>Item(s):</strong> {renderItemNames(currentRequest)}</p>
            <p><strong>Reason:</strong> {currentRequest.reason}</p>
            <p><strong>Current Status:</strong> <span className={`status-badge ${currentRequest.status?.toLowerCase()}`}>{currentRequest.status}</span></p>
          </div>

          <div className="RR-buttons">
            {showApproveDenyButtons && (
                <>
                  <button className="RR-approve" onClick={() => updateStatus("Approved")}>Approve</button>
                  <button className="RR-deny" onClick={() => updateStatus("Denied")}>Deny</button>
                </>
            )}

            {showReturnButton && (
                <button className="RR-return" onClick={() => updateStatus("Returned")}>Mark as Returned</button>
            )}

            {showNoActionButtons && (
                <p className="RR-no-actions-text">No further actions available for this request.</p>
            )}
          </div>
        </div>
      </div>
  );
};

export default AdminRequestReview;
