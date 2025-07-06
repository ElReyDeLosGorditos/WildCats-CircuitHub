import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../../assets/circuithubLogo2.png";
import "../../admin.css"; // Ensure this has the added navbar fix!

const EquipmentMaintenance = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState("maintenance");
    const [searchQuery, setSearchQuery] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [formMode, setFormMode] = useState("add");
    const [formData, setFormData] = useState({
        equipment: "",
        issue: "",
        status: "",
        date: "",
    });

    const maintenanceData = [
        {
            equipment: "Multimeter",
            issue: "Weak or Dead battery.",
            status: "In Progress",
            progress: 60,
        },
        {
            equipment: "Function Generator",
            issue: "Output Voltage Fluctuation",
            status: "Completed",
            progress: 100,
        },
    ];

    const pendingData = [
        {
            equipment: "Soldering Station",
            issue: "Heating Element Failure",
            status: "Pending Approval",
            date: "2025-03-26",
        },
    ];

    const handleOpenForm = (mode, data = null) => {
        setFormMode(mode);
        setShowForm(true);
        setFormData(
            data || {
                equipment: "",
                issue: "",
                status: "",
                date: "",
            }
        );
    };

    const handleChange = (e) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const filteredMaintenance = maintenanceData.filter((item) =>
        item.equipment.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const filteredPending = pendingData.filter((item) =>
        item.equipment.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="admin-dashboard">
            {/* Navbar */}
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

            {/* Maintenance Header */}
            <div className="admin-dashboard-container">
                <h1 className="admin-welcome">Equipment Maintenance Dashboard</h1>

                <div className="maintenance-toolbar">
                    <div className="maintenance-tabs">
                        <button
                            className={activeTab === "maintenance" ? "tab active" : "tab"}
                            onClick={() => setActiveTab("maintenance")}
                        >
                            🛠 Under Maintenance ({maintenanceData.length})
                        </button>
                        <button
                            className={activeTab === "pending" ? "tab active" : "tab"}
                            onClick={() => setActiveTab("pending")}
                        >
                            📋 Pending Requests ({pendingData.length})
                        </button>
                    </div>

                    <div className="maintenance-controls">
                        <input
                            className="admin-search-bar"
                            type="text"
                            placeholder="Search Equipment"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button className="add-item-btn" onClick={() => handleOpenForm("add")}>
                            Add Request
                        </button>
                    </div>
                </div>

                {/* Data Section */}
                <div className="maintenance-table">
                    {activeTab === "maintenance" ? (
                        <table>
                            <thead>
                            <tr>
                                <th>Equipment</th>
                                <th>Issue</th>
                                <th>Status</th>
                                <th>Actions</th>

                            </tr>
                            </thead>
                            <tbody>
                            {filteredMaintenance.map((item, index) => (
                                <tr key={index}>
                                    <td>{item.equipment}</td>
                                    <td>{item.issue}</td>
                                    <td>{item.status}</td>
                                    <td>
                                        <button
                                            className="edit-btn"
                                            onClick={() => handleOpenForm("edit", item)}
                                            style={{marginRight: "10px"}}
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            className="delete-btn"
                                            onClick={() => console.log("Delete logic here")}
                                        >
                                            🗑️
                                        </button>
                                    </td>

                                </tr>
                            ))}
                            </tbody>
                        </table>
                    ) : (
                        <table>
                            <thead>
                            <tr>
                                <th>Equipment</th>
                                <th>Issue</th>
                                <th>Status</th>
                                <th>Date Requested</th>
                                <th>Action</th>
                            </tr>
                            </thead>
                            <tbody>
                            {filteredPending.map((item, index) => (
                                <tr key={index}>
                                    <td>{item.equipment}</td>
                                    <td>{item.issue}</td>
                                    <td>{item.status}</td>
                                    <td>{item.date}</td>
                                    <td>
                                        <button
                                            className="edit-btn"
                                            onClick={() => handleOpenForm("edit", item)}
                                        >
                                            ✏️
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Form Modal */}
                {showForm && (
                    <div className="modal-overlay">
                        <div className="modal-content">

                            {/* Exit button inside the white box */}
                            <button
                                className="modal-exit-btn"
                                onClick={() => setShowForm(false)}
                            >
                                &times;
                            </button>

                            <h2 style={{ fontSize: "22px", marginBottom: "20px" }}>
                                {formMode === "add" ? "Add Maintenance Request" : "Update Maintenance Request"}
                            </h2>

                            <div className="add-item-form">
                                <label>
                                    Equipment Name
                                    <input
                                        type="text"
                                        name="equipment"
                                        value={formData.equipment}
                                        onChange={handleChange}
                                    />
                                </label>
                                <label>
                                    Issue
                                    <input
                                        type="text"
                                        name="issue"
                                        value={formData.issue}
                                        onChange={handleChange}
                                    />
                                </label>
                                <label>
                                    Status
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                    >
                                        <option value="">Select status</option>
                                        <option>Pending Approval</option>
                                        <option>In Progress</option>
                                        <option>Completed</option>
                                    </select>
                                </label>
                                <label>
                                    Date Requested
                                    <input
                                        type="date"
                                        name="date"
                                        value={formData.date}
                                        onChange={handleChange}
                                    />
                                </label>

                                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "20px" }}>
                                    {formMode === "edit" && (
                                        <button className="delete-btn" onClick={() => setShowForm(false)}>
                                            Remove
                                        </button>
                                    )}
                                    <button className="submit-btn" onClick={() => setShowForm(false)}>
                                        {formMode === "add" ? "Add" : "Update"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default EquipmentMaintenance;
