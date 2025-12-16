import { useState } from "react";
import { auth } from "../../firebaseconfig";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../../services/api";
import logo from "../../assets/circuithubLogo.png";

const AdminRegister = () => {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setError("");
        setSuccessMessage("");
        setIsLoading(true);

        // Validate passwords match
        if (password !== confirmPassword) {
            setError("Passwords do not match. Please try again.");
            setIsLoading(false);
            return;
        }

        // Validate password length
        if (password.length < 6) {
            setError("Password must be at least 6 characters long.");
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

            // 3. Sync with backend (force role to Admin)
            await api.users.syncUser({
                uid: user.uid,
                email: user.email,
                firstName,
                lastName,
                role: "admin" // Force role to Admin
            });

            // 4. Show success and auto-redirect to Admin Dashboard (no login needed!)
            setSuccessMessage("Admin account created! Entering Admin Dashboard...");
            
            // 1.5 second timeout: Just enough to read the success message
            setTimeout(() => {
                navigate("/admin-dashboard");
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

                {/* Password field with toggle */}
                <div style={{ position: 'relative', width: '100%' }}>
                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Password (minimum 6 characters)"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="login-input"
                        disabled={isLoading}
                        minLength="6"
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

                {/* Confirm Password field with toggle */}
                <div style={{ position: 'relative', width: '100%' }}>
                    <input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="login-input"
                        disabled={isLoading}
                        minLength="6"
                        style={{ paddingRight: '45px' }}
                    />
                    <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                        aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                        {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                </div>

                <button
                    type="submit"
                    className="login-button"
                    disabled={isLoading}
                >
                    {isLoading ? "Registering..." : "Register as Admin"}
                </button>

                <div className="login-register">
                    Already have an account? <Link to="/login">Login here</Link>
                </div>
            </form>
        </div>
    );
};

export default AdminRegister;
