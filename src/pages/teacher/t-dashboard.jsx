import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import logo from "../../assets/circuithubLogo2.png";
import "../../components/css/teacher/tdashboard.css";
import { auth } from "../../firebaseconfig";
import TeacherHeader from "./t-header.jsx";
import AdminHeader from "../admin/AdminHeader.jsx";

const TeacherDashboard = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const [pendingRequests, setPendingRequests] = useState([]);
    const [approvedCount, setApprovedCount] = useState(0);
    const [recentApprovals, setRecentApprovals] = useState([]);

    const currentUser = auth.currentUser;

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            // Fetch pending requests for the teacher
            const pendingRes = await axios.get("http://localhost:8080/api/requests/pending-teacher");
            setPendingRequests(pendingRes.data);

            // Fetch approved count
            const approvedRes = await axios.get("http://localhost:8080/api/requests/approved-teacher");
            setApprovedCount(approvedRes.data.length);

            // Fetch recent approvals
            const recentRes = await axios.get("http://localhost:8080/api/requests/recent-teacher");
            setRecentApprovals(recentRes.data.slice(0, 3));
        } catch (error) {
            console.error("Error fetching teacher dashboard data:", error);
        }
    };

    const approveRequest = async (requestId) => {
        try {
            await axios.put(`http://localhost:8080/api/requests/${requestId}/teacher-approve`, {
                teacherId: currentUser?.uid || "unknown",
                teacherName: currentUser?.displayName || "Unnamed Teacher",
            });
            fetchDashboardData();
        } catch (error) {
            console.error("Error approving request:", error);
        }
    };

    const navLinks = [
        { label: "Dashboard", to: "/teacher-dashboard" },
        { label: "Borrow Requests", to: "/t-requests" },
        { label: "Items", to: "/teacher-items" },
    ];

    return (
        <div className="tdb-dashboard">
            {/* Navigation bar */}
            <TeacherHeader />

            {/* Dashboard contents */}
            <div className="tdb-dashboard-container">
                <h1 className="tdb-welcome">Welcome back, Teacher!</h1>
                <p className="tdb-subtext">Here’s your request approval summary.</p>

                {/* Stats cards */}
                <div className="tdb-cards">
                    <div className="tdb-card">
                        <h3>{pendingRequests.length}</h3>
                        <p>Pending Requests</p>
                    </div>
                    <div className="tdb-card">
                        <h3>{approvedCount}</h3>
                        <p>Approved Requests</p>
                    </div>
                </div>

                {/* Columns: recent approvals + pending requests */}
                <div className="tdb-columns">
                    {/* Recent Approvals */}
                    <div className="tdb-activity-box">
                        <h3>Recent Approvals</h3>
                        <ul style={{ listStyleType: "none", padding: 0, margin: 0 }}>
                            {recentApprovals.length > 0 ? (
                                recentApprovals.map((log) => (
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
                                        <div>
                                            {log.borrowerName} - {log.itemName}
                                        </div>
                                        <div style={{ color: "#888", fontSize: "0.85em" }}>
                                            {log.approvalDate || "N/A"}
                                        </div>
                                    </li>
                                ))
                            ) : (
                                <p>No recent approvals.</p>
                            )}
                        </ul>
                    </div>

                    {/* Pending Approvals */}
                    <div className="tdb-pending-box">
                        <h3>Pending Approvals</h3>
                        {pendingRequests.length > 0 ? (
                            pendingRequests.map((req) => (
                                <div key={req.id} className="tdb-pending-request">
                                    <p>
                                        <strong>{req.itemName}</strong> — {req.borrowerName} ({req.borrowerCourse}{" "}
                                        {req.borrowerYear})
                                    </p>
                                    <p>Room: {req.roomNumber}</p>
                                    <div className="tdb-review-btn-row">
                                        <button
                                            className="tdb-review-request-btn"
                                            onClick={() => approveRequest(req.id)}
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

    );
};

export default TeacherDashboard;
