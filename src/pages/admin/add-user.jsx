import React, { useRef, useState, useEffect } from "react";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { db, auth } from "../../firebaseconfig";
import "../../components/css/admin/add-user.css";

const AddUser = ({ onClose }) => {
  const modalRef = useRef();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "Student",
    yearLevel: "",
    course: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { firstName, lastName, email, password, role, yearLevel, course } = formData;

    // Validation
    if (!firstName || !lastName || !email || !password || !role) {
      setError("All fields are required.");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }

    if (role === "Student" && (!yearLevel || !course)) {
      setError("Year Level and Course are required for students.");
      setLoading(false);
      return;
    }

    try {
      // Check if email already exists in Firestore
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        setError("A user with this email already exists.");
        setLoading(false);
        return;
      }

      // Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Create user document in Firestore
      const userData = {
        firstName,
        lastName,
        email,
        role,
        createdAt: new Date(),
        uid: user.uid
      };

      // Add student-specific fields
      if (role === "Student") {
        userData.yearLevel = yearLevel;
        userData.course = course;
      }

      await addDoc(collection(db, "users"), userData);

      console.log("User created successfully:", userData);
      onClose();
    } catch (err) {
      console.error("Failed to create user:", err);
      
      // Handle specific Firebase errors
      if (err.code === "auth/email-already-in-use") {
        setError("This email is already registered.");
      } else if (err.code === "auth/invalid-email") {
        setError("Invalid email format.");
      } else if (err.code === "auth/weak-password") {
        setError("Password is too weak.");
      } else {
        setError("Failed to create user. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="UU-overlay">
        <div className="UU-modal" ref={modalRef}>
          {error && <div className="UU-error">{error}</div>}
          <div className="UU-content">
            <div className="UU-left">
              <div className="UU-icon-preview">👤</div>
              <p className="UU-label">Add User</p>
            </div>

            <div className="UU-right">
              <form className="UU-form" onSubmit={handleSubmit}>
                <div className="UU-name-row">
                  <input
                      type="text"
                      name="firstName"
                      placeholder="First Name"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      disabled={loading}
                  />
                  <input
                      type="text"
                      name="lastName"
                      placeholder="Last Name"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                      disabled={loading}
                  />
                </div>

                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={loading}
                />

                <input
                    type="password"
                    name="password"
                    placeholder="Password (min. 6 characters)"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength="6"
                    disabled={loading}
                />

                <select 
                  name="role" 
                  value={formData.role} 
                  onChange={handleChange}
                  disabled={loading}
                >
                  <option value="Student">Student</option>
                  <option value="Teacher">Teacher</option>
                  <option value="Lab_Assistant">Lab Assistant</option>
                  <option value="Admin">Admin</option>
                </select>

                {formData.role === "Student" && (
                  <>
                    <input
                        type="text"
                        name="yearLevel"
                        placeholder="Year Level (e.g., 1st Year)"
                        value={formData.yearLevel}
                        onChange={handleChange}
                        required
                        disabled={loading}
                    />
                    <input
                        type="text"
                        name="course"
                        placeholder="Course (e.g., BSCS)"
                        value={formData.course}
                        onChange={handleChange}
                        required
                        disabled={loading}
                    />
                  </>
                )}

                <div className="UU-btn-row">
                  <button 
                    type="button" 
                    className="UU-cancel-btn" 
                    onClick={onClose}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="UU-save-btn"
                    disabled={loading}
                  >
                    {loading ? "Creating..." : "Save"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
  );
};

export default AddUser;
