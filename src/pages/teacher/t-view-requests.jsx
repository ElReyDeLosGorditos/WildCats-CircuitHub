import React, { useEffect, useState } from "react";
import { db } from "../../firebaseconfig";
import { doc, getDoc, updateDoc, Timestamp } from "firebase/firestore";
import "../../components/css/teacher/view-request.css";

const TeacherRequestReview = ({ request: propRequest, onClose }) => {
    const [currentRequest, setCurrentRequest] = useState(propRequest || null);
    const [user, setUser] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(!currentRequest);

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

                // Get borrower profile
                if (request?.userId) {
                    const userSnap = await getDoc(doc(db, "users", request.userId));
                    if (userSnap.exists()) {
                        setUser(userSnap.data());
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

    const updateStatus = async (status) => {
        try {
            const requestRef = doc(db, "borrowRequests", currentRequest.id);
            const updateData = { status };

            if (status === "Returned") {
                updateData.returnDate = Timestamp.now();
            }

            await updateDoc(requestRef, updateData);
            setCurrentRequest(prev => ({ ...prev, ...updateData }));

            if (status === "Approved" || status === "Denied") {
                onClose();
            }

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
            <div className="TVR-overlay">
                <div className="TVR-modal" onClick={(e) => e.stopPropagation()}>
                    <p>Loading request...</p>
                </div>
            </div>
        );
    }

    if (error || !currentRequest) {
        return (
            <div className="TVR-overlay">
                <div className="TVR-modal" onClick={(e) => e.stopPropagation()}>
                    <p>{error || "No request data available."}</p>
                    <button className="TVR-close-btn" onClick={onClose}>Close</button>
                </div>
            </div>
        );
    }

    const showApproveDenyButtons = currentRequest.status === "PendingTeacher";
    const showNoActionButtons = ["PendingAdmin", "Approved", "Returned", "Denied", "Cancelled"].includes(currentRequest.status);

    /** NEW FIELDS HERE **/
    const teacherAssigned = (currentRequest.teacherAssigned || "").trim() || "—";
    const groupMembers = Array.isArray(currentRequest.groupMembers)
        ? currentRequest.groupMembers.filter(Boolean).join(", ")
        : "—";

    return (
        <div className="TVR-overlay" onClick={onClose}>
            <div className="TVR-modal" onClick={(e) => e.stopPropagation()}>

                <h2 className="TVR-title">Review Request</h2>

                <div className="TVR-section">
                    <h3 className="TVR-subtitle">Request Timeline</h3>
                    <p>
                        <strong>Created:</strong>{" "}
                        {currentRequest.createdAt?.seconds
                            ? new Date(currentRequest.createdAt.seconds * 1000).toLocaleString()
                            : "N/A"}
                    </p>
                </div>

                <div className="TVR-section">
                    <h3 className="TVR-subtitle">Borrowing Schedule</h3>
                    <p><strong>Date:</strong> {currentRequest.borrowDate}</p>
                    <p>
                        <strong>Time Slot:</strong>{" "}
                        {currentRequest.timeRange ||
                            `${currentRequest.startTime} - ${currentRequest.returnTime}`}
                    </p>
                </div>

                <div className="TVR-section">
                    <h3 className="TVR-subtitle">Request Info</h3>
                    <p><strong>Borrower:</strong> {user ? `${user.firstName} ${user.lastName}` : "Unknown"}</p>
                    <p><strong>Item(s):</strong> {renderItemNames(currentRequest)}</p>
                    <p><strong>Reason:</strong> {currentRequest.reason}</p>

                    <p>
                        <strong>Status:</strong>{" "}
                        <span
                            className={`TVR-status ${
                                currentRequest.status === "Pending-Teacher"
                                    ? "pending-teacher"
                                    : currentRequest.status === "Pending-Admin"
                                        ? "pending-admin"
                                        : currentRequest.status.toLowerCase()
                            }`}
                        >
    {currentRequest.status === "Pending-Teacher"
        ? "Pending"
        : currentRequest.status === "Pending-Admin"
            ? "Pending"
            : currentRequest.status}
</span>

                    </p>


                    {/* NEW FIELDS */}
                    <p><strong>Teacher Assigned:</strong> {teacherAssigned}</p>
                    <p><strong>Group Members:</strong> {groupMembers}</p>
                </div>

                <div className="TVR-buttons">
                    {currentRequest.status === "Pending-Teacher" && (
                        <>
                            <button
                                className="TVR-approve"
                                onClick={() => updateStatus("Pending-Admin")}
                            >
                                Approve (Send to Admin)
                            </button>

                            <button
                                className="TVR-deny"
                                onClick={() => updateStatus("Denied")}
                            >
                                Deny
                            </button>
                        </>
                    )}

                    {["Pending-Admin", "Approved", "Returned", "Denied", "Cancelled"].includes(currentRequest.status) && (
                        <p className="TVR-no-actions-text">
                            No further actions available for this request.
                        </p>
                    )}
                </div>


            </div>
        </div>
    );
};

export default TeacherRequestReview;
