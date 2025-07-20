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
  const [loading, setLoading] = useState(false); // <-- Loading state

  const handleImageChange = (e) => {
    setItemImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return; // prevent multiple clicks
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

      // ✅ Close modal on success
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
          <div className="AT-item-card">
            <div className="AT-card-header">
              <h2 className="AT-page-title">Add Equipment</h2>
            </div>

            <div className="AT-item-content">
              {/* Image Section */}
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

              {/* Form Section */}
              <div className="AT-info-fields">
                <form onSubmit={handleSubmit} className="AT-item-form">
                  {error && <p className="AT-error-slide">{error}</p>}

                  <div className="AT-field-group">
                    <input
                        type="text"
                        className="AT-field-box"
                        value={itemName}
                        onChange={(e) => setItemName(e.target.value)}
                        placeholder="Item name..."
                    />
                  </div>

                  <div className="AT-field-group large">
                  <textarea
                      className="AT-field-box AT-description-scroll"
                      value={itemDescription}
                      onChange={(e) => setItemDescription(e.target.value)}
                      placeholder="Description..."
                  />
                  </div>

                  <div className="AT-field-group">
                    <select
                        className="AT-field-box"
                        value={itemCondition}
                        onChange={(e) => setItemCondition(e.target.value)}
                    >
                      <option value="">Condition...</option>
                      <option value="Good">Good</option>
                      <option value="Fair">Fair</option>
                      <option value="Poor">Poor</option>
                    </select>
                  </div>

                  <div className="AT-field-group">
                    <input
                        type="number"
                        className="AT-field-box"
                        value={itemQuantity}
                        onChange={(e) => setItemQuantity(parseInt(e.target.value))}
                        min={1}
                        placeholder="Quantity..."
                    />
                  </div>

                  <button type="submit" className="AT-submit-button" disabled={loading}>
                    {loading ? "Adding..." : "Add Item"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default AddItem;
