import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  const [itemQuantity, setItemQuantity] = useState(1);

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
        quantity: itemQuantity,
        createdAt: new Date(),
      });

      navigate("/admin-items");
    } catch (err) {
      console.error("Error adding item:", err);
      setError("Failed to add item. Please try again.");
    }
  };

  return (
      <div className="popup-modal-overlay" onClick={() => navigate("/admin-items")}>
        <div className="popup-modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="AT-item-card">
            <button className="AT-back-button" onClick={() => navigate("/admin-items")}>←</button>
            <div className="AT-card-header">
              <h2 className="AT-page-title">Add Equipment</h2>
            </div>

            <div className="AT-item-content">
              <div className="AT-image-container">
                <label htmlFor="image-upload" className="AT-image-label">
                  {itemImage ? (
                      <img
                          src={URL.createObjectURL(itemImage)}
                          alt="Preview"
                          className="AT-equipment-image"
                      />
                  ) : (
                      <>
                        <span className="AT-image-icon">🖼️➕</span>
                        <span className="AT-image-text">Add Image</span>
                      </>
                  )}
                </label>
                <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    className="AT-file-input"
                    onChange={handleImageChange}
                />
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
              Quantity:
              <input
                  type="number"
                  value={itemQuantity}
                  onChange={(e) => setItemQuantity(parseInt(e.target.value))}
                  min={1}
                  placeholder="Enter quantity..."
                  required
              />
            </label>

            <label>
              Upload Image:
              <input type="file" accept="image/*" onChange={handleImageChange}/>
            </label>

                  <button type="submit" className="AT-submit-button">Add Item</button>
                  {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default AddItem;
