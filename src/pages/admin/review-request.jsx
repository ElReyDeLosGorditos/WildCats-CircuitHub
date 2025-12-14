import React, { useEffect, useState } from "react";
import { db } from "../../firebaseconfig";
import { doc, getDoc, updateDoc, deleteDoc, Timestamp, increment } from "firebase/firestore";
import "../../components/css/admin/review-request.css";

const AdminRequestReview = ({ request: propRequest, onClose }) => {

  const [currentRequest, setCurrentRequest] = useState(propRequest || null);
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(!currentRequest);
  const [teacher, setTeacher] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Late return modal state
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [isLateReturn, setIsLateReturn] = useState(false);
  const [daysLate, setDaysLate] = useState(0);
  const [hoursLate, setHoursLate] = useState(0);
  const [lateReturnNotes, setLateReturnNotes] = useState("");

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

        // Fetch teacher profile
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
        }, 500);
      }
    } catch (err) {
      console.error("❌ Status update failed:", err);
      setError("Failed to update request status.");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteDoc(doc(db, "borrowRequests", currentRequest.id));
      setShowDeleteConfirm(false);
      onClose();
    } catch (err) {
      console.error("Failed to delete request:", err);
      setError("Failed to delete request.");
    }
  };

  // Calculate if return is late
  const calculateLateReturn = () => {
    if (!currentRequest.borrowDate || !currentRequest.returnTime) {
      return { isLate: false, daysLate: 0, hoursLate: 0 };
    }

    try {
      const borrowDateObj = new Date(currentRequest.borrowDate);
      
      const returnTimeParts = currentRequest.returnTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (returnTimeParts) {
        let hours = parseInt(returnTimeParts[1]);
        const minutes = parseInt(returnTimeParts[2]);
        const meridiem = returnTimeParts[3].toUpperCase();
        
        if (meridiem === "PM" && hours !== 12) hours += 12;
        if (meridiem === "AM" && hours === 12) hours = 0;
        
        borrowDateObj.setHours(hours, minutes, 0, 0);
      }
      
      const now = new Date();
      const diffMs = now - borrowDateObj;
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const remainingHours = diffHours % 24;
      
      const isLate = diffHours > 1;
      
      return { 
        isLate, 
        daysLate: Math.max(0, diffDays),
        hoursLate: Math.max(0, diffHours),
        remainingHours: Math.max(0, remainingHours)
      };
    } catch (err) {
      console.error("Error calculating late return:", err);
      return { isLate: false, daysLate: 0, hoursLate: 0, remainingHours: 0 };
    }
  };

  const handleReturnClick = () => {
    const lateInfo = calculateLateReturn();
    setIsLateReturn(lateInfo.isLate);
    setDaysLate(lateInfo.daysLate);
    setHoursLate(lateInfo.hoursLate);
    setShowReturnModal(true);
  };

  const confirmReturn = async () => {
    try {
      console.log("Processing return...");
      
      const requestRef = doc(db, "borrowRequests", currentRequest.id);
      const updateData = {
        status: "Returned",
        returnDate: Timestamp.now(),
        isLate: isLateReturn,
        daysLate: daysLate,
        hoursLate: hoursLate,
        lateReturnNotes: lateReturnNotes || ""
      };

      await updateDoc(requestRef, updateData);
      console.log("✅ Request marked as returned");

      if (isLateReturn && currentRequest.userId) {
        console.log("Updating user late return count...");
        const userRef = doc(db, "users", currentRequest.userId);
        
        await updateDoc(userRef, {
          lateReturnCount: increment(1),
          lastLateReturnDate: new Date().toISOString()
        });
        
        console.log("✅ User late return count updated");
      }

      setShowReturnModal(false);
      setCurrentRequest(prev => ({ ...prev, ...updateData }));
      
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (err) {
      console.error("❌ Failed to process return:", err);
      setError("Failed to process return. Please try again.");
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
      <>
      <div className="RR-overlay" onClick={onClose}>
        <div className="RR-modal" onClick={(e) => e.stopPropagation()}>
          <div className="RR-header-with-actions">
            <h2 className="RR-title">Review Request</h2>
            <button 
              className="RR-delete-btn-header"
              onClick={() => setShowDeleteConfirm(true)}
              title="Delete Request"
            >
              🗑️
            </button>
          </div>

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

            <p><strong>Teacher In-Charge: </strong>
              {teacher
                  ? `${teacher.firstName} ${teacher.lastName}`
                  : currentRequest.teacherName || "N/A"}
            </p>

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

            {currentRequest.status === "Approved" && (
                <button
                    className="RR-return"
                    onClick={handleReturnClick}
                >
                  Mark as Returned
                </button>
            )}

            {currentRequest.status === "Pending-Teacher" && (
                <p className="RR-no-actions-text">
                  ⏳ Waiting for teacher approval.
                </p>
            )}

            {["Returned", "Denied", "Cancelled"].includes(currentRequest.status) && (
                <p className="RR-no-actions-text">
                  No further actions available for this request.
                </p>
            )}
          </div>

        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="RR-overlay" style={{ zIndex: 10001 }}>
          <div className="RR-modal RR-delete-confirm-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete this request? This action cannot be undone.</p>
            <div className="RR-delete-confirm-buttons">
              <button 
                className="RR-cancel-delete-btn" 
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
              <button 
                className="RR-confirm-delete-btn" 
                onClick={handleDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Return Modal */}
      {showReturnModal && (
        <div className="RR-overlay" style={{ zIndex: 10000 }}>
          <div className="RR-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "500px" }}>
            <h2 className="RR-title">Confirm Return</h2>

            {isLateReturn && (
              <div style={{
                backgroundColor: "#fff3cd",
                border: "1px solid #ffc107",
                borderRadius: "8px",
                padding: "15px",
                marginBottom: "20px"
              }}>
                <h3 style={{ color: "#856404", marginTop: 0, marginBottom: "10px", fontSize: "16px" }}>
                  ⚠️ Late Return Detected
                </h3>
                <p style={{ color: "#856404", margin: 0, fontSize: "14px" }}>
                  This item is being returned <strong>
                  {daysLate > 0 && `${daysLate} day${daysLate !== 1 ? 's' : ''}`}
                  {daysLate > 0 && hoursLate % 24 > 0 && ' and '}
                  {hoursLate % 24 > 0 && `${hoursLate % 24} hour${hoursLate % 24 !== 1 ? 's' : ''}`}
                  {daysLate === 0 && hoursLate % 24 === 0 && `${hoursLate} hour${hoursLate !== 1 ? 's' : ''}`}
                  </strong> late.
                  <br/>
                  The student's late return count will be incremented.
                </p>
              </div>
            )}

            {!isLateReturn && (
              <div style={{
                backgroundColor: "#d4edda",
                border: "1px solid #28a745",
                borderRadius: "8px",
                padding: "15px",
                marginBottom: "20px"
              }}>
                <p style={{ color: "#155724", margin: 0, fontSize: "14px" }}>
                  ✅ On-time return
                </p>
              </div>
            )}

            <div style={{ marginBottom: "20px" }}>
              <p style={{ marginBottom: "10px", fontWeight: "600" }}>
                Return Details:
              </p>
              <p style={{ fontSize: "14px", marginBottom: "5px" }}>
                <strong>Borrower:</strong> {user ? `${user.firstName} ${user.lastName}` : "Unknown"}
              </p>
              <p style={{ fontSize: "14px", marginBottom: "5px" }}>
                <strong>Item(s):</strong> {renderItemNames(currentRequest)}
              </p>
              <p style={{ fontSize: "14px", marginBottom: "5px" }}>
                <strong>Expected Return:</strong> {currentRequest.returnTime || "N/A"}
              </p>
              <p style={{ fontSize: "14px", marginBottom: "5px" }}>
                <strong>Actual Return:</strong> {new Date().toLocaleString()}
              </p>
            </div>

            {isLateReturn && (
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>
                  Notes (optional):
                </label>
                <textarea
                  value={lateReturnNotes}
                  onChange={(e) => setLateReturnNotes(e.target.value)}
                  placeholder="Add any notes about the late return (reason, condition, etc.)..."
                  rows="3"
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "5px",
                    border: "1px solid #ccc",
                    fontSize: "14px",
                    fontFamily: "inherit",
                    resize: "vertical"
                  }}
                />
              </div>
            )}

            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button
                onClick={() => setShowReturnModal(false)}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#6c757d",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                  fontSize: "14px"
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmReturn}
                style={{
                  padding: "10px 20px",
                  backgroundColor: isLateReturn ? "#ffc107" : "#28a745",
                  color: isLateReturn ? "#000" : "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "600"
                }}
              >
                Confirm Return
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminRequestReview;
