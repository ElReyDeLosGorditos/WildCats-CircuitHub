import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebaseconfig";
import logo from "../../assets/circuithubLogo2.png";
import "../../components/css/profile.css"

const navLinks = [
  { label: "Dashboard", to: "/dashboard" },
  { label: "Items", to: "/useritems" },
  { label: "My Requests", to: "/my-requests" },
  { label: "Profile", to: "/userprofile" },
];

const Profile = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const auth = getAuth();

  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    course: "",
    year: ""
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setUserData({
              firstName: data.firstName || "",
              lastName: data.lastName || "",
              email: user.email || "",
              course: data.course || "",
              year: data.year || ""
            });
          } else {
            // If user document doesn't exist, just use email from auth
            setUserData(prev => ({ ...prev, email: user.email || "" }));
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        navigate("/"); // Redirect to login if no user is authenticated
      }
    });

    return () => unsubscribe();
  }, [auth, navigate]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
      <div className="items-page"> {/* This seems to be your common page wrapper class */}
        {/* Navbar */}
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
            <button onClick={handleLogout} className="logout-link">Log Out</button>
          </div>
        </div>

        {/* Profile Content */}
        <div className="profile-page"> {/* This seems to be your main content wrapper class for this page */}
          <div className="profile-container">
            <div className="profile-info" style={{ width: "100%" }}>
              <div className="profile-edit" style={{ textAlign: "right" }}>
                <Link to="/usereditprofile"> {/* Retained your original path here */}
                  <button className="edit-btn" style={{ padding: "8px 20px", fontSize: "15px", backgroundColor: "#d96528" }}
                  >Edit Profile</button>
                </Link>
              </div>

              <h2 className="profile-name">{userData.firstName} {userData.lastName}</h2>
              <p>Student</p>

              <div className="profile-grid">
                <div>
                  <p className="profile-label">Course</p>
                  <p><strong>{userData.course}</strong></p>
                </div>
                <div>
                  <p className="profile-label">Email</p>
                  <p><strong>{userData.email}</strong></p>
                </div>
                <div>
                  <p className="profile-label">Year</p>
                  <p><strong>{userData.year}</strong></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default Profile;