import { useState } from "react";
import { auth } from "../../firebaseconfig";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import logo from "../../assets/circuithubLogo.png";

const AdminRegister = () => {
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

            // 4. Sync with backend (force role to Admin)
            await axios.post(
                "http://localhost:8080/api/sync/user",
                {
                    uid: user.uid,
                    email: user.email,
                    firstName,
                    lastName,
                    role: "admin" // ⬅️ Force role to Admin
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            // 5. Show success, then redirect to admin dashboard
            setSuccessMessage("Successfully registered as Admin! Redirecting to Admin Dashboard...");
            setTimeout(() => {
                navigate("/");
            }, 2000);
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
                    {isLoading ? "Registering..." : "Register as Admin"}
                </button>

                <div className="login-register">
                    Already have an account? <Link to="/">Login here</Link>
                </div>
            </form>
        </div>
    );
};

export default AdminRegister;
