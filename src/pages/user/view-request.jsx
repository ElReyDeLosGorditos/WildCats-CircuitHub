import React, { useEffect, useState } from "react";
import { Link, useLocation, useParams, useNavigate } from "react-router-dom";
import logo from "../../assets/CCSGadgetHub1.png";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebaseconfig";

const ViewRequest = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [requestData, setRequestData] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        const docRef = doc(db, "borrowRequests", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setRequestData({ id: docSnap.id, ...docSnap.data() });
        } else {
          setError("Request not found.");
        }
      } catch (err) {
        console.error("Failed to fetch request:", err);
        setError("Error loading request.");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchRequest();
  }, [id]);

  const handleCancel = () => {
    setShowCancelModal(true);
  };

  const confirmCancel = async () => {
    try {
      const requestRef = doc(db, "borrowRequests", id);
      await updateDoc(requestRef, { status: "Cancelled" });
      setRequestData(prev => ({ ...prev, status: "Cancelled" }));
      setShowCancelModal(false);
      alert("Request has been cancelled.");
      navigate("/my-requests");
    } catch (err) {
      console.error("Failed to cancel request:", err);
      alert("Failed to cancel request.");
    }
  };

  const formatDateTime = (value) => {
    if (!value) return "-";
    try {
      if (value.toDate) return value.toDate().toLocaleString();
      return new Date(value).toLocaleString();
    } catch {
      return value;
    }
  };

  const formatDate = (value) => {
    if (!value) return "-";
    try {
      return new Date(value).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric"
      });
    } catch {
      return value;
    }
  };

  if (loading) return <div className="dashboard-container"><p>Loading...</p></div>;

  if (error || !requestData) {
    return (
      <div className="dashboard-container">
        <p>{error || "Request not found."}</p>
        <Link to="/my-requests" className="back-arrow">← Back to My Requests</Link>
      </div>
    );
  }

  return (
    <div className="items-page">
      <div className="navbar">
        <img src={logo} alt="CCS Gadget Hub Logo" />
        <nav>
          {["Dashboard", "Items", "My Requests", "Profile"].map((label) => (
            <Link
              key={label}
              to={`/${label.toLowerCase().replace(" ", "")}`}
              className={location.pathname === `/${label.toLowerCase().replace(" ", "")}` ? "navbar-link active-link" : "navbar-link"}
            >
              {label}
            </Link>
          ))}
        </nav>
        <div style={{ marginLeft: "auto" }}>
          <Link to="/" className="logout-link">Log Out</Link>
        </div>
      </div>

      <div className="dashboard-container">
        <Link to="/my-requests" className="back-arrow">←</Link>
        <h2 className="featured-title">Request Summary</h2>

        <div className="request-summary-box">
          <p><strong>Item:</strong> {requestData.itemName}</p>
          <p><strong>Status:</strong> <span className={`status-badge ${requestData.status?.toLowerCase()}`}>{requestData.status}</span></p>
          <p><strong>Request Date:</strong> {formatDate(requestData.borrowDate)}</p>
          <p><strong>Time Slot:</strong> {requestData.timeRange || `${requestData.startTime} - ${requestData.returnTime}`}</p>
          <p><strong>Returned Date & Time:</strong> 
  {requestData.status?.toLowerCase() === "returned" && requestData.borrowDate && requestData.returnTime
    ? new Date(`${requestData.borrowDate} ${requestData.returnTime}`).toLocaleString()
    : "-" }
</p>

          <p><strong>Reason for Borrowing:</strong> {requestData.reason}</p>
        </div>

        {requestData.status?.toLowerCase() === "pending" && (
          <>
            <button className="cancel-btn" onClick={handleCancel}>Cancel Request</button>
            {showCancelModal && (
              <div className="modal-overlay">
                <div className="modal-box">
                  <p>Are you sure you want to cancel this request?</p>
                  <div className="modal-actions">
                    <button className="yes-btn" onClick={confirmCancel}>Yes</button>
                    <button className="no-btn" onClick={() => setShowCancelModal(false)}>No</button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ViewRequest;
