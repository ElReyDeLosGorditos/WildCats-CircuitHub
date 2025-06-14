import React, { useState, useEffect } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebaseconfig";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import logo from "../../assets/circuithubLogo2.png";
import "../../components/css/item-details.css"

const navLinks = [
  { label: "Dashboard", to: "/dashboard" },
  { label: "Items", to: "/useritems" },
  { label: "My Requests", to: "/my-requests" },
  { label: "Profile", to: "/userprofile" },
];

const ItemDetails = () => {
  const { itemId } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const location = useLocation();

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const docRef = doc(db, "items", itemId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          // If only one imagePath exists, convert to array for Carousel compatibility
          data.images = data.images || [data.imagePath];
          setItem(data);
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
  }, [itemId]);

  if (loading) return <div>Loading...</div>;
  if (error || !item) return <div>{error || "Item not available."}</div>;

  return (
      <div className="items-page">
        {/* Navbar */}
        <div className="navbar">
          {/* Container for logo and title - ensures they are side-by-side */}
          <div style={{ display: "flex", alignItems: "center" }}>
            <img src={logo} alt="CircuitHub Logo" />
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
                    className={
                      location.pathname.replace(/\/$/, "") === link.to.replace(/\/$/, "")
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

        {/* Main Content */}
        <div className="item-details-section">
          {/* Back Arrow */}
          <Link to="/useritems" className="back-arrow">&#8592;</Link>

          {/* Image Carousel */}
          <div className="carousel-wrapper">
            <Carousel showThumbs={false}>
              {item.images && item.images.length > 0 ? ( // Added check for item.images
                  item.images.map((image, index) => (
                      <div key={index}>
                        <img
                            src={image}
                            alt={`Item ${index + 1}`}
                            style={{ height: "250px", objectFit: "contain" }} // 👈 adjust size here
                        />
                      </div>
                  ))
              ) : (
                  <div className="no-image-placeholder">No Image Available</div> // Added placeholder for no image
              )}
            </Carousel>
          </div>

          {/* Info Section */}
          <div className="details-wrapper">
            <div className="details-left">
              <h2>{item.name}</h2>
              <p className="item-description">{item.description}</p>

              <h3>Condition</h3>
              <p>
                {item.condition}
                {item.conditionDescription ? `: ${item.conditionDescription}` : ""}
              </p>
            </div>

            <div className="details-right">
              <h3>Status:</h3>
              <p className={`status-text ${item.status === "Available" ? "available" : "not-available"}`}>
                {item.status === "Available" ? "Available" : "Not Available"}
              </p>

              {item.status === "Available" ? (
                  <Link to={`/borrow/${itemId}`} className="borrow-btn">Borrow Item</Link>
              ) : (
                  <button disabled className="borrow-btn not-available-btn">Not Available</button>
              )}
            </div>
          </div>
        </div>
      </div>
  );
};

export default ItemDetails;