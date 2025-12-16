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
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Note: Auto-redirect for already authenticated users is handled by PublicRoute wrapper in App.jsx
  // This function handles redirect immediately after successful login
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
    setIsLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

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
      
      // Firebase-specific error messages
      if (err.code === "auth/user-not-found") {
        setError("🚫 Account not found. Please check your email or register for a new account.");
      } else if (err.code === "auth/wrong-password") {
        setError("❌ Incorrect password. Please try again or reset your password.");
      } else if (err.code === "auth/invalid-email") {
        setError("📧 Invalid email format. Please enter a valid email address.");
      } else if (err.code === "auth/user-disabled") {
        setError("🚫 This account has been disabled. Please contact support.");
      } else if (err.code === "auth/too-many-requests") {
        setError("⏱️ Too many failed login attempts. Please try again later or reset your password.");
      } else if (err.code === "auth/network-request-failed") {
        setError("🌐 Network error. Please check your internet connection and try again.");
      } else if (err.code === "auth/invalid-credential") {
        setError("❌ Invalid email or password. Please check your credentials and try again.");
      } else {
        setError(
          err.response?.data?.error || 
          err.message || 
          "⚠️ Login failed. Please try again."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setIsLoading(true);
    
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

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
      
      if (err.code === "auth/popup-closed-by-user") {
        setError("💬 Google Sign-In was cancelled. Please try again.");
      } else if (err.code === "auth/popup-blocked") {
        setError("🚫 Pop-up blocked. Please allow pop-ups for this site and try again.");
      } else if (err.code === "auth/network-request-failed") {
        setError("🌐 Network error. Please check your internet connection.");
      } else {
        setError(err.response?.data?.error || "⚠️ Google Sign-In failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
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
          disabled={isLoading}
          required
        />

        {/* Password field with toggle */}
        <div style={{ position: 'relative', width: '100%' }}>
          <input
            type={showPassword ? "text" : "password"}
            className="login-input"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            required
            style={{ paddingRight: '45px' }}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            disabled={isLoading}
            style={{
              position: 'absolute',
              right: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '18px',
              color: '#666',
              padding: '5px 10px'
            }}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? '👁️' : '👁️‍🗨️'}
          </button>
        </div>

        <button 
          type="submit" 
          className="login-button"
          disabled={isLoading}
        >
          {isLoading ? "Logging in..." : "Log In"}
        </button>

        <div className="login-register">
          No account yet? <Link to="/register">Register here</Link>
        </div>
      </form>
    </div>
  );
};

export default Login;
