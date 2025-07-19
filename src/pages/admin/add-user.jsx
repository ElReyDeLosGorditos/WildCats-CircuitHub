import React, { useRef, useState, useEffect } from "react";
import "../../components/css/admin/add-user.css"; // Still uses UU- classes

const AddUser = ({ onClose }) => {
  const modalRef = useRef();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "Student",
  });
  const [error, setError] = useState("");

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

  const handleSubmit = (e) => {
    e.preventDefault();
    const { firstName, lastName, email, role } = formData;

    if (!firstName || !lastName || !email || !role) {
      setError("All fields are required.");
      return;
    }

    console.log("Creating user:", formData);
    onClose();
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
                  />
                  <input
                      type="text"
                      name="lastName"
                      placeholder="Last Name"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                  />
                </div>

                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                />

                <select name="role" value={formData.role} onChange={handleChange}>
                  <option value="Student">Student</option>
                  <option value="Faculty">Faculty</option>
                  <option value="Admin">Admin</option>
                </select>

                <div className="UU-btn-row">
                  <button type="button" className="UU-cancel-btn" onClick={onClose}>
                    Cancel
                  </button>
                  <button type="submit" className="UU-save-btn">
                    Save
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
