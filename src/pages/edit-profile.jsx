import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import axios from "axios";
import logo from "../assets/CCSGadgetHub1.png";

const EditProfile = () => {
  const navigate = useNavigate();
  const auth = getAuth();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [program, setProgram] = useState("BSIT");
  const [yearLevel, setYearLevel] = useState("4th Year");
  const [userId, setUserId] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [profileImageUrl, setProfileImageUrl] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        setEmail(user.email);

        try {
          const idToken = await user.getIdToken();
          const response = await axios.get(
            `https://ccs-gadgethubb.onrender.com/api/users/${user.uid}/profile`,
            {
              headers: {
                Authorization: `Bearer ${idToken}`,
              },
            }
          );

          const userData = response.data;

          if (userData) {
            setFirstName(userData.firstName || "");
            setLastName(userData.lastName || "");
            setProgram(userData.course || "BSIT");
            setYearLevel(userData.year || "4th Year");

            if (userData.profileImageUrl) {
              // Bust cache with timestamp
              setProfileImageUrl(`${userData.profileImageUrl}?t=${Date.now()}`);
            }
          }

          setLoading(false);
        } catch (error) {
          console.error("Error fetching user data:", error);
          setError("Failed to load profile data");
          setLoading(false);
        }
      } else {
        navigate("/");
      }
    });

    return () => unsubscribe();
  }, [auth, navigate]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.match("image.*")) {
        setError("Please select an image file");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError("Image must be less than 5MB");
        return;
      }

      setProfileImage(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImageUrl(reader.result); // preview
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleCancel = () => {
    navigate("/profile");
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const user = auth.currentUser;
      if (!user) throw new Error("You must be logged in to update your profile");

      const idToken = await user.getIdToken();

      // Step 1: Update profile data
      const profileData = {
        uid: userId,
        firstName,
        lastName,
        course: program,
        year: yearLevel,
      };

      await axios.put(
        `https://ccs-gadgethubb.onrender.com/api/users/${userId}/profile`,
        profileData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
        }
      );

      // Step 2: Upload image if changed
      if (profileImage) {
        const formData = new FormData();
        formData.append("image", profileImage);

        const uploadRes = await axios.post(
          `hhttps://ccs-gadgethubb.onrender.com/api/users/${userId}/profile-image`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${idToken}`,
            },
          }
        );

        // Update preview with new URL + cache buster
        if (uploadRes.data.imageUrl) {
          setProfileImageUrl(`${uploadRes.data.imageUrl}?t=${Date.now()}`);
        }
      }

      navigate("/profile");
    } catch (error) {
      console.error("Error updating profile:", error);
      setError("Failed to update profile. Please try again.");
      setSaving(false);
    }
  };

  return (
    <div style={{ fontFamily: "Arial, sans-serif", backgroundColor: "#fff6e5", minHeight: "100vh" }}>
      {/* Navbar */}
      <header style={{
        backgroundColor: "#e67e22",
        padding: "15px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
      }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <img src={logo} alt="CCS Gadget Hub Logo" style={{ height: "50px", marginRight: "20px" }} />
          <nav style={{ display: "flex" }}>
            <Link to="/dashboard" style={{ color: "white", textDecoration: "none", margin: "0 15px" }}>Dashboard</Link>
            <Link to="/items" style={{ color: "white", textDecoration: "none", margin: "0 15px" }}>Items</Link>
            <Link to="/my-requests" style={{ color: "white", textDecoration: "none", margin: "0 15px" }}>My Requests</Link>
            <Link to="/profile" style={{ color: "white", textDecoration: "none", margin: "0 15px", fontWeight: "bold" }}>Profile</Link>
          </nav>
        </div>
        <button
          onClick={handleLogout}
          style={{
            background: "none",
            border: "none",
            color: "white",
            fontSize: "16px",
            cursor: "pointer"
          }}
        >
          Log Out
        </button>
      </header>

      {/* Form */}
      <div style={{ maxWidth: "800px", margin: "30px auto", padding: "0 20px" }}>
        <Link to="/profile" style={{ textDecoration: "none", color: "#e67e22", fontSize: "18px", display: "block", marginBottom: "20px" }}>
          ← Back to Profile
        </Link>

        {loading ? (
          <div style={{ textAlign: "center", padding: "50px 0" }}>
            <p>Loading profile data...</p>
          </div>
        ) : (
          <form onSubmit={handleSave} style={{ backgroundColor: "white", padding: "30px", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
            <h2 style={{ marginTop: 0, color: "#333", borderBottom: "1px solid #eee", paddingBottom: "10px", marginBottom: "25px" }}>Edit Profile</h2>

            {error && (
              <div style={{
                backgroundColor: "#ffebee",
                color: "#c62828",
                padding: "12px 15px",
                borderRadius: "4px",
                marginBottom: "20px"
              }}>
                {error}
              </div>
            )}

            <div style={{ display: "flex", flexWrap: "wrap", gap: "30px" }}>
              {/* Form Fields */}
              <div style={{ flex: "1 1 60%" }}>
                <div style={{ marginBottom: "20px" }}>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: "500", color: "#555" }}>First Name:</label>
                  <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required
                    style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ddd", fontSize: "16px" }} />
                </div>

                <div style={{ marginBottom: "20px" }}>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: "500", color: "#555" }}>Last Name:</label>
                  <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required
                    style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ddd", fontSize: "16px" }} />
                </div>

                <div style={{ marginBottom: "20px" }}>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: "500", color: "#555" }}>Email:</label>
                  <input type="email" value={email} readOnly disabled
                    style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ddd", fontSize: "16px", backgroundColor: "#f5f5f5", color: "#666" }} />
                  <small style={{ color: "#666", fontSize: "12px" }}>
                    Email cannot be changed (linked to your login account)
                  </small>
                </div>

                <div style={{ marginBottom: "20px" }}>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: "500", color: "#555" }}>Course/Program:</label>
                  <select value={program} onChange={(e) => setProgram(e.target.value)}
                    style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ddd", fontSize: "16px" }}>
                    <option value="BSIT">BSIT</option>
                    <option value="BSCS">BSCS</option>
                    <option value="BSIS">BSIS</option>
                  </select>
                </div>

                <div style={{ marginBottom: "30px" }}>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: "500", color: "#555" }}>Year Level:</label>
                  <select value={yearLevel} onChange={(e) => setYearLevel(e.target.value)}
                    style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ddd", fontSize: "16px" }}>
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                    <option value="5th Year">5th Year</option>
                  </select>
                </div>
              </div>

              {/* Image Preview & Actions */}
              <div style={{ flex: "1 1 30%", display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{
                  width: "150px", height: "150px", borderRadius: "50%", overflow: "hidden", marginBottom: "15px",
                  border: "1px solid #ddd", backgroundColor: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                  {profileImageUrl ? (
                    <img src={profileImageUrl} alt="Profile Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <div style={{ color: "#666", fontSize: "14px", textAlign: "center", padding: "10px" }}>
                      Profile Picture
                    </div>
                  )}
                </div>

                <input type="file" id="profile-image" accept="image/*" onChange={handleImageChange} style={{ display: "none" }} />
                <label htmlFor="profile-image" style={{
                  backgroundColor: "#e67e22", color: "white", padding: "8px 16px", borderRadius: "4px",
                  cursor: "pointer", display: "inline-block", marginBottom: "10px", fontSize: "14px"
                }}>
                  Change Profile Picture
                </label>

                <button type="button" onClick={handleCancel} style={{
                  backgroundColor: "#f0f0f0", border: "1px solid #ddd", borderRadius: "4px", padding: "8px 16px",
                  cursor: "pointer", marginBottom: "10px", width: "150px", fontSize: "14px"
                }}>
                  Cancel
                </button>

                <button type="submit" disabled={saving} style={{
                  backgroundColor: "#e67e22", color: "white", border: "none", borderRadius: "4px", padding: "8px 16px",
                  cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1, width: "150px", fontSize: "14px", fontWeight: "500"
                }}>
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default EditProfile;
