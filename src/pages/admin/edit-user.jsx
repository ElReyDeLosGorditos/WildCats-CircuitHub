import React, { useEffect, useRef, useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebaseconfig";
import "../../components/css/admin/edit-user.css";

const UpdateUser = ({ user, onClose }) => {
    const modalRef = useRef();
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

    const handleUpdate = async () => {
        const { firstName, lastName, email } = formData;
        if (!firstName || !lastName || !email) {
            setError("All fields are required.");
            return;
        }
        try {
            const userRef = doc(db, "users", formData.id);
            await updateDoc(userRef, formData);
            onClose();
        } catch (err) {
            console.error("Update failed:", err);
            setError("Failed to update user.");
        }
    };

    return (
        <div className="UU-overlay">
            <div className="UU-modal" ref={modalRef}>
                {error && <div className="UU-error">{error}</div>}
                <div className="UU-content">
                    <div className="UU-left">
                        <div className="UU-icon-preview">👤</div>
                        <p className="UU-label">Edit User</p>
                    </div>
                    <div className="UU-right">
                        <div className="UU-form">
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
                                <option value="Faculty">Faculty</option>
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

                            <div className="UU-btn-row">
                                <button className="UU-cancel-btn" onClick={onClose}>Cancel</button>
                                <button className="UU-save-btn" onClick={handleUpdate}>Save</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UpdateUser;
