import React, { useEffect, useState } from "react";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../firebaseconfig";
import "../../components/css/admin/edit-item.css";

const AdminEditItem = ({ id, closeModal }) => {
  const [itemName, setItemName] = useState("");
  const [itemDescription, setItemDescription] = useState("");
  const [itemCondition, setItemCondition] = useState("Good");
  const [itemStatus, setItemStatus] = useState("Available");
  const [itemImage, setItemImage] = useState(null);
  const [existingImageUrl, setExistingImageUrl] = useState("");
  const [itemQuantity, setItemQuantity] = useState(1);
  const [error, setError] = useState("");

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
          setItemQuantity(data.quantity || 1);
        } else {
          setError("Item not found.");
        }
      } catch (err) {
        console.error("Error fetching item:", err);
        setError("Failed to load item.");
      }
    };

    fetchItem();
  }, [id]);

  const handleImageChange = (e) => {
    setItemImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const docRef = doc(db, "items", id);
      let imageUrl = existingImageUrl;

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
        quantity: itemQuantity,
        imagePath: imageUrl,
        updatedAt: serverTimestamp(),
      });

      closeModal(); // Close on submit
    } catch (err) {
      console.error("Failed to update item:", err);
      setError("Failed to update item.");
    }
  };

  return (
      <div className="EI-item-card">
        <div className="EI-card-header">
          <h2 className="EI-page-title">Edit Equipment</h2>
        </div>
        <div className="EI-item-content">
          <div className="EI-image-container">
            <label htmlFor="fileInput" className="EI-image-label">
              {itemImage || existingImageUrl ? (
                  <img
                      src={
                        itemImage
                            ? URL.createObjectURL(itemImage)
                            : existingImageUrl
                      }
                      alt="Item"
                      className="EI-equipment-image"
                  />
              ) : (
                  <>
                    <span className="EI-image-icon">📷</span>
                    <span>Click to upload</span>
                  </>
              )}
              <input
                  id="fileInput"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="EI-file-input"
              />
            </label>
          </div>

          <div className="EI-info-fields">
            <form className="EI-item-form" onSubmit={handleSubmit}>
              {error && <div className="EI-error-slide">{error}</div>}

              <div className="EI-field-group">
                <input
                    className="EI-field-box"
                    type="text"
                    placeholder="Item Name"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    required
                />
              </div>

              <div className="EI-field-group large">
              <textarea
                  className="EI-field-box"
                  placeholder="Description"
                  value={itemDescription}
                  onChange={(e) => setItemDescription(e.target.value)}
                  required
              />
              </div>

              <div className="EI-field-group">
                <select
                    className="EI-field-box"
                    value={itemCondition}
                    onChange={(e) => setItemCondition(e.target.value)}
                >
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                  <option value="Poor">Poor</option>
                </select>
              </div>

              <div className="EI-field-group">
                <input
                    className="EI-field-box"
                    type="number"
                    value={itemQuantity}
                    onChange={(e) => setItemQuantity(parseInt(e.target.value))}
                    min={1}
                    placeholder="Quantity"
                    required
                />
              </div>

              <div className="EI-field-group">
                <select
                    className="EI-field-box"
                    value={itemStatus}
                    onChange={(e) => setItemStatus(e.target.value)}
                >
                  <option value="Available">Available</option>
                  <option value="Borrowed">Borrowed</option>
                </select>
              </div>

              <button type="submit" className="EI-submit-button">
                Save
              </button>
            </form>
          </div>
        </div>
      </div>
  );
};

export default AdminEditItem;
