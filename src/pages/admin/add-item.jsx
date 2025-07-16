import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { db, storage } from "../../firebaseconfig";
import { collection, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import "../../components/css/admin/add-item.css";

const AddItem = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [itemName, setItemName] = useState("");
  const [itemDescription, setItemDescription] = useState("");
  const [itemCondition, setItemCondition] = useState("Good");
  const [itemImage, setItemImage] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [error, setError] = useState("");

  const handleImageChange = (e) => {
    setItemImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!itemName || !itemDescription || !itemCondition) {
      setError("All fields are required.");
      return;
    }

    try {
      let imageUrl = "";
      if (itemImage) {
        const imageRef = ref(storage, `items/${Date.now()}-${itemImage.name}`);
        await uploadBytes(imageRef, itemImage);
        imageUrl = await getDownloadURL(imageRef);
      }

      await addDoc(collection(db, "items"), {
        name: itemName,
        description: itemDescription,
        condition: itemCondition,
        imagePath: imageUrl,
        status: "Available",
        createdAt: new Date(),
      });

      setShowSuccessModal(true);
      setTimeout(() => {
        setShowSuccessModal(false);
        navigate("/admin-items");
      }, 2000);
    } catch (err) {
      console.error("Error adding item:", err);
      setError("Failed to add item. Please try again.");
    }
  };

  return (
      <div className="popup-modal-overlay" onClick={() => navigate("/admin-items")}>
        <div className="popup-modal-content add-popup" onClick={(e) => e.stopPropagation()}>
          <div className="AT-card-header">
            <h2 className="AT-page-title">Add Equipment</h2>
          </div>

          <div className="AT-item-content">
            <div className="AT-image-container">
              <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="AT-file-input"
              />
              {itemImage && (
                  <img
                      src={URL.createObjectURL(itemImage)}
                      alt="Preview"
                      className="AT-equipment-image"
                  />
              )}
            </div>

            <div className="AT-info-fields">
              <form onSubmit={handleSubmit} className="AT-item-form">
                <div className="AT-field-group">
                  <label>Equipment Name</label>
                  <input
                      type="text"
                      className="AT-field-box"
                      value={itemName}
                      onChange={(e) => setItemName(e.target.value)}
                      placeholder="Enter item name..."
                  />
                </div>

                <div className="AT-field-group">
                  <label>Condition</label>
                  <select
                      className="AT-field-box"
                      value={itemCondition}
                      onChange={(e) => setItemCondition(e.target.value)}
                  >
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                    <option value="Poor">Poor</option>
                  </select>
                </div>

                <div className="AT-field-group large">
                  <label>Description</label>
                  <textarea
                      className="AT-field-box"
                      value={itemDescription}
                      onChange={(e) => setItemDescription(e.target.value)}
                      placeholder="Enter item description..."
                  />
                </div>

                <button type="submit" className="AT-submit-button">Add Item</button>
              </form>
            </div>
          </div>

          {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}
        </div>
      </div>
  );
};

export default AddItem;
