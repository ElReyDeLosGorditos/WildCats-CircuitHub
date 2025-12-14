import { useState } from "react";
import { auth } from "../../firebaseconfig";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../../services/api";
import logo from "../../assets/circuithubLogo.png";

const Register = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setIsLoading(true);

    const requiredDomain = "@cit.edu";
    if (!email.toLowerCase().endsWith(requiredDomain)) {
      setError(`Invalid email address. Only school emails ending with "${requiredDomain}" are accepted.`);
      setIsLoading(false);
      return;
    }

    try {
      // 1. Create Firebase auth user (automatically logs them in!)
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Update profile with display name
      await updateProfile(user, {
        displayName: `${firstName} ${lastName}`
      });

      // 3. Sync with backend
      await api.users.syncUser({
        uid: user.uid,
        email: user.email,
        firstName: firstName,
        lastName: lastName,
        role: role
      });

      // 4. Show success message and auto-redirect to dashboard (no login needed!)
      setSuccessMessage("Account created successfully! Entering CircuitHub...");
      
      // 1.5 second timeout: Just enough to read the success message
      setTimeout(() => {
        // Direct them to their specific dashboard based on role
        if (role === "teacher") {
          navigate("/t-dashboard");
        } else if (role === "admin") {
          navigate("/admin-dashboard");
        } else {
          navigate("/dashboard");
        }
      }, 1500);

    } catch (err) {
      console.error("Registration error:", err);

      if (err.code === "auth/email-already-in-use") {
        setError("This email is already registered. Please log in or use a different email.");
      } else if (err.code === "auth/invalid-email") {
        setError("The email address is not valid.");
      } else if (err.code === "auth/weak-password") {
        setError("Password should be at least 6 characters.");
      } else {
        setError(
            err.response?.data?.message ||
            err.message ||
            "Registration failed. Please try again."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };


  const [role, setRole] = useState("student");

  return (
    <div className="login-page">
      <img src={logo} alt="CircuitHub Logo" className="login-logo" />
      <form className="login-form-container" onSubmit={handleRegister}>
        {error && <div className="login-error">{error}</div>}
        {successMessage && <div className="login-success">{successMessage}</div>}

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

        <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="login-input"
            disabled={isLoading}
            required
        >
          <option value="" disabled>Select Role</option>
          <option value="student">Student</option>
          <option value="teacher">Teacher</option>
        </select>

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
          Already have an account? <Link to="/login">Click here</Link>
        </div>
      </form>
    </div>
  );
};

export default Register;