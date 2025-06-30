import React, { useEffect, useState } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import logo from "../../assets/circuithubLogo2.png";
import { db ,storage } from "../../firebaseconfig";
import { doc, getDoc } from "firebase/firestore";

const AdminViewItem = () => {
  const { id } = useParams(); // Now matches :id in route
  const location = useLocation();
  const [item, setItem] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItem = async () => {
      if (!id) {
        setError("Invalid item ID.");
        setLoading(false);
        return;
      }

      try {
        const itemRef = doc(db, "items", id);
        const itemSnap = await getDoc(itemRef);

        if (itemSnap.exists()) {
          setItem({ id: itemSnap.id, ...itemSnap.data() });
        } else {
          setError("Item not found.");
        }
      } catch (err) {
        console.error("Error fetching item:", err);
        setError("Failed to load item.");
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [id]);

  if (loading) {
    return (
      <div className="admin-dashboard-container">
        <p>Loading item...</p>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="admin-dashboard-container">
        <p>{error || "Item not found."}</p>
        <Link to="/admin-items" className="back-arrow">
          ← Back to Items
        </Link>
      </div>
    );
  }

  return (
      <div className="admin-dashboard">
        {/* Navbar */}
        <div className="navbar">
          <img src={logo} alt="CircuitHub Logo" />
          <nav>
            {[ /* nav links */ ].map((link) => (
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

        {/* Content */}
        <div className="equipment-wrapper">
          <div className="admin-dashboard-container">
            <div style={{ marginBottom: "20px" }}>
              <Link to="/admin-items" className="back-arrow">← Back to Items</Link>
            </div>

            <div className="equipment-card">
              <div className="equipment-image-container">
                <img
                    src={
                      item.imagePath?.startsWith("http")
                          ? item.imagePath
                          : `http://localhost:8080/${item.imagePath}`
                    }
                    alt={item.name}
                    className="equipment-image"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://via.placeholder.com/150";
                    }}
                />
              </div>

              <div className="equipment-details">
                <div className="detail-group">
                  <label>Equipment Name</label>
                  <div className="detail-box">{item.name}</div>
                </div>
                <div className="detail-group">
                  <label>Category</label>
                  <div className="detail-box">{item.description}</div>
                </div>
                <div className="detail-group">
                  <label>Condition</label>
                  <div className="detail-box">{item.condition}</div>
                </div>
                <div className="detail-group">
                  <label>Status</label>
                  <div className="detail-box">{item.status}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  );

};

export default AdminViewItem;
