import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../firebaseconfig";
import "../../components/css/admin/admin-items.css"; // Your CSS file
import AdminHeader from "./AdminHeader";
import AdminViewItem from "./view-item.jsx";
import AddItem from "./add-item.jsx";
import AdminEditItem from "./edit-item.jsx";

const AdminManageItems = () => {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [items, setItems] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Toggle body scroll lock
  useEffect(() => {
    document.body.classList.toggle(
        "modal-open",
        selectedItem || showAddModal || editItem
    );
  }, [selectedItem, showAddModal, editItem]);

  const fetchItems = async () => {
    try {
      const snapshot = await getDocs(collection(db, "items"));
      const itemList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setItems(itemList);
    } catch (error) {
      console.error("Error fetching items:", error);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = (id) => {
    setItemToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteDoc(doc(db, "items", itemToDelete));
      setItems((prev) => prev.filter((item) => item.id !== itemToDelete));
      setShowDeleteModal(false);
      setItemToDelete(null);
    } catch (err) {
      console.error("Failed to delete item:", err);
    }
  };


  const handleDeleteFromView = () => {
    setSelectedItem(null);
    fetchItems();
  };

  const handleEditFromView = (item) => {
    setSelectedItem(null);
    setEditItem(item);
  };

  return (
      <div className="admin-items-container">
        <AdminHeader />

        {/* ✅ BLUR applies only to this wrapper */}
        <div className={`main-content-wrapper ${selectedItem || showAddModal || editItem ? "modal-blurred" : ""}`}>
          <div className="items-inventory-wrapper">
            <div className="items-inventory-container">
              <div className="items-list-section">
                <div className="inventory-header">
                  <h1 className="inventory-title">Equipment Inventory</h1>
                  <button className="add-item-btn" onClick={() => setShowAddModal(true)}>
                    Add Equipment
                  </button>
                </div>

                <div className="inventory-search-bar">
                  <input
                      type="text"
                      placeholder="Search by item name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="admin-search-bar"
                  />
                  <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="admin-filter-dropdown"
                  >
                    <option value="all">All</option>
                    <option value="Available">Available</option>
                    <option value="Borrowed">Not Available</option>
                  </select>
                </div>

                <div className="items-list">
                  {filteredItems.map((item) => (
                      <div key={item.id} className="items-card-link" onClick={() => setSelectedItem(item)}>
                        <div className="items-card">
                          <img
                              src={
                                item.imagePath?.startsWith("http")
                                    ? item.imagePath
                                    : `https://wildcats-circuithub.onrender.com${item.imagePath}`
                              }
                              alt={item.name}
                              className="items-image"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "https://via.placeholder.com/150";
                              }}
                          />
                          <div className="items-details">
                            <h3>{item.name || "Unnamed Item"}</h3>
                            <p className="items-description">{item.description || "No description provided."}</p>
                            <p className="items-quantity">Quantity: {item.quantity}</p>
                            <p className="items-condition">
                              <span className="condition-label">Condition:</span>{" "}
                              <span className={`condition-badge ${item.condition?.toLowerCase()}`}>
                                {item.condition || "N/A"}
                              </span>
                            </p>
                          </div>
                          <div className="items-status-section">
                            <p className="status-label">Borrow Status</p>
                            <p className={`items-status ${item.status?.toLowerCase()}`}>
                              {item.status === "Borrowed" ? "Not Available" : item.status}
                            </p>
                          </div>

                        </div>
                      </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Delete Modal */}
        {showDeleteModal && (
            <div className="admin-item-modal-overlay">
              <div className="admin-item-modal">
                <p className="admin-item-modal-message">Are you sure you want to delete this item?</p>
                <div className="admin-item-modal-buttons">
                  <button className="admin-item-yes-btn" onClick={confirmDelete}>Yes</button>
                  <button className="admin-item-no-btn" onClick={() => setShowDeleteModal(false)}>No</button>
                </div>
              </div>
            </div>
        )}

        {/* View Modal */}
        {selectedItem && (
            <div className="popup-modal-overlay" onClick={() => setSelectedItem(null)}>
              <div className="popup-modal-content" onClick={(e) => e.stopPropagation()}>
                <AdminViewItem 
                  id={selectedItem.id} 
                  onDelete={handleDeleteFromView}
                  onEdit={handleEditFromView}
                />
              </div>
            </div>
        )}

        {/* Add Modal */}
        {showAddModal && (
            <div className="popup-modal-overlay" onClick={() => {
              setShowAddModal(false);
              fetchItems();
            }}>
              <div className="popup-modal-content" onClick={(e) => e.stopPropagation()}>
                <AddItem closeModal={() => {
                  setShowAddModal(false);
                  fetchItems();
                }} />
              </div>
            </div>
        )}

        {/* Edit Modal */}
        {editItem && (
            <div className="popup-modal-overlay" onClick={() => {
              setEditItem(null);
              fetchItems();
            }}>
              <div className="popup-modal-content" onClick={(e) => e.stopPropagation()}>
                <AdminEditItem id={editItem.id} closeModal={() => {
                  setEditItem(null);
                  fetchItems();
                }} />
              </div>
            </div>
        )}
      </div>
  );
};

export default AdminManageItems;
