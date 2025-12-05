import React, { useEffect, useState } from "react";
import { Link, useLocation, useParams, useNavigate } from "react-router-dom";
import logo from "../../assets/circuithubLogo2.png";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebaseconfig";
import "../../components/css/view-request.css"; // Your CSS file import

const navLinks = [
  { label: "Dashboard", to: "/dashboard" },
  { label: "Items", to: "/useritems" },
  { label: "My Requests", to: "/my-requests" },
  { label: "Profile", to: "/userprofile" },
];

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
      setRequestData((prev) => ({ ...prev, status: "Cancelled" }));
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
        day: "numeric",
      });
    } catch {
      return value;
    }
  };

  if (loading)
    return (
        <div className="view-request-page-scope">
          <div className="dashboard-container">
            <p>Loading...</p>
          </div>
        </div>
    );

  if (error || !requestData) {
    return (
        <div className="view-request-page-scope">
          <div className="dashboard-container">
            <p>{error || "Request not found."}</p>
            <Link to="/my-requests" className="back-arrow">
              ← Back to My Requests
            </Link>
          </div>
        </div>
    );
  }

  // Safely derive item list text
  const itemList =
      Array.isArray(requestData.items) && requestData.items.length > 0
          ? requestData.items.map((it) => it.name).join(", ")
          : requestData.itemName || "N/A";

  // NEW: derive teacher/group fields with safe fallbacks
  const teacherAssigned = (requestData.teacherAssigned || "").trim() || "—";
  const groupMembers = Array.isArray(requestData.groupMembers)
      ? requestData.groupMembers.filter(Boolean).join(", ")
      : "—";

  return (
      <div className="items-page view-request-page-scope">
        {/* Navbar */}
        <div className="navbar">
          <img src={logo} alt="CCS Gadget Hub Logo" />
          <nav>
            {navLinks.map((link) => (
                <Link
                    key={link.to}
                    to={link.to}
                    className={
                      location.pathname === link.to
                          ? "navbar-link active-link"
                          : "navbar-link"
                    }
                >
                  {link.label}
                </Link>
            ))}
          </nav>
          <div style={{ marginLeft: "auto" }}>
            <Link to="/" className="logout-link">
              Log Out
            </Link>
          </div>
        </div>

        <div className="dashboard-container">
          <Link to="/my-requests" className="back-arrow">
            ←
          </Link>
          <h2 className="featured-title">Request Summary</h2>

          {/* Summary grid */}
          <div className="request-summary-box">
            {/* Column 1: Items */}
            <div>
              <strong>Items Borrowed:</strong>
              <ul className="item-list-display">
                {Array.isArray(requestData.items) && requestData.items.length > 0 ? (
                    requestData.items.map((item, idx) => <li key={idx}>{item.name}</li>)
                ) : requestData.itemName ? (
                    <li>{requestData.itemName}</li>
                ) : (
                    <li>N/A</li>
                )}
              </ul>
            </div>

            {/* Column 2: Status & Dates */}
            <div>
              <p>
                <strong>Status:</strong>{" "}
                <span className={`status-badge ${requestData.status?.toLowerCase()}`}>
                {requestData.status}
              </span>
                {requestData.status === "Returned" && requestData.isLate && (
                    <span style={{
                      display: "inline-block",
                      marginLeft: "8px",
                      padding: "3px 10px",
                      backgroundColor: "#fff3cd",
                      color: "#856404",
                      borderRadius: "12px",
                      fontSize: "13px",
                      fontWeight: "600"
                    }}>
                      ⚠️ Late Return
                    </span>
                )}
              </p>
              <p>
                <strong>Request Date:</strong> {formatDate(requestData.borrowDate)}
              </p>
              <p>
                <strong>Time Slot:</strong>{" "}
                {requestData.timeRange ||
                    `${requestData.startTime || "-"} - ${requestData.returnTime || "-"}`}
              </p>
              <p>
                <strong>Returned Date & Time:</strong>{" "}
                {requestData.status?.toLowerCase() === "returned" &&
                requestData.returnDate?.seconds
                    ? new Date(requestData.returnDate.seconds * 1000).toLocaleString()
                    : "-"}
              </p>
              {requestData.status === "Returned" && requestData.isLate && (
                  <p style={{
                    color: "#856404",
                    backgroundColor: "#fff3cd",
                    padding: "10px",
                    borderRadius: "5px",
                    marginTop: "10px"
                  }}>
                    <strong>Late by:</strong> {requestData.daysLate} day{requestData.daysLate !== 1 ? 's' : ''}
                    {requestData.lateReturnNotes && (
                        <>
                          <br/>
                          <strong>Notes:</strong> {requestData.lateReturnNotes}
                        </>
                    )}
                  </p>
              )}
            </div>

            {/* Reason (spans full width) */}
            <div className="reason-for-borrowing">
              <strong>Reason for Borrowing:</strong>
              <p>{requestData.reason || "No reason provided."}</p>
            </div>

            {/* NEW: Teacher & Group (spans full width) */}
            <div className="reason-for-borrowing">
              <strong>Teacher Assigned:</strong>
              <p>{teacherAssigned}</p>
              <strong>Group Members:</strong>
              <p>{groupMembers}</p>
            </div>
          </div>

          {/* Cancel only when Pending */}
          {requestData.status?.toLowerCase() === "pending" && (
              <>
                <button className="cancel-btn" onClick={handleCancel}>
                  Cancel Request
                </button>
                {showCancelModal && (
                    <div className="modal-overlay">
                      <div className="modal-box">
                        <p>Are you sure you want to cancel this request?</p>
                        <div className="modal-actions">
                          <button className="yes-btn" onClick={confirmCancel}>
                            Yes
                          </button>
                          <button className="no-btn" onClick={() => setShowCancelModal(false)}>
                            No
                          </button>
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
