import React, { useState, useEffect } from "react";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db, auth } from "../../firebaseconfig";
import axios from "axios";
import "../../components/css/admin/add-request.css";

const AddRequest = ({ onClose }) => {
  const [users, setUsers] = useState([]);
  const [items, setItems] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [formData, setFormData] = useState({
    borrowerId: "",
    items: [{ itemId: "", quantity: 1 }],
    borrowDate: "",
    startTime: "",
    returnTime: "",
    reason: "",
    teacherId: "",
    status: "Pending-Teacher"
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchItems();
    fetchTeachers();
  }, []);

  const fetchUsers = async () => {
    try {
      const snapshot = await getDocs(collection(db, "users"));
      const userList = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(user => user.role === "Student");
      setUsers(userList);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchItems = async () => {
    try {
      const snapshot = await getDocs(collection(db, "items"));
      const itemList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setItems(itemList);
    } catch (error) {
      console.error("Error fetching items:", error);
    }
  };

  const fetchTeachers = async () => {
    try {
      const snapshot = await getDocs(collection(db, "users"));
      const teacherList = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(user => user.role === "Teacher" || user.role === "Faculty");
      setTeachers(teacherList);
    } catch (error) {
      console.error("Error fetching teachers:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items];
    updatedItems[index][field] = field === "quantity" ? parseInt(value) || 1 : value;
    setFormData(prev => ({ ...prev, items: updatedItems }));
  };

  const addItemRow = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { itemId: "", quantity: 1 }]
    }));
  };

  const removeItemRow = (index) => {
    if (formData.items.length > 1) {
      const updatedItems = formData.items.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, items: updatedItems }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Validate
      if (!formData.borrowerId || !formData.borrowDate || !formData.startTime || 
          !formData.returnTime || !formData.reason) {
        setError("All fields are required.");
        setLoading(false);
        return;
      }

      if (formData.items.some(item => !item.itemId || item.quantity < 1)) {
        setError("Please select items and valid quantities.");
        setLoading(false);
        return;
      }

      // Get borrower info
      const borrowerDoc = await getDoc(doc(db, "users", formData.borrowerId));
      const borrowerData = borrowerDoc.data();

      // Get item details
      const itemsWithDetails = await Promise.all(
        formData.items.map(async (item) => {
          const itemDoc = await getDoc(doc(db, "items", item.itemId));
          const itemData = itemDoc.data();
          return {
            itemId: item.itemId,
            name: itemData?.name || "Unknown Item",
            quantity: item.quantity,
            imagePath: itemData?.imagePath || ""
          };
        })
      );

      // Get teacher info if selected
      let teacherName = null;
      if (formData.teacherId) {
        const teacherDoc = await getDoc(doc(db, "users", formData.teacherId));
        const teacherData = teacherDoc.data();
        teacherName = `${teacherData.firstName} ${teacherData.lastName}`;
      }

      // Create request object
      const requestData = {
        borrowerId: formData.borrowerId,
        borrowerName: `${borrowerData.firstName} ${borrowerData.lastName}`,
        items: itemsWithDetails,
        borrowDate: formData.borrowDate,
        startTime: formData.startTime,
        returnTime: formData.returnTime,
        timeRange: `${formData.startTime} - ${formData.returnTime}`,
        reason: formData.reason,
        status: formData.status,
        teacherId: formData.teacherId || null,
        teacherName: teacherName,
        createdAt: { seconds: Math.floor(Date.now() / 1000) }
      };

      // Submit to backend
      const token = await auth.currentUser?.getIdToken();
      await axios.post(
        "https://wildcats-circuithub.onrender.com/api/requests",
        requestData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );

      onClose(true);
    } catch (err) {
      console.error("Failed to create request:", err);
      setError(err.response?.data?.error || "Failed to create request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="AddR-overlay" onClick={() => onClose(false)}>
      <div className="AddR-modal" onClick={(e) => e.stopPropagation()}>
        <div className="AddR-header">
          <h2>Create Borrow Request</h2>
        </div>

        <form onSubmit={handleSubmit} className="AddR-form">
          {error && <div className="AddR-error">{error}</div>}

          <div className="AddR-field">
            <label>Borrower *</label>
            <select
              name="borrowerId"
              value={formData.borrowerId}
              onChange={handleChange}
              required
            >
              <option value="">Select Student</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.firstName} {user.lastName} ({user.email})
                </option>
              ))}
            </select>
          </div>

          <div className="AddR-items-section">
            <label>Items to Borrow *</label>
            {formData.items.map((item, index) => (
              <div key={index} className="AddR-item-row">
                <select
                  value={item.itemId}
                  onChange={(e) => handleItemChange(index, "itemId", e.target.value)}
                  required
                  className="AddR-item-select"
                >
                  <option value="">Select Item</option>
                  {items.map(itm => (
                    <option key={itm.id} value={itm.id}>
                      {itm.name} (Available: {itm.quantity || 0})
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                  placeholder="Qty"
                  className="AddR-qty-input"
                  required
                />
                {formData.items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItemRow(index)}
                    className="AddR-remove-btn"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={addItemRow} className="AddR-add-item-btn">
              + Add Another Item
            </button>
          </div>

          <div className="AddR-field">
            <label>Borrow Date *</label>
            <input
              type="date"
              name="borrowDate"
              value={formData.borrowDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="AddR-field-row">
            <div className="AddR-field">
              <label>Start Time *</label>
              <input
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                required
              />
            </div>

            <div className="AddR-field">
              <label>Return Time *</label>
              <input
                type="time"
                name="returnTime"
                value={formData.returnTime}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="AddR-field">
            <label>Reason for Borrowing *</label>
            <textarea
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              rows="4"
              required
              placeholder="Enter reason for borrowing..."
            />
          </div>

          <div className="AddR-field">
            <label>Assign Teacher (Optional)</label>
            <select
              name="teacherId"
              value={formData.teacherId}
              onChange={handleChange}
            >
              <option value="">None (Pending)</option>
              {teachers.map(teacher => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.firstName} {teacher.lastName}
                </option>
              ))}
            </select>
          </div>

          <div className="AddR-field">
            <label>Initial Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="Pending-Teacher">Pending (Teacher)</option>
              <option value="Pending-Admin">Pending (Admin)</option>
              <option value="Approved">Approved</option>
            </select>
          </div>

          <div className="AddR-buttons">
            <button
              type="button"
              className="AddR-cancel-btn"
              onClick={() => onClose(false)}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="AddR-save-btn"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddRequest;
