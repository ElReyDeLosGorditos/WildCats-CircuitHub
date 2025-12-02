import React, { useEffect, useState } from "react";
import { db } from "../../firebaseconfig";
import { doc, getDoc, updateDoc, Timestamp } from "firebase/firestore";
import "../../components/css/admin/review-request.css";

const AdminRequestReview = ({ request: propRequest, onClose }) => {

  const [currentRequest, setCurrentRequest] = useState(propRequest || null);
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(!currentRequest);
  const [teacher, setTeacher] = useState(null); // NEW: store teacher profile

  useEffect(() => {
    const fetchUserAndRequest = async () => {
      try {
        let request = propRequest;

        // Reload full request if incomplete
        if (request && !request.userId) {
          const fullSnap = await getDoc(doc(db, "borrowRequests", request.id));
          if (fullSnap.exists()) {
            request = { id: fullSnap.id, ...fullSnap.data() };
            setCurrentRequest(request);
          }
        }

        // Fetch borrower profile
        if (request?.userId) {
          const userSnap = await getDoc(doc(db, "users", request.userId));
          if (userSnap.exists()) {
            setUser(userSnap.data());
          }
        }

        // ⭐ NEW — Fetch teacher profile
        if (request?.teacherId) {
          const teacherSnap = await getDoc(doc(db, "users", request.teacherId));
          if (teacherSnap.exists()) {
            setTeacher(teacherSnap.data());
          }
        }

      } catch (err) {
        console.error("Failed to fetch full request or user:", err);
        setError("Failed to load request details.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndRequest();
  }, [propRequest]);


  const [successMsg, setSuccessMsg] = useState("");

  if (currentRequest?.status === "Approved" || currentRequest?.status === "Denied") {
    onClose();
  }

  const updateStatus = async (status) => {
    try {
      console.log(`Updating request ${currentRequest.id} status from "${currentRequest.status}" to "${status}"`);
      const requestRef = doc(db, "borrowRequests", currentRequest.id);
      const updateData = { status };

      if (status === "Returned") {
        updateData.returnDate = Timestamp.now();
      }

      await updateDoc(requestRef, updateData);
      console.log(`✅ Successfully updated request status to "${status}"`);
      setCurrentRequest(prev => ({ ...prev, ...updateData }));

      if (status === "Approved" || status === "Denied") {
        setTimeout(() => {
          onClose();
        }, 500); // Small delay to show success
      }
    } catch (err) {
      console.error("❌ Status update failed:", err);
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

          {/* TIMELINE */}
          <div className="RR-section">
            <h3 className="RR-subtitle">Request Timeline</h3>
            <p><strong>Created:</strong>
              {currentRequest.createdAt?.seconds
                  ? new Date(currentRequest.createdAt.seconds * 1000).toLocaleString()
                  : "N/A"}
            </p>
          </div>

          {/* SCHEDULE */}
          <div className="RR-section">
            <h3 className="RR-subtitle">Borrowing Schedule</h3>
            <p><strong>Date:</strong> {currentRequest.borrowDate}</p>
            <p><strong>Time Slot:</strong>
              {currentRequest.timeRange || `${currentRequest.startTime} - ${currentRequest.returnTime}`}
            </p>
          </div>

          {/* REQUEST INFO */}
          <div className="RR-section">
            <h3 className="RR-subtitle">Request Info</h3>

            <p><strong>Borrower: </strong>
              {user ? `${user.firstName} ${user.lastName}` : "Unknown"}
            </p>

            {/* NEW — TEACHER IN-CHARGE */}
            <p><strong>Teacher In-Charge: </strong>
              {teacher
                  ? `${teacher.firstName} ${teacher.lastName}`
                  : currentRequest.teacherName || "N/A"}
            </p>

            {/* NEW — GROUP MEMBERS */}
            <p><strong>Group Members: </strong>
              {Array.isArray(currentRequest.groupMembers)
                  ? currentRequest.groupMembers.join(", ")
                  : currentRequest.groupMembers || "N/A"}
            </p>

            <p><strong>Item(s):</strong> {renderItemNames(currentRequest)}</p>
            <p><strong>Reason:</strong> {currentRequest.reason}</p>

            <p><strong>Current Status:</strong>
              <span
                  className={`status-badge ${
                      currentRequest.status === "Pending-Teacher"
                          ? "pending-teacher"
                          : currentRequest.status === "Pending-Admin"
                              ? "pending-admin"
                              : currentRequest.status?.toLowerCase()
                  }`}
              >
    {currentRequest.status === "Pending-Teacher" ||
    currentRequest.status === "Pending-Admin"
        ? "Pending"
        : currentRequest.status}
</span>

            </p>
          </div>

          {/* BUTTONS */}
          <div className="RR-buttons">

            {/* Admin can approve only when teacher has already approved */}
            {currentRequest.status === "Pending-Admin" && (
                <>
                  <button
                      className="RR-approve"
                      onClick={() => updateStatus("Approved")}
                  >
                    Approve
                  </button>

                  <button
                      className="RR-deny"
                      onClick={() => updateStatus("Denied")}
                  >
                    Deny
                  </button>
                </>
            )}

            {/* Status after admin approval */}
            {currentRequest.status === "Approved" && (
                <button
                    className="RR-return"
                    onClick={() => updateStatus("Returned")}
                >
                  Mark as Returned
                </button>
            )}

            {/* Show message when waiting for teacher */}
            {currentRequest.status === "Pending-Teacher" && (
                <p className="RR-no-actions-text">
                  ⏳ Waiting for teacher approval.
                </p>
            )}

            {/* Admin cannot act on final states */}
            {["Returned", "Denied", "Cancelled"].includes(currentRequest.status) && (
                <p className="RR-no-actions-text">
                  No further actions available for this request.
                </p>
            )}
          </div>

        </div>
      </div>
  );
};

export default AdminRequestReview;
