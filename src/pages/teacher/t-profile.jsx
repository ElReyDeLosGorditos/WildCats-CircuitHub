import React, { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebaseconfig";
import "../../components/css/teacher/tprofile.css";

const TeacherProfile = ({ teacherId }) => {
    const [teacher, setTeacher] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTeacher = async () => {
            try {
                const ref = doc(db, "users", teacherId);
                const snap = await getDoc(ref);
                if (snap.exists()) setTeacher(snap.data());
            } catch (err) {
                console.error("Error fetching teacher:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchTeacher();
    }, [teacherId]);

    if (loading) return <div className="TP-loading">Loading profile...</div>;

    if (!teacher)
        return <div className="TP-error">Teacher profile not found.</div>;

    return (
        <div className="TP-container">
            <div className="TP-card">
                <div className="TP-header">
                    <img
                        src={
                            teacher.profileImageUrl ||
                            "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                        }
                        alt="Profile"
                        className="TP-avatar"
                    />
                    <div className="TP-name-section">
                        <h1 className="TP-name">{teacher.firstName} {teacher.lastName}</h1>
                        <p className="TP-role">Teacher • {teacher.department || "No Dept."}</p>
                    </div>
                </div>

                <div className="TP-divider" />

                <div className="TP-info-grid">
                    <div className="TP-info-box">
                        <h3>Email</h3>
                        <p>{teacher.email}</p>
                    </div>
                    <div className="TP-info-box">
                        <h3>Employee ID</h3>
                        <p>{teacher.employeeId || "N/A"}</p>
                    </div>
                    <div className="TP-info-box">
                        <h3>Department</h3>
                        <p>{teacher.department || "N/A"}</p>
                    </div>
                    <div className="TP-info-box">
                        <h3>Account Created</h3>
                        <p>{teacher.createdAt || "Unknown"}</p>
                    </div>
                    <div className="TP-info-box">
                        <h3>Late Returns</h3>
                        <p>{teacher.lateReturnCount || 0}</p>
                    </div>
                    <div className="TP-info-box">
                        <h3>Last Late Return</h3>
                        <p>{teacher.lastLateReturnDate || "None"}</p>
                    </div>
                </div>

                <div className="TP-footer">
                    <button className="TP-edit-btn">Edit Profile</button>
                    <button className="TP-message-btn">Message</button>
                </div>
            </div>
        </div>
    );
};

export default TeacherProfile;
