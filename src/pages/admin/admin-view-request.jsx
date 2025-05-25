import React, { useEffect, useState } from "react";
import { Link, useParams, useLocation, useNavigate } from "react-router-dom";
import logo from "../../assets/CCSGadgetHub1.png";

const AdminViewRequest = () => {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const [requestData, setRequestData] = useState(null);

    useEffect(() => {
        const dummyRequests = [
            {
                id: 1,
                borrower: "Jane Doe",
                item: "Dell Laptop",
                requestCreatedDate: "Apr 18, 2025",
                borrowDate: "Apr 22, 2025",
                borrowTime: "9:00 AM - 3:00 PM",
                reason: "Project Presentation",
                status: "Pending",
                decisionDate: null
            },
            {
                id: 2,
                borrower: "John Smith",
                item: "Macbook Air",
                requestCreatedDate: "Apr 19, 2025",
                borrowDate: "Apr 21, 2025",
                borrowTime: "10:00 AM - 2:00 PM",
                reason: "Thesis Defense",
                status: "Approved",
                decisionDate: "Apr 20, 2025"
            },
            {
                id: 3,
                borrower: "Emily Brown",
                item: "Huawei Matebook D15",
                requestCreatedDate: "Apr 18, 2025",
                borrowDate: "Apr 20, 2025",
                borrowTime: "11:00 AM - 4:00 PM",
                reason: "School Event",
                status: "Denied",
                decisionDate: "Apr 19, 2025"
            },
            {
                id: 4,
                borrower: "Michael Tan",
                item: "iPad Pro",
                requestCreatedDate: "2025-04-19",
                requestTime: "8:00 AM - 10:00 AM",
                borrowDate: "Apr 20, 2025",
                borrowTime: "11:00 AM - 4:00 PM",
                reason: "School Event",
                status: "Returned",
                decisionDate: "2025-04-20",
              }
        ];

        const foundRequest = dummyRequests.find(req => req.id === parseInt(id));
        setRequestData(foundRequest);
    }, [id]);

    const handleMarkReturned = () => {
        setRequestData(prev => ({
            ...prev,
            status: "Returned",
            decisionDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        }));
    };

    if (!requestData) {
        return <p>Loading request details...</p>;
    }

    return (
        <div className="admin-dashboard">
            {/* Navbar */}
            <div className="navbar">
                <img src={logo} alt="CCS Gadget Hub Logo" />
                <nav>
                    {[
                        { label: "Dashboard", to: "/admin-dashboard" },
                        { label: "Manage Items", to: "/admin-items" },
                        { label: "Requests", to: "/admin-requests" },
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
                    <p><strong>Date Request Was Created:</strong> {requestData.requestCreatedDate}</p>
                    {(requestData.status === "Approved" || requestData.status === "Denied" || requestData.status === "Returned") && (
                        <p><strong>
                            {requestData.status === "Approved" ? "Date of Approval:" :
                             requestData.status === "Denied" ? "Date of Denial:" : "Date of Return:"}
                        </strong> {requestData.decisionDate}</p>
                    )}

                    {/* Borrowing Schedule */}
                    <h3 className="section-header">Borrowing Schedule</h3>
                    <p><strong>Scheduled Borrow Date:</strong> {requestData.borrowDate}</p>
                    <p><strong>Scheduled Time Slot:</strong> {requestData.borrowTime}</p>

                    {/* Request Information */}
                    <h3 className="section-header">Request Information</h3>
                    <p><strong>Borrower Name:</strong> {requestData.borrower}</p>
                    <p><strong>Item Requested:</strong> {requestData.item}</p>
                    <p><strong>Reason for Borrowing:</strong> {requestData.reason}</p>

                    {/* Status */}
                    <p>
                        <strong>Current Status:</strong>{" "}
                        <span
                            style={{
                                color: (requestData.status === "Approved" || requestData.status === "Denied") ? "#E26901" :
                                       (requestData.status === "Returned" ? "#E26901" : "inherit")
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
