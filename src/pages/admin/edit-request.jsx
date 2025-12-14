import React, { useState, useEffect } from "react";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../../firebaseconfig";
import "../../components/css/admin/edit-request.css";

const EditRequest = ({ request, onClose }) => {
  const [formData, setFormData] = useState({
    reason: request.reason || "",
    status: request.status || "Pending-Teacher",
    borrowDate: request.borrowDate || "",
    startTime: request.startTime || "",
    returnTime: request.returnTime || ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const requestRef = doc(db, "borrowRequests", request.id);
      await updateDoc(requestRef, {
        reason: formData.reason,
        status: formData.status,
        borrowDate: formData.borrowDate,
        startTime: formData.startTime,
        returnTime: formData.returnTime,
        timeRange: `${formData.startTime} - ${formData.returnTime}`,
        updatedAt: new Date()
      });

      onClose(true); // Pass true to indicate success
    } catch (err) {
      console.error("Failed to update request:", err);
      setError("Failed to update request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ER-overlay" onClick={() => onClose(false)}>
      <div className="ER-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ER-header">
          <h2>Edit Request</h2>
        </div>

        <form onSubmit={handleSubmit} className="ER-form">
          {error && <div className="ER-error">{error}</div>}

          <div className="ER-field">
            <label>Borrow Date</label>
            <input
              type="date"
              name="borrowDate"
              value={formData.borrowDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="ER-field-row">
            <div className="ER-field">
              <label>Start Time</label>
              <input
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                required
              />
            </div>

            <div className="ER-field">
              <label>Return Time</label>
              <input
                type="time"
                name="returnTime"
                value={formData.returnTime}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="ER-field">
            <label>Reason</label>
            <textarea
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              rows="4"
              required
              placeholder="Enter reason for borrowing..."
            />
          </div>

          <div className="ER-field">
            <label>Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
            >
              <option value="Pending-Teacher">Pending (Teacher)</option>
              <option value="Pending-Admin">Pending (Admin)</option>
              <option value="Approved">Approved</option>
              <option value="Denied">Denied</option>
              <option value="Returned">Returned</option>
            </select>
          </div>

          <div className="ER-buttons">
            <button
              type="button"
              className="ER-cancel-btn"
              onClick={() => onClose(false)}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="ER-save-btn"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditRequest;
