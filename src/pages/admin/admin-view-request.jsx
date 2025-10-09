// C:\Users\Xyrill\IdeaProjects\WildCats-CircuitHub\src\pages\admin\AdminViewRequest.jsx

import React, { useEffect, useState } from "react";
import { Link, useParams, useLocation, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc, Timestamp } from "firebase/firestore"; // Import updateDoc and Timestamp
import { db } from "../../firebaseconfig"; // Make sure this points to your actual Firebase config
import logo from "../../assets/circuithubLogo2.png";

const AdminViewRequest = () => {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const [requestData, setRequestData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");


    useEffect(() => {
        const fetchRequest = async () => {
            try {
                // Ensure you're fetching from 'borrowRequests', not 'requests'
                const docRef = doc(db, "borrowRequests", id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    // Convert Firestore Timestamps to Date objects for consistent handling
                    if (data.createdAt?.seconds) data.createdAt = new Date(data.createdAt.seconds * 1000);
                    if (data.decisionDate?.seconds) data.decisionDate = new Date(data.decisionDate.seconds * 1000);
                    if (data.returnDate?.seconds) data.returnDate = new Date(data.returnDate.seconds * 1000);

                    // Fetch user name if available
                    if (data.userId) {
                        const userRef = doc(db, "users", data.userId);
                        const userSnap = await getDoc(userRef);
                        if (userSnap.exists()) {
                            const userData = userSnap.data();
                            data.borrower = `${userData.firstName} ${userData.lastName}`;
                        }
                    }

                    setRequestData(data);
                } else {
                    console.log("No such request found!");
                    setError("Request not found.");
                }
            } catch (error) {
                console.error("Error fetching request:", error);
                setError("Failed to load request details.");
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchRequest();
        } else {
            setLoading(false);
            setError("No request ID provided.");
        }
    }, [id]);

    const handleMarkReturned = async () => {
        if (!requestData || requestData.status !== "Approved") return; // Only allow if approved

        try {
            const requestRef = doc(db, "borrowRequests", id);
            await updateDoc(requestRef, {
                status: "Returned",
                returnDate: Timestamp.now() // CRITICAL: Set the returnDate as a Timestamp
            });

            // Update local state after successful Firestore update
            setRequestData(prev => ({
                ...prev,
                status: "Returned",
                returnDate: new Date(), // Update local state with new Date object
                // decisionDate is not the return date, so don't overwrite it here
            }));

            alert("Request marked as Returned!");
            // Optionally navigate back or refresh parent list if needed
            // navigate("/admin-requests");

        } catch (error) {
            console.error("Error marking as returned:", error);
            alert("Failed to mark as returned. Please try again.");
        }
    };

    // Helper for formatting dates to display
    const formatDateForDisplay = (date) => {
        if (!date) return "N/A";
        // If it's a Firestore Timestamp, convert it first
        const jsDate = date.toDate ? date.toDate() : date;
        return jsDate.toLocaleString(); // Or use toLocaleDateString as per your preference
    };


    if (loading) {
        return <p>Loading request details...</p>;
    }

    if (error) {
        return <p className="error-message">{error}</p>;
    }

    if (!requestData) {
        return <p>No request data found.</p>; // Should be caught by error above, but good fallback
    }

    return (
        <div className="admin-dashboard">
            {/* Navbar remains the same */}
            <div className="navbar">
                <img src={logo} alt="CircuitHub Logo" />
                <nav>
                    {[
                        { label: "Dashboard", to: "/admin-dashboard" },
                        { label: "Manage Items", to: "/admin-items" },
                        { label: "Requests", to: "/admin-requests" },
                        { label: "Maintenance", to: "/equipment-maintenance" },
                        { label: "Manage Users", to: "/admin-users" },
                    ].map((link) => (
                        <Link
                            key={link.to}
                            to={link.to}
                            className={location.pathname === link.to ? "navbar-link active-link" : "navbar-link"}
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
                <Link to="/admin-requests" className="admin-view-back-arrow">←</Link>

                <div className="admin-view-request-details-box">
                    <h2>Request Details</h2>

                    {/* Request Timeline */}
                    <h3 className="section-header">Request Timeline</h3>
                    <p><strong>Date Request Was Created:</strong> {formatDateForDisplay(requestData.createdAt)}</p>
                    {(requestData.status === "Approved" || requestData.status === "Denied" || requestData.status === "Returned") && (
                        <p><strong>
                            {requestData.status === "Approved" ? "Date of Approval:" :
                                requestData.status === "Denied" ? "Date of Denial:" : "Date of Return:"}
                        </strong> {formatDateForDisplay(requestData.status === "Returned" ? requestData.returnDate : requestData.decisionDate)}</p>
                    )}

                    {/* Borrowing Schedule */}
                    <h3 className="section-header">Borrowing Schedule</h3>
                    <p><strong>Scheduled Borrow Date:</strong> {requestData.borrowDate}</p>
                    <p><strong>Scheduled Time Slot:</strong> {requestData.borrowTime}</p>

                    {/* Request Information */}
                    <h3 className="section-header">Request Information</h3>
                    <p><strong>Borrower Name:</strong> {requestData.borrower || "N/A"}</p>
                    <p><strong>Reason for Borrowing:</strong> {requestData.reason}</p>

                    {/* Borrowed Items */}
                    <h3 className="section-header">Borrowed Items</h3>
                    {Array.isArray(requestData.items) && requestData.items.length > 0 ? (
                        <ul style={{ paddingLeft: "20px" }}>
                            {requestData.items.map((item, index) => (
                                <li key={index}><strong>{item.name}</strong></li>
                            ))}
                        </ul>
                    ) : (
                        <p>No items listed in this request.</p>
                    )}

                    {/* Status */}
                    <p>
                        <strong>Current Status:</strong>{" "}
                        <span
                            // Consider using CSS classes for statuses instead of inline styles for maintainability
                            style={{
                                color: (requestData.status === "Approved" || requestData.status === "Denied") ? "#E26901" :
                                    (requestData.status === "Returned" ? "#E26901" : "inherit") // You might want distinct colors
                            }}
                        >
                            {requestData.status}
                        </span>
                    </p>

                    {/* Show "Mark as Returned" only if Approved */}
                    {requestData.status === "Approved" && (
                        <div style={{ marginTop: "20px" }}>
                            <button
                                className="mark-returned-btn"
                                onClick={handleMarkReturned}
                            >
                                Mark as Returned
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminViewRequest;