import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { db } from "../../firebaseconfig";
import { doc, getDoc, setDoc } from "firebase/firestore";
import logo from "../../assets/circuithubLogo2.png";
import "../../components/css/edit-profile.css"

const navLinks = [
  { label: "Dashboard", to: "/dashboard" },
  { label: "Items", to: "/useritems" },
  { label: "My Requests", to: "/my-requests" },
  { label: "Profile", to: "/userprofile" },
];

const EditProfile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const auth = getAuth();
  const [user, setUser] = useState(null);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    course: "BSIT",
    year: "4th Year",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setForm({
            firstName: data.firstName || "",
            lastName: data.lastName || "",
            email: user.email || "",
            course: data.course || "BSIT",
            year: data.year || "4th Year",
          });
        } else {
          setForm((prev) => ({ ...prev, email: user.email }));
        }

        setLoading(false);
      } else {
        navigate("/");
      }
    });

    return () => unsubscribe();
  }, [auth, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      await setDoc(doc(db, "users", user.uid), form, { merge: true });
      navigate("/userprofile");
    } catch (err) {
      console.error("Failed to update profile:", err);
      setError("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  if (loading) return <p style={{ textAlign: "center" }}>Loading...</p>;

  return (
    <div className="edit-profile-page">
      {/* Navbar */}
      <div className="navbar">
        <img src={logo} alt="CCS Gadget Hub Logo"/>
        <span style={{color: "white", fontSize: "24px", fontWeight: "bold", marginLeft: "10px", lineHeight: "1.2"}}>
            Wildcats <br/> Circuit Hub
          </span>
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
        <div style={{marginLeft: "auto"}}>
          <button onClick={handleLogout} className="logout-link">Log Out</button>
        </div>
      </div>


      {/* Form Section */}
      <div className="profile-page">
        <div className="edit-container-card">
          <form className="edit-profile-form" onSubmit={handleSave}>
            <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Edit Profile</h2>
            {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}

            <div className="input-row">
              <label>First Name:</label>
              <input name="firstName" value={form.firstName} onChange={handleChange} required />
            </div>

            <div className="input-row">
              <label>Last Name:</label>
              <input name="lastName" value={form.lastName} onChange={handleChange} required />
            </div>

            <div className="input-row">
              <label>Email:</label>
              <input name="email" value={form.email} disabled readOnly style={{ backgroundColor: "#f0f0f0" }} />
            </div>

            <div className="input-row">
              <label>Course:</label>
              <select name="course" value={form.course} onChange={handleChange}>
                <option value="BSIT">BSIT</option>
                <option value="BSCS">BSCS</option>
                <option value="BSIS">BSIS</option>
              </select>
            </div>

            <div className="input-row">
              <label>Year:</label>
              <select name="year" value={form.year} onChange={handleChange}>
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
                <option value="5th Year">5th Year</option>
              </select>
            </div>

            <div className="edit-btn-row">
              <Link to="/userprofile" className="cancel-link">Cancel</Link>
              <button type="submit" disabled={saving} className="edit-save-btn">
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>

    </div>
  );
};

export default EditProfile;