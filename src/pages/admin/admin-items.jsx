import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import logo from "../../assets/circuithubLogo2.png";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../firebaseconfig";
import "../../components/css/admin/admin-items.css";
import AdminHeader from "./AdminHeader";
import AdminViewItem from "./view-item.jsx";
import AddItem from "./add-item.jsx"; // ✅ Add Item Modal Component

const AdminManageItems = () => {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [items, setItems] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null); // View Item Modal
  const [showAddModal, setShowAddModal] = useState(false); // ✅ Add Item Modal

  // ✅ Apply blur + lock scroll
  useEffect(() => {
    if (selectedItem || showAddModal) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }
  }, [selectedItem, showAddModal]);

  useEffect(() => {
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

  return (
      <div className={`a ${selectedItem || showAddModal ? "modal-blurred" : ""}`}>
        <AdminHeader />

        {/* Centered Container */}
        <div className="equipment-inventory-wrapper">
          <div className="equipment-inventory-container">
            {/* Left Filters */}
            <div className="equipment-category-sidebar">
              <button className="category-btn active">All</button>
            </div>

            {/* Right Content */}
            <div className="equipment-list-section">
              <div className="inventory-header">
                <h1 className="inventory-title">Equipment Inventory</h1>
                <button
                    className="add-item-btn"
                    onClick={() => setShowAddModal(true)}
                >
                  Add Equipment
                </button>
              </div>

              {/* Search Bar */}
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

              <div className="equipment-list">
                {filteredItems.map((item) => (
                    <div
                        key={item.id}
                        className="equipment-card-link"
                        onClick={() => setSelectedItem(item)} // View modal
                    >
                      <div className="qequipment-card">
                        <img
                            src={
                              item.imagePath?.startsWith("http")
                                  ? item.imagePath
                                  : `https://ccs-gadgethubb.onrender.com${item.imagePath}`
                            }
                            alt={item.name}
                            className="equipment-image"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "https://via.placeholder.com/150";
                            }}
                        />
                        <div className="equipment-details">
                          <h3>{item.name || "Unnamed Item"}</h3>
                          <p className="equipment-category">
                            {item.description || "No description provided."}
                          </p>
                          <p className="equipment-category">{item.description}</p>
                          <p className="equipment-quantity">Quantity: {item.quantity ?? "N/A"}</p>
                        </div>
                        <div className="equipment-status-section">
                          <p className="status-label">Borrow Status</p>
                          <p
                              className={`equipment-status ${
                                  item.status?.toLowerCase() || ""
                              }`}
                          >
                            {item.status === "Borrowed"
                                ? "Not Available"
                                : item.status}
                        <p className="status-label">Borrow Status</p>
                          <p className={`equipment-status ${item.status?.toLowerCase()}`}>
                            {item.status === "Borrowed" ? "Not Available" : item.status}
                          </p>
                        </div>
                        <div className="equipment-edit-icon">
                          <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/edit-item/${item.id}`);
                              }}
                          >
                            ✏️
                          </button>
                        </div>
                      </div>
                    </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ❌ Delete Modal */}
        {showDeleteModal && (
            <div className="admin-item-modal-overlay">
              <div className="admin-item-modal">
                <p className="admin-item-modal-message">
                  Are you sure you want to delete this item?
                </p>
                <div className="admin-item-modal-buttons">
                  <button className="admin-item-yes-btn" onClick={confirmDelete}>
                    Yes
                  </button>
                  <button
                      className="admin-item-no-btn"
                      onClick={() => setShowDeleteModal(false)}
                  >
                    No
                  </button>
                </div>
              </div>
            </div>
        )}

        {/* ✅ View Modal */}
        {selectedItem && (
            <div
                className="popup-modal-overlay"
                onClick={() => setSelectedItem(null)}
            >
              <div
                  className="popup-modal-content"
                  onClick={(e) => e.stopPropagation()}
              >
                <AdminViewItem id={selectedItem.id} />
              </div>
            </div>
        )}

        {/* ✅ Add Item Modal */}
        {showAddModal && (
            <div
                className="popup-modal-overlay"
                onClick={() => setShowAddModal(false)}
            >
              <div
                  className="popup-modal-content"
                  onClick={(e) => e.stopPropagation()}
              >
                <AddItem closeModal={() => setShowAddModal(false)} />
              </div>
            </div>
        )}
      </div>
  );
};

export default AdminManageItems;
