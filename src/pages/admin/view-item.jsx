import React, { useEffect, useState } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import { db ,storage } from "../../firebaseconfig";
import { doc, getDoc } from "firebase/firestore";
import "../../components/css/admin/view-item.css";
import AdminHeader from "./AdminHeader"; // ✅ corrected path

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
      <div className="vt-item-card">
        <div className="vt-card-header">
          <h2 className="vt-page-title">Equipment Details</h2>
        </div>

        <div className="vt-item-content">
          <div className="vt-image-container">
            <img
                src={item.imagePath?.startsWith("http") ? item.imagePath : `http://localhost:8080/${item.imagePath}`}
                alt={item.name}
                className="vt-equipment-image"
                onError={(e) => { e.target.src = "https://via.placeholder.com/150"; }}
            />
          </div>
          <div className="vt-info-fields">
            <div className="vt-field-group">
              <label>Equipment Name</label>
              <div className="vt-field-box">{item.name}</div>
            </div>
            <div className="vt-field-group">
              <label>Condition</label>
              <div className="vt-field-box">{item.condition}</div>
            </div>
            <div className="vt-field-group large">
              <label>Description</label>
              <div className="vt-field-box">{item.description}</div>
            </div>
          </div>
        </div>
      </div>
  );

};

export default AdminViewItem;
