import { useState } from "react";
import { auth } from "../../firebaseconfig";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import logo from "../../assets/CCSGadgetHub.png";

const Register = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // 1. Create Firebase auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Update profile with display name
      await updateProfile(user, {
        displayName: `${firstName} ${lastName}`
      });

      // 3. Get the ID token
      const token = await user.getIdToken();

      // 4. Sync with backend
      await axios.post(
        "https://ccs-gadgethubb.onrender.com/api/sync/user",
        {
          uid: user.uid,
          email: user.email,
          firstName: firstName,
          lastName: lastName,
          role: email.toLowerCase().includes("@cit.edu") ? "Admin" : "User"
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        }
      );

      // 5. Navigate based on role
      if (email.toLowerCase().includes("@cit.edu")) {
        navigate("/admin-dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError(
        err.response?.data?.message || 
        err.message || 
        "Registration failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <img src={logo} alt="CCS Gadget Hub Logo" className="login-logo" />
      <form className="login-form-container" onSubmit={handleRegister}>
        {error && <div className="login-error">{error}</div>}

        <input
          type="text"
          placeholder="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
          className="login-input"
          disabled={isLoading}
        />

        <input
          type="text"
          placeholder="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
          className="login-input"
          disabled={isLoading}
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="login-input"
          disabled={isLoading}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="login-input"
          disabled={isLoading}
          minLength="6"
        />

        <button 
          type="submit" 
          className="login-button"
          disabled={isLoading}
        >
          {isLoading ? "Registering..." : "Register"}
        </button>

        <div className="login-register">
          Already have an account? <Link to="/">Click here</Link>
        </div>
      </form>
    </div>
  );
};

export default Register;