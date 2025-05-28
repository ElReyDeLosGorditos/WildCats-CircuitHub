import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import logo from "../../assets/circuithubLogo2.png";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebaseconfig";

const Items = () => {
  const [items, setItems] = useState([]);
  const [availabilityFilter, setAvailabilityFilter] = useState("available");
  const [searchQuery, setSearchQuery] = useState("");

  const location = useLocation();

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "items"));
        const fetchedItems = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setItems(fetchedItems);
      } catch (error) {
        console.error("Failed to fetch items from Firestore:", error);
      }
    };

    fetchItems();
  }, []);

  const navLinks = [
    { label: "Dashboard", to: "/dashboard" },
    { label: "Items", to: "/useritems" },
    { label: "My Requests", to: "/my-requests" },
    { label: "Profile", to: "/userprofile" },
  ];

  const filteredItems = items.filter((item) => {
    const matchesAvailability =
      availabilityFilter === "all" ||
      (availabilityFilter === "available" && item.status === "Available") ||
      (availabilityFilter === "not-available" && item.status !== "Available");

    const matchesSearch = item.name
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase());

    return matchesAvailability && matchesSearch;
  });

  return (
    <div className="items-page">
      {/* Navigation Bar */}
      <div className="navbar">
        <img src={logo} alt="CCS Gadget Hub Logo" />
        <nav>
          {navLinks.map((link) => (
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

      {/* Main Content */}
      <div className="dashboard-container">
        <h2 className="featured-title">Items</h2>

        {/* 🔍 Search Bar */}
        <div className="search-bar" style={{ marginBottom: "15px" }}>
          <input
            type="text"
            placeholder="Search by item name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              padding: "8px 12px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              width: "370px",
            }}
          />
        </div>

        {/* Filters */}
        <div className="filter-container" style={{ marginBottom: "20px" }}>
          <label>
            Status:
            <select
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value)}
              style={{ marginLeft: "8px" }}
            >
              <option value="all">All</option>
              <option value="available">Available</option>
              <option value="not-available">Not Available</option>
            </select>
          </label>
        </div>

        {/* Laptop Grid */}
        <div className="items-grid">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <div key={item.id} className="item-box">
                <img src={item.imagePath} alt={item.name} className="item-image" />
                <h3>{item.name}</h3>
                <p className="item-status">
                  {item.status === "Available" ? "Available" : "Not Available"}
                </p>
                <Link to={`/useritem-details/${item.id}`} className="item-details-btn">
                  View Details
                </Link>
              </div>
            ))
          ) : (
            <p>No items found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Items;
