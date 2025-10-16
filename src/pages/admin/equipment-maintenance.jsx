import React, {useEffect, useState} from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import logo from "../../assets/circuithubLogo2.png";
import AdminHeader from "./AdminHeader";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../firebaseconfig";
import "../../components/css/admin/equipment-maintenance.css";

const EquipmentMaintenance = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const [filteredSuggestions, setFilteredSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [items, setItems] = useState([]);
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
        const fetchItems = async () => {
            try {
                const snapshot = await getDocs(collection(db, "items"));
                const itemList = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setItems(itemList);
            } catch (error) {
                console.error("Error fetching items:", error);
            }
        };

        fetchItems();
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
        const { name, value } = e.target;

        setFormData((prev) => ({ ...prev, [name]: value }));

        if (name === "equipmentName") {
            const input = value.toLowerCase().trim();
            let suggestions = [];

            if (input.length === 0) {
                // Show only 3 top items when input is empty
                suggestions = items.slice(0, 3);
            } else if (input.length >= 3) {
                // Filter and limit to 3 results
                suggestions = items
                    .filter((item) =>
                        item.name.toLowerCase().includes(input)
                    )
                    .slice(0, 3);
            }

            setFilteredSuggestions(suggestions);
            setShowSuggestions(true);
        }
    };

    const handleSuggestionClick = (name) => {
        setFormData((prev) => ({ ...prev, equipmentName: name }));
        setShowSuggestions(false);
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

        const isValidEquipment = items.some((item) => item.name === equipmentName);
        if (!isValidEquipment) {
            alert("Please select a valid equipment name from the list.");
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
        // Changes made:
// - Changed all classNames to start with EM-
// - Updated modal, buttons, input fields, table

        <div className="EM-dashboard">
            <AdminHeader />

            <div className="EM-container">
                <h1 className="EM-title">Equipment Maintenance Dashboard</h1>

                <div className="EM-toolbar">
                    <div className="EM-controls">
                        <input
                            className="EM-search"
                            type="text"
                            placeholder="Search Equipment"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button className="EM-add-btn" onClick={() => handleOpenForm("add")}>
                            Add Request
                        </button>
                    </div>
                </div>

                <div className="EM-table">
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
                                        className="EM-edit-btn"
                                        onClick={() => handleOpenForm("edit", item)}
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        className="EM-delete-btn"
                                        onClick={() => handleDelete(item.maintenanceId)}
                                    >
                                        🗑️
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

                {showForm && (
                    <div className="EM-modal-overlay">
                        <div className="EM-modal-content">
                            <button className="EM-close-btn" onClick={() => setShowForm(false)}>
                                &times;
                            </button>
                            <h2 className="EM-modal-title">
                                {formMode === "add" ? "Add Maintenance Request" : "Update Maintenance Request"}
                            </h2>

                            <div className="EM-form">
                                <div className="EM-autocomplete">
                                    <input
                                        type="text"
                                        name="equipmentName"
                                        placeholder="Equipment Name"
                                        value={formData.equipmentName}
                                        onChange={handleChange}
                                        onFocus={() => {
                                            if (formData.equipmentName.trim() === "") {
                                                setFilteredSuggestions(items.slice(0, 4));
                                                setShowSuggestions(true);
                                            }
                                        }}
                                        onBlur={() => {
                                            // Delay hiding to allow click to register
                                            setTimeout(() => setShowSuggestions(false), 100);
                                        }}
                                    />
                                    {showSuggestions && filteredSuggestions.length > 0 && (
                                        <div className="EM-suggestion-container">
                                            {filteredSuggestions.map((item) => (
                                                <div
                                                    key={item.id}
                                                    className="EM-suggestion-item"
                                                    onMouseDown={() => handleSuggestionClick(item.name)}
                                                >
                                                    {item.name}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <input
                                    type="text"
                                    name="issue"
                                    placeholder="Issue"
                                    value={formData.issue}
                                    onChange={handleChange}
                                />
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
                                <input
                                    type="date"
                                    name="date"
                                    value={formData.date}
                                    onChange={handleChange}
                                    min={new Date().toISOString().split("T")[0]}
                                    max={new Date(new Date().setMonth(new Date().getMonth() + 5))
                                        .toISOString()
                                        .split("T")[0]}
                                />

                                <div className="EM-form-buttons">
                                    {formMode === "edit" && (
                                        <button className="EM-remove-btn" onClick={() => setShowForm(false)}>
                                            Remove
                                        </button>
                                    )}
                                    <button className="EM-submit-btn" onClick={handleSubmit}>
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