import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../components/css/teacher/tdashboard.css";

import { auth, db } from "../../firebaseconfig";
import {
    collection,
    getDocs,
    doc,
    getDoc,
    query,
    where,
} from "firebase/firestore";

import TeacherHeader from "./t-header.jsx";

const TeacherDashboard = () => {
    const navigate = useNavigate();

    const [pendingRequests, setPendingRequests] = useState([]);
    const [approvedRequests, setApprovedRequests] = useState([]);
    const [recentActivities, setRecentActivities] = useState([]);

    const currentUser = auth.currentUser; // logged-in teacher

    useEffect(() => {
        if (currentUser) {
            fetchDashboardData();
        }
    }, [currentUser]);

    // ------------------------------------------------------------
    // FETCH DATA (Firebase version, matches TeacherRequests logic)
    // ------------------------------------------------------------
    const fetchDashboardData = async () => {
        try {
            const snapshot = await getDocs(collection(db, "borrowRequests"));

            let fetched = await Promise.all(
                snapshot.docs.map(async (docSnap) => {
                    const data = { id: docSnap.id, ...docSnap.data() };

                    // Fetch borrower name
                    if (data.userId) {
                        try {
                            const userRef = doc(db, "users", data.userId);
                            const userSnap = await getDoc(userRef);
                            if (userSnap.exists()) {
                                const userData = userSnap.data();
                                data.borrowerName = `${userData.firstName} ${userData.lastName}`;
                            }
                        } catch (err) {
                            console.error("Borrower fetch error:", err);
                        }
                    }

                    return data;
                })
            );

            // Filter only requests belonging to this teacher
            fetched = fetched.filter(
                (req) => req.teacherId === currentUser?.uid
            );

            // Separate pending and approved
            const pending = fetched.filter(
                (req) => req.status === "Pending-Teacher"
            );

            const approved = fetched.filter(
                (req) => req.status === "Pending-Admin"
            );

            setPendingRequests(pending);
            setApprovedRequests(approved);

            // ---------------------------------------
            // RECENT ACTIVITY = recently approved requests
            // ---------------------------------------
            const recent = approved
                .slice(0, 3)
                .map((req) => ({
                    id: req.id,
                    text: `${req.borrowerName} was approved to borrow ${req.itemName}`,
                    date: req.approvalDate || "N/A",
                }));

            setRecentActivities(recent);
        } catch (error) {
            console.error("Teacher Dashboard Firestore error:", error);
        }
    };

    // ------------------------------------------------------------
    // TEACHER APPROVAL
    // ------------------------------------------------------------
    const approveRequest = async (requestId) => {
        try {
            const reqRef = doc(db, "borrowRequests", requestId);

            await updateDoc(reqRef, {
                status: "Pending-Admin",
                teacherId: currentUser?.uid,
                teacherName: currentUser?.displayName || "Unnamed Teacher",
                approvalDate: new Date(),
            });

            fetchDashboardData();
        } catch (err) {
            console.error("Teacher approval error:", err);
        }
    };

    const handleCardClick = (path) => {
        navigate(path);
    };

    return (
        <div className="tdb-dashboard">
            <TeacherHeader />

            {/* DESKTOP UI (only shows on ≥ 769px) */}
            <div className="tdb-desktop">
                <div className="tdb-dashboard-container">
                    <h1 className="tdb-welcome">Welcome back, Teacher!</h1>
                    <p className="tdb-subtext">
                        Here’s an overview of your request activity.
                    </p>

                    {/* Dashboard Cards */}
                    <div className="tdb-cards">
                        <div
                            className="tdb-card clickable"
                            onClick={() => handleCardClick("/t-requests")}
                        >
                            <h3>{pendingRequests.length}</h3>
                            <p>Pending Requests</p>
                        </div>

                        <div
                            className="tdb-card clickable"
                            onClick={() => handleCardClick("/t-requests")}
                        >
                            <h3>{approvedRequests.length}</h3>
                            <p>Approved Requests</p>
                        </div>
                    </div>

                    {/* Columns */}
                    <div className="tdb-columns">
                        <div
                            className="tdb-activity-box clickable"
                            onClick={() => handleCardClick("/t-requests")}
                        >
                            <h3>Recent Activity</h3>

                            <ul style={{ listStyleType: "none", padding: 0, margin: 0 }}>
                                {recentActivities.length > 0 ? (
                                    recentActivities.map((log) => (
                                        <li
                                            key={log.id}
                                            className="tdb-activity-item"
                                        >
                                            <div>{log.text}</div>
                                            <div className="tdb-activity-date">{log.date}</div>
                                        </li>
                                    ))
                                ) : (
                                    <p>No recent activity.</p>
                                )}
                            </ul>
                        </div>

                        <div
                            className="tdb-pending-box clickable"
                            onClick={() => handleCardClick("/t-requests")}
                        >
                            <h3>Pending Approvals</h3>

                            {pendingRequests.length > 0 ? (
                                pendingRequests.map((req) => (
                                    <div key={req.id} className="tdb-pending-request">
                                        <p>
                                            <strong>{req.itemName}</strong> - {req.borrowerName}
                                        </p>
                                        <p>Room: {req.roomNumber}</p>

                                        <div className="tdb-review-btn-row">
                                            <button
                                                className="tdb-review-request-btn"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    approveRequest(req.id);
                                                }}
                                            >
                                                Approve
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

            {/* =====================================================
            📱 MOBILE UI VERSION (only shows ≤ 768px)
      ======================================================= */}
            <div className="tdb-mobile">
                <div className="tdb-mobile-header">
                    <h2>Teacher Dashboard</h2>
                </div>

                {/* MOBILE CARDS */}
                <div className="tdb-mobile-cards">
                    <div
                        className="tdb-mobile-card"
                        onClick={() => handleCardClick("/t-requests")}
                    >
                        <span className="tdb-mobile-count">{pendingRequests.length}</span>
                        <span className="tdb-mobile-label">Pending</span>
                    </div>

                    <div
                        className="tdb-mobile-card"
                        onClick={() => handleCardClick("/t-requests")}
                    >
                        <span className="tdb-mobile-count">{approvedRequests.length}</span>
                        <span className="tdb-mobile-label">Approved</span>
                    </div>
                </div>

                {/* MOBILE LISTS */}
                <div className="tdb-mobile-section">
                    <h3>Recent Activity</h3>
                    <div className="tdb-mobile-list">
                        {recentActivities.length ? (
                            recentActivities.map((log) => (
                                <div key={log.id} className="tdb-mobile-item">
                                    <div className="tdb-mobile-item-text">{log.text}</div>
                                    <div className="tdb-mobile-item-date">{log.date}</div>
                                </div>
                            ))
                        ) : (
                            <p className="tdb-mobile-empty">No activity.</p>
                        )}
                    </div>
                </div>

                <div className="tdb-mobile-section">
                    <h3>Pending Approvals</h3>
                    <div className="tdb-mobile-list">
                        {pendingRequests.length ? (
                            pendingRequests.map((req) => (
                                <div key={req.id} className="tdb-mobile-item">
                                    <div>
                                        <strong>{req.itemName}</strong>
                                        <div className="tdb-mobile-sub">{req.borrowerName}</div>
                                        <div className="tdb-mobile-sub">Room {req.roomNumber}</div>
                                    </div>

                                    <button
                                        className="tdb-mobile-approve"
                                        onClick={() => approveRequest(req.id)}
                                    >
                                        Approve
                                    </button>
                                </div>
                            ))
                        ) : (
                            <p className="tdb-mobile-empty">No pending requests.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

};

export default TeacherDashboard;
