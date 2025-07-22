import React, { useState } from "react";
import { db, storage } from "../../firebaseconfig";
import { collection, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import "../../components/css/admin/add-item.css";

const AddItem = ({ closeModal }) => {
  const [itemName, setItemName] = useState("");
  const [itemDescription, setItemDescription] = useState("");
  const [itemCondition, setItemCondition] = useState("Good");
  const [itemImage, setItemImage] = useState(null);
  const [itemQuantity, setItemQuantity] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    setItemImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError("");

    if (!itemName || !itemDescription || !itemCondition || !itemQuantity) {
      setError("All fields are required.");
      return;
    }

    setLoading(true);

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

      closeModal();
    } catch (err) {
      console.error("Error adding item:", err);
      setError("Failed to add item. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="popup-modal-overlay" onClick={closeModal}>
        <div className="popup-modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="add-item-card">
            <h2 className="add-item-title">Add Equipment</h2>

            {/* Image Upload Area */}
            <div className="image-upload-wrapper">
              <label htmlFor="image-upload" className="image-upload-box">
                {itemImage ? (
                    <img
                        src={URL.createObjectURL(itemImage)}
                        alt="Preview"
                        className="image-preview"
                    />
                ) : (
                    <>
                      <div className="upload-icon">📷</div>
                      <div className="upload-text">Click or Drag to Upload</div>
                    </>
                )}
              </label>
              <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  className="file-input"
                  onChange={handleImageChange}
              />
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="add-item-form">
              {error && <p className="form-error">{error}</p>}

              {/* Item Name */}
              <label className="form-label">Item Name</label>
              <input
                  type="text"
                  placeholder="Enter item name"
                  className="form-input"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
              />

              {/* Description */}
              <label className="form-label">Description</label>
              <textarea
                  placeholder="Enter description"
                  className="form-textarea"
                  value={itemDescription}
                  onChange={(e) => setItemDescription(e.target.value)}
              />

              {/* Condition */}
              <label className="form-label">Condition</label>
              <select
                  className="form-input"
                  value={itemCondition}
                  onChange={(e) => setItemCondition(e.target.value)}
              >
                <option value="">Select Condition</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Poor">Poor</option>
              </select>

              {/* Quantity */}
              <label className="form-label">Quantity</label>
              <input
                  type="number"
                  min={1}
                  className="form-input"
                  placeholder="Enter quantity"
                  value={itemQuantity}
                  onChange={(e) => setItemQuantity(parseInt(e.target.value))}
              />

              {/* Submit */}
              <button type="submit" className="form-button" disabled={loading}>
                {loading ? "Adding..." : "Add Item"}
              </button>
            </form>

          </div>
        </div>
      </div>
  );
}

export default AddItem;
