import React, {useEffect, useState} from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
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
        equipmentName: "",
        issue: "",
        status: "",
        date: "",
    });

    const [maintenanceData, setMaintenanceData] = useState([]);
    const [pendingData, setPendingData] = useState([]);

    const fetchMaintenanceData = () => {
        axios
            .get("http://localhost:8080/api/maintenance/all")
            .then((response) => setMaintenanceData(response.data))
            .catch((error) => console.error("Error fetching maintenance data:", error));

        axios
            .get("http://localhost:8080/api/maintenance/pending")
            .then((response) => setPendingData(response.data))
            .catch((error) => console.error("Error fetching pending data:", error));
    };

    useEffect(() => {
        fetchMaintenanceData();
    }, []);

    const handleOpenForm = (mode, data = null) => {
        setFormMode(mode);
        setShowForm(true);
        setFormData(
            data || {
                maintenanceId: "", // include this key
                equipmentName: "",
                issue: "",
                status: "",
                date: "",
            }
        );
    };

    const handleChange = (e) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Log the form data before sending
        console.log("Form Data Before Submit:", formData);

        const { equipmentName, issue, status, date } = formData;

        // 🔒 Validate required fields
        if (!equipmentName?.trim() || !issue?.trim() || !status?.trim() || !date?.trim()) {
            alert("Please fill in all fields (equipment name, issue, status, and date).");
            return;
        }

        // Create a clean object to only send 'equipmentName', 'issue', 'status', and 'date'
        const requestData = {
            maintenanceId: formData.maintenanceId,
            equipmentName,  // Map 'equipment' to 'equipmentName'
            issue,
            status,
            requestDate: date,
        };

        // Log the cleaned data that will be sent
        console.log("Data Sent to Backend:", requestData);

        if (formMode === "add") {
            // Add new maintenance request
            axios
                .post("http://localhost:8080/api/maintenance/request", requestData)
                .then((response) => {
                    alert("Maintenance request submitted successfully!");
                    fetchMaintenanceData();

                    // Push new data to maintenanceData
                    setMaintenanceData(prev => [...prev, response.data]); // <-- add to state

                    setShowForm(false);
                    setFormData({ equipmentName: "", issue: "", status: "", date: "" });
                })
                .catch((error) => {
                    alert("Failed to submit the maintenance request.");
                    console.error(error);
                });
        } else if (formMode === "edit") {
            const maintenanceId = formData.maintenanceId;
            axios
                .put(
                    `http://localhost:8080/api/maintenance/${formData.maintenanceId}/update-progress`,
                    null,
                    {
                        params: {
                            equipmentName,
                            issue,
                            status,
                            requestDate: date
                        }
                    }
                )
                .then((response) => {
                    alert("Maintenance request updated successfully!");
                    fetchMaintenanceData();
                    setShowForm(false);
                })
                .catch((error) => {
                    alert("Failed to update maintenance request.");
                    console.error(error);
                });
        }
    };

    const handleDelete = (id) => {
        // Validate that id is not null or undefined
        if (id !== undefined && id !== null) {
            axios
                .delete(`http://localhost:8080/api/maintenance/${id}`)
                .then((response) => {
                    alert("Maintenance request deleted!");
                    fetchMaintenanceData();
                    // Remove from state to update the table
                    setMaintenanceData(maintenanceData.filter((item) => item.maintenanceId !== id));
                })
                .catch((error) => {
                    alert("Failed to delete maintenance request.");
                    console.error(error);
                });
        } else {
            console.error("Invalid ID:", id);
        }
    };

    const filteredMaintenance = maintenanceData.filter((item) => {
        const equipment = (item.equipmentName || "").toLowerCase();
        const searchTerm = searchQuery ? searchQuery.toLowerCase() : '';
        return equipment.includes(searchTerm);
    });

    const filteredPending = pendingData.filter((item) => {
        const equipment = (item.equipmentName || "").toLowerCase();
        const searchTerm = searchQuery ? searchQuery.toLowerCase() : '';
        return equipment.includes(searchTerm);
    });

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
                    {/*<div className="maintenance-tabs">*/}
                    {/*    <button*/}
                    {/*        className={activeTab === "maintenance" ? "tab active" : "tab"}*/}
                    {/*        onClick={() => setActiveTab("maintenance")}*/}
                    {/*    >*/}
                    {/*        🛠 Under Maintenance ({maintenanceData.length})*/}
                    {/*    </button>*/}
                    {/*    <button*/}
                    {/*        className={activeTab === "pending" ? "tab active" : "tab"}*/}
                    {/*        onClick={() => setActiveTab("pending")}*/}
                    {/*    >*/}
                    {/*        📋 Pending Requests ({pendingData.length})*/}
                    {/*    </button>*/}
                    {/*</div>*/}

                    <div className="maintenance-controls">
                        <input
                            className="admin-search-bar"
                            type="text"
                            placeholder="Search Equipment"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button
                            className="add-item-btn"
                            style={{ marginTop: 15, marginBottom: 15 }}
                            onClick={() => handleOpenForm("add")}
                        >
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
                                    <td>{item.equipmentName}</td>
                                    <td>{item.issue}</td>
                                    <td>{item.status}</td>
                                    <td>
                                        <button
                                            className="edit-btn"
                                            onClick={() => handleOpenForm("edit", item)}
                                            style={{ marginRight: "10px" }}
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            className="delete-btn"
                                            onClick={() => handleDelete(item.maintenanceId)}
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
                                    <td>{item.equipmentName}</td>
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
                                        name="equipmentName"
                                        value={formData.equipmentName}
                                        onChange={(e) =>
                                            setFormData({...formData, equipmentName: e.target.value})
                                        }
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
                                        min={new Date().toISOString().split("T")[0]} // today
                                        max={new Date(new Date().setMonth(new Date().getMonth() + 5))
                                            .toISOString()
                                            .split("T")[0]}
                                    />
                                </label>

                                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "20px" }}>
                                    {formMode === "edit" && (
                                        <button
                                            className="submit-btn"
                                            style={{ backgroundColor: "red", padding: 15 }}
                                            onClick={() => setShowForm(false)}
                                        >
                                            Remove
                                        </button>
                                    )}
                                    {formMode === "add" ? (
                                        <button
                                            className="submit-btn"
                                            style={{
                                                padding: '15px',
                                                width: '180px',
                                                display: 'block',
                                                margin: '0 auto',
                                                marginTop: '20px',
                                            }}
                                            onClick={handleSubmit}
                                        >
                                            Add
                                        </button>
                                    ) : (
                                        <button
                                            className="submit-btn"
                                            style={{ padding: '15px' }}
                                            onClick={handleSubmit}
                                        >
                                            Update
                                        </button>
                                    )}
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