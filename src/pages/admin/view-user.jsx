import React, { useEffect, useRef } from "react";
import "../../components/css/admin/view-user.css";

const ViewUser = ({ user, onClose, onEdit }) => {
  const modalRef = useRef();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  if (!user) return null;

  return (
      <div className="VU-overlay">
        <div className="VU-modal" ref={modalRef}>
          <div className="VU-left">
            <div className="VU-image-placeholder">👤</div>
          </div>
          <div className="VU-right">
            <h2 className="VU-title">User Details</h2>
            <p><strong>Full Name:</strong> {user.firstName} {user.lastName}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Role:</strong> {user.role}</p>
            {user.role === "Student" && (
                <>
                  <p><strong>Year Level:</strong> {user.yearLevel || "N/A"}</p>
                  <p><strong>Course:</strong> {user.course || "N/A"}</p>
                </>
            )}
            <div className="VU-actions">
              <button className="VU-update-btn" onClick={() => onEdit(user)}>Update</button>
            </div>
          </div>
        </div>
      </div>
  );
};

export default ViewUser;
