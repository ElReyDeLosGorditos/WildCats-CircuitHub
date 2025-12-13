import { useState } from "react";
import { auth, provider } from "../firebaseconfig";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../services/api";
import logo from "../assets/circuithubLogo.png";
import "../components/css/login.css"


const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const redirectBasedOnRole = async (uid) => {
    try {
      const res = await api.users.getUserByUid(uid);

      const user = res.data;
      if (user.role === "admin") {
        navigate("/admin-dashboard");
      } else if (user.role === "teacher") {
        navigate("/t-dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("Error in redirectBasedOnRole:", err);
      setError("Error fetching user role. Please try again.");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const token = await user.getIdToken(); // Get the JWT token

      const displayName = user.displayName || "Unnamed User";
      const nameParts = displayName.split(" ");
      const firstName = nameParts[0] || "Unnamed";
      const lastName = nameParts.slice(1).join(" ") || "";

      await api.users.syncUser({
        uid: user.uid,
        email: user.email,
        firstName,
        lastName,
      });

      redirectBasedOnRole(user.uid);
    } catch (err) {
      console.error("Login error:", err);
      setError(err.response?.data?.error || "Login failed. Please try again.");
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const token = await user.getIdToken(); // Get the JWT token

      const displayName = user.displayName || "Unnamed User";
      const nameParts = displayName.split(" ");
      const firstName = nameParts[0] || "Unnamed";
      const lastName = nameParts.slice(1).join(" ") || "";

      await api.users.syncUser({
        uid: user.uid,
        email: user.email,
        firstName,
        lastName,
      });

      redirectBasedOnRole(user.uid);
    } catch (err) {
      console.error("Google login error:", err);
      setError(err.response?.data?.error || "Google Sign-In failed.");
    }
  };

  return (
    <div className="login-page">
      <img src={logo} alt="Circuit Hub Logo" className="login-logo" />
      <form className="login-form-container" onSubmit={handleLogin}>
        {error && <div className="login-error">{error}</div>}

        <input
          type="email"
          className="login-input"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          className="login-input"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" className="login-button">Log In</button>

        <div className="login-register">
          No account yet? <Link to="/register">Register here</Link>
        </div>
      </form>
    </div>
  );
};

export default Login;
