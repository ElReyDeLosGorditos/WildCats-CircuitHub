import React, { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebaseconfig";
import "../../components/css/admin/view-item.css";
import AdminHeader from "./AdminHeader";

const AdminViewItem = ({ id }) => {
  const [item, setItem] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

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
                src={item.imagePath?.startsWith("http") ? item.imagePath : `http://localhost:8080/${item.imagePath}`}
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
      </div>
  );
};

export default AdminViewItem;
