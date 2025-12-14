import React, { useEffect, useState } from "react";
import { doc, getDoc, deleteDoc } from "firebase/firestore";
import { db } from "../../firebaseconfig";
import "../../components/css/admin/view-item.css";
import AdminHeader from "./AdminHeader";

const AdminViewItem = ({ id, onDelete, onEdit }) => {
  const [item, setItem] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const itemRef = doc(db, "items", id);
        const itemSnap = await getDoc(itemRef);
        if (itemSnap.exists()) {
          setItem({ id: itemSnap.id, ...itemSnap.data() });
        } else {
          setError("Item not found.");
        }
      } catch (err) {
        console.error("Error fetching item:", err);
        setError("Failed to load item.");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchItem();
  }, [id]);

  const handleDelete = async () => {
    try {
      await deleteDoc(doc(db, "items", id));
      setShowDeleteConfirm(false);
      if (onDelete) onDelete();
    } catch (err) {
      console.error("Error deleting item:", err);
      setError("Failed to delete item.");
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error || !item) return <p>{error || "Item not found"}</p>;

  return (
      <div className="admin-items-item-card">
        <div className="admin-items-card-header">
          <h2 className="admin-items-page-title">Equipment Details</h2>
        </div>

        <div className="admin-items-item-content">
          <div className="admin-items-image-container">
            <img
                src={item.imagePath?.startsWith("http") ? item.imagePath : `https://wildcats-circuithub.onrender.com${item.imagePath}`}
                alt={item.name}
                className="admin-items-equipment-image"
                onError={(e) => { e.target.src = "https://via.placeholder.com/150"; }}
            />
          </div>

          <div className="admin-items-info-fields">
            <div className="admin-items-field-group">
              <label>Equipment Name</label>
              <div className="admin-items-field-box">{item.name}</div>
            </div>
            <div className="admin-items-field-group">
              <label>Condition</label>
              <div className="admin-items-field-box">{item.condition}</div>
            </div>
            <div className="admin-items-field-group">
              <label>Quantity</label>
              <div className="admin-items-field-box">{item.quantity}</div>
            </div>
            <div className="admin-items-field-group large">
              <label>Description</label>
              <div className="admin-items-field-box">{item.description}</div>
            </div>
          </div>
        </div>

        <div className="admin-items-button-group">
          <button className="admin-items-edit-btn" onClick={() => onEdit && onEdit(item)}>
            ✏️ Edit
          </button>
          <button className="admin-items-delete-btn" onClick={() => setShowDeleteConfirm(true)}>
            🗑️ Delete
          </button>
        </div>

        {showDeleteConfirm && (
          <div className="admin-items-delete-confirm-modal">
            <div className="admin-items-delete-confirm-content">
              <h3>Confirm Delete</h3>
              <p>Are you sure you want to delete "{item.name}"? This action cannot be undone.</p>
              <div className="admin-items-delete-confirm-buttons">
                <button className="admin-items-cancel-btn" onClick={() => setShowDeleteConfirm(false)}>
                  Cancel
                </button>
                <button className="admin-items-confirm-delete-btn" onClick={handleDelete}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
  );
};

export default AdminViewItem;
