import { useState } from "react";
import { auth, provider } from "../firebaseconfig";
import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom"; // import Link properly
import axios from "axios";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const role = email.includes("@cit.edu") ? "Admin" : "User";

      await syncUserWithBackend(user, firstName, lastName, role);

      navigate(role === "Admin" ? "/admin" : "/dashboard");
    } catch (err) {
      console.error("Signup error:", err);
      setError("Firebase: " + err.message);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const nameParts = user.displayName?.split(" ") || [];
      const fname = nameParts[0] || "";
      const lname = nameParts.slice(1).join(" ") || "";
      const role = user.email?.includes("@cit.edu") ? "Admin" : "User";

      await syncUserWithBackend(user, fname, lname, role);

      navigate(role === "Admin" ? "/admin" : "/dashboard");
    } catch (err) {
      console.error("Google signup error:", err);
      setError("Google Signup: " + err.message);
    }
  };

  const syncUserWithBackend = async (user, fName, lName, role) => {
    try {
      await axios.post("https://localhost:8080/api/sync/user", {
        uid: user.uid,
        email: user.email,
        firstName: fName,
        lastName: lName,
        role: role,
      });
    } catch (err) {
      console.error("Backend sync failed:", err.response?.data || err.message);
      throw new Error("Failed to sync with backend");
    }
  };

  return (
    <div style={{
      display: "flex", justifyContent: "center", alignItems: "center",
      height: "100vh", width: "100vw", background: "#545454"
    }}>
      <div style={{
        background: "#ffffff", padding: "3rem", borderRadius: "12px",
        boxShadow: "0px 8px 24px rgba(0, 0, 0, 0.2)", textAlign: "center",
        width: "400px", maxWidth: "90%"
      }}>
        <h2 style={{ color: "#000", fontSize: "26px", fontWeight: "600", marginBottom: "10px" }}>
          Create Account
        </h2>
        <p style={{ color: "#545454", fontSize: "18px", marginBottom: "28px" }}>
          Sign up to get started
        </p>

        {error && (
          <div style={{
            backgroundColor: "rgba(226, 105, 1, 0.1)", color: "#E26901", fontSize: "14px",
            padding: "12px", borderRadius: "6px", marginBottom: "16px"
          }}>
            {typeof error === "string" ? error : (error.message || "An error occurred")}
          </div>
        )}

        <form onSubmit={handleSignup} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <input
            type="text"
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            style={{ width: "100%", padding: "14px", borderRadius: "8px", border: "1px solid #ccc", fontSize: "16px" }}
          />
          <input
            type="text"
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            style={{ width: "100%", padding: "14px", borderRadius: "8px", border: "1px solid #ccc", fontSize: "16px" }}
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: "100%", padding: "14px", borderRadius: "8px", border: "1px solid #ccc", fontSize: "16px" }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: "100%", padding: "14px", borderRadius: "8px", border: "1px solid #ccc", fontSize: "16px" }}
          />
          <button type="submit" style={{
            width: "100%", padding: "14px", background: "#E26901", color: "white",
            fontSize: "16px", fontWeight: "600", borderRadius: "8px", border: "none",
            cursor: "pointer"
          }}>
            Sign Up with Email
          </button>
        </form>

        <div style={{ display: "flex", alignItems: "center", margin: "24px 0" }}>
          <span style={{ flex: 1, borderBottom: "1px solid #ccc" }}></span>
          <span style={{ margin: "0 10px", color: "#909090", fontSize: "14px" }}>or</span>
          <span style={{ flex: 1, borderBottom: "1px solid #ccc" }}></span>
        </div>

        <button
          onClick={handleGoogleSignup}
          style={{
            width: "100%", padding: "14px", background: "#4285f4", color: "white",
            fontSize: "16px", fontWeight: "600", borderRadius: "8px", border: "none",
            cursor: "pointer"
          }}
        >
          Sign Up with Google
        </button>

        <div style={{ marginTop: "20px", fontSize: "16px", color: "#545454" }}>
          Already have an account?{" "}
          <Link to="/" style={{ color: "#E26901", fontWeight: "600", cursor: "pointer", textDecoration: "underline" }}>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
