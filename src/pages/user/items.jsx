import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import logo from "../../assets/circuithubLogo2.png";

import { collection, getDocs } from "firebase/firestore";
import { ref, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../firebaseconfig";
import "../../components/css/items.css"


const Items = () => {
  const [items, setItems] = useState([]);
  const [availabilityFilter, setAvailabilityFilter] = useState("available");
  const [searchQuery, setSearchQuery] = useState("");

  const location = useLocation();

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "items"));
        const fetchedItems = await Promise.all(
            querySnapshot.docs.map(async (doc) => {
              const data = doc.data();
              let imageUrl = "";

              if (data.imagePath && !data.imagePath.startsWith("http")) {
                try {
                  const imageRef = ref(storage, data.imagePath);
                  imageUrl = await getDownloadURL(imageRef);
                } catch (err) {
                  console.warn("Failed to get image URL:", err);
                }
              } else if (data.imagePath?.startsWith("http")) {
                imageUrl = data.imagePath; // Already a valid URL
              }

              return {
                id: doc.id,
                ...data,
                imageUrl, // add the download URL
              };
            })
        );

        setItems(fetchedItems);
      } catch (error) {
        console.error("Failed to fetch items or images:", error);
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
          {/* Container for logo and title - ensures they are side-by-side */}
          <div style={{ display: "flex", alignItems: "center" }}>
            <img src={logo} alt="CCS Gadget Hub Logo" />
            {/* ADDED LINE BELOW */}
            <span style={{ color: "white", fontSize: "24px", fontWeight: "bold", marginLeft: "10px", lineHeight: "1.2" }}>
            Wildcats <br /> Circuit Hub
          </span>
          </div>
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
        <div className="dashboard-container"> {/* This seems to be your main content wrapper class for this page */}
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
                      <img
                          src={item.imageUrl || "https://placehold.co/150x150?text=No+Image"}
                          alt={item.name}
                          className="item-image"
                      />

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
