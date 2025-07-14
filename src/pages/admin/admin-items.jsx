import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import logo from "../../assets/circuithubLogo2.png";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../firebaseconfig";

const AdminManageItems = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [items, setItems] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const snapshot = await getDocs(collection(db, "items"));
        const itemList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        console.log("Fetched items:", itemList);
        setItems(itemList);
      } catch (error) {
        console.error("Error fetching items:", error);
      }
    };

    fetchItems();
  }, []);

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
        statusFilter === "all" || item.status === statusFilter;
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
      <div className="admin-dashboard">
        {/* Navbar */}
        <div className="navbar">
          <img src={logo} alt="CircuitHub Logo" />
          <nav>
            {[
              { label: "Dashboard", to: "/admin-dashboard" },
              { label: "Manage Items", to: "/admin-items" },
              { label: "Requests", to: "/admin-requests" },
              {label: "Maintenance", to: "/equipment-maintenance"},
              { label: "Manage Users", to: "/admin-users" },
            ].map((link) => (
                <Link
                    key={link.to}
                    to={link.to}
                    className={
                      location.pathname === link.to
                          ? "navbar-link active-link"
                          : "navbar-link"
                    }
                >
                  {link.label}
                </Link>
            ))}
          </nav>
          <div style={{ marginLeft: "auto" }}>
            <Link to="/" className="logout-link">Log Out</Link>
          </div>
        </div>

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
                <Link to="/add-item" className="add-item-btn">Add Equipment</Link>
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

              {/* Item List */}
              <div className="equipment-list">
                {filteredItems.map((item) => (
                    <Link
                        key={item.id}
                        to={`/view-item/${item.id}`}
                        className="equipment-card-link"
                    >
                      <div className="equipment-card">
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
                          <p className="equipment-category">{item.description}</p>
                          <p className="equipment-quantity">Quantity: {item.quantity ?? "N/A"}</p>
                        </div>
                        <div className="equipment-status-section">
                        <p className="status-label">Borrow Status</p>
                          <p className={`equipment-status ${item.status?.toLowerCase()}`}>
                            {item.status === "Borrowed" ? "Not Available" : item.status}
                          </p>
                        </div>
                        <div className="equipment-edit-icon">
                          <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault(); // Prevent link navigation
                                navigate(`/edit-item/${item.id}`);
                              }}
                          >
                            ✏️
                          </button>
                        </div>
                      </div>
                    </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Delete Modal */}
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
      </div>
  );
};

export default AdminManageItems;
