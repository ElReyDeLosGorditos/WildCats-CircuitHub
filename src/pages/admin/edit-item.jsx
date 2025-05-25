import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import logo from "../../assets/CCSGadgetHub1.png";
import { db } from "../../firebaseconfig";
import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const AdminEditItem = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();

  const [itemName, setItemName] = useState("");
  const [itemDescription, setItemDescription] = useState("");
  const [itemCondition, setItemCondition] = useState("Good");
  const [itemStatus, setItemStatus] = useState("Available");
  const [itemImage, setItemImage] = useState(null);
  const [existingImageUrl, setExistingImageUrl] = useState("");

  // Fetch item details
  useEffect(() => {
    const fetchItem = async () => {
      try {
        const docRef = doc(db, "items", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setItemName(data.name);
          setItemDescription(data.description);
          setItemCondition(data.condition || "Good");
          setItemStatus(data.status || "Available");
          setExistingImageUrl(data.imagePath || "");
        } else {
          alert("Item not found.");
          navigate("/admin-items");
        }
      } catch (err) {
        console.error("Error fetching item:", err);
        alert("Failed to load item.");
      }
    };

    fetchItem();
  }, [id, navigate]);

  const handleImageChange = (e) => {
    setItemImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const docRef = doc(db, "items", id);
      let imageUrl = existingImageUrl;

      // If a new image is selected, upload it
      if (itemImage) {
        const imageRef = ref(storage, `uploads/${Date.now()}_${itemImage.name}`);
        await uploadBytes(imageRef, itemImage);
        imageUrl = await getDownloadURL(imageRef);
      }

      await updateDoc(docRef, {
        name: itemName,
        description: itemDescription,
        condition: itemCondition,
        status: itemStatus,
        imagePath: imageUrl,
        updatedAt: serverTimestamp(),
      });

      alert("Item updated successfully!");
      navigate("/admin-items");
    } catch (err) {
      console.error("Failed to update item:", err);
      alert("Failed to update item.");
    }
  };

  return (
    <div className="add-item-page">
      {/* Navbar */}
      <div className="navbar">
        <img src={logo} alt="CCS Gadget Hub Logo" />
        <nav>
          {[
            { label: "Dashboard", to: "/admin-dashboard" },
            { label: "Manage Items", to: "/admin-items" },
            { label: "Requests", to: "/admin-requests" },
            { label: "Manage Users", to: "/admin-users" },
          ].map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={location.pathname === link.to ? "navbar-link active-link" : "navbar-link"}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div style={{ marginLeft: "auto" }}>
          <Link to="/" className="logout-link">Log Out</Link>
        </div>
      </div>

      {/* Content */}
      <div style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}>
        <Link to="/admin-items" className="back-arrow">←</Link>
      </div>

      <div className="add-item-container">
        <h2>Edit Item</h2>

        <form className="add-item-form" onSubmit={handleSubmit}>
          <label>
            Item Name:
            <input
              type="text"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              required
            />
          </label>

          <label>
            Description:
            <textarea
              value={itemDescription}
              onChange={(e) => setItemDescription(e.target.value)}
              required
            />
          </label>

          <label>
            Condition:
            <select
              value={itemCondition}
              onChange={(e) => setItemCondition(e.target.value)}
            >
              <option value="Good">Good</option>
              <option value="Fair">Fair</option>
              <option value="Poor">Poor</option>
            </select>
          </label>

          <label>
            Status:
            <select
              value={itemStatus}
              onChange={(e) => setItemStatus(e.target.value)}
            >
              <option value="Available">Available</option>
              <option value="Borrowed">Borrowed</option>
            </select>
          </label>

          <label>
            Upload New Image:
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
          </label>

          {existingImageUrl && (
            <div style={{ marginBottom: "10px" }}>
              <strong>Current Image:</strong><br />
              <img src={existingImageUrl} alt="Current" style={{ maxWidth: "150px", marginTop: "5px" }} />
            </div>
          )}

          <button type="submit" className="submit-btn">Update Item</button>
        </form>
      </div>
    </div>
  );
};

export default AdminEditItem;
