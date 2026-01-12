import React, { useEffect, useRef, useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebaseconfig";
import "../../components/css/admin/admin-user-modal.css";

const UserModal = ({ user, onClose, onDelete, onUpdated }) => {
    const modalRef = useRef();
    const [mode, setMode] = useState("view"); // view | edit
    const [formData, setFormData] = useState({ ...user });
    const [error, setError] = useState("");

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (modalRef.current && !modalRef.current.contains(e.target)) {
                onClose();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [onClose]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        const { firstName, lastName, email } = formData;
        if (!firstName || !lastName || !email) {
            setError("All fields are required.");
            return;
        }

        try {
            await updateDoc(doc(db, "users", user.id), formData);
            onUpdated();
            setMode("view");
            setError("");
        } catch (err) {
            console.error(err);
            setError("Failed to update user.");
        }
    };

    return (
        <div className="UM-overlay">
            <div className="UM-modal" ref={modalRef}>
                {error && <div className="UM-error">{error}</div>}

                <div className="UM-content">
                    {/* LEFT */}
                    <div className="UM-left">
                        <div className="UM-avatar">👤</div>
                        <p className="UM-label">
                            {mode === "view" ? "User Details" : "Edit User"}
                        </p>
                    </div>

                    {/* RIGHT */}
                    <div className="UM-right">
                        {mode === "view" ? (
                            <>
                                <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
                                <p><strong>Email:</strong> {user.email}</p>
                                <p><strong>Role:</strong> {user.role}</p>

                                {user.role === "Student" && (
                                    <>
                                        <p><strong>Year Level:</strong> {user.yearLevel || "N/A"}</p>
                                        <p><strong>Course:</strong> {user.course || "N/A"}</p>
                                    </>
                                )}

                                <div className="UM-actions">
                                    <button className="UM-edit-btn" onClick={() => setMode("edit")}>
                                        Update
                                    </button>
                                    <button className="UM-delete-btn" onClick={onDelete}>
                                        Delete
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <input
                                    name="firstName"
                                    placeholder="First Name"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                />
                                <input
                                    name="lastName"
                                    placeholder="Last Name"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                />
                                <input
                                    name="email"
                                    placeholder="Email"
                                    value={formData.email}
                                    onChange={handleChange}
                                />

                                <select name="role" value={formData.role} onChange={handleChange}>
                                    <option value="Student">Student</option>
                                    <option value="Teacher">Teacher</option>
                                    <option value="Lab_Assistant">Lab Assistant</option>
                                    <option value="Admin">Admin</option>
                                </select>

                                {formData.role === "Student" && (
                                    <>
                                        <input
                                            name="yearLevel"
                                            placeholder="Year Level"
                                            value={formData.yearLevel || ""}
                                            onChange={handleChange}
                                        />
                                        <input
                                            name="course"
                                            placeholder="Course"
                                            value={formData.course || ""}
                                            onChange={handleChange}
                                        />
                                    </>
                                )}

                                <div className="UM-actions">
                                    <button className="UM-cancel-btn" onClick={() => setMode("view")}>
                                        Cancel
                                    </button>
                                    <button className="UM-save-btn" onClick={handleSave}>
                                        Save
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserModal;
