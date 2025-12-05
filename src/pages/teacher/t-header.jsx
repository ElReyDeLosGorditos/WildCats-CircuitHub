import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom"; // Import useNavigate
import { signOut } from "firebase/auth"; // Import signOut
import { auth } from "../../firebaseconfig"; // Import auth
import logo from "../../assets/circuithubLogo2.png";
import "../../components/css/admin/admin-header.css";

const navLinks = [
    { label: "Dashboard", to: "/t-dashboard" },
    { label: "Requests", to: "/t-requests" },
];

const TeacherHeader = () => {
    const location = useLocation();
    const navigate = useNavigate(); // Hook for navigation
    const [menuOpen, setMenuOpen] = useState(false);

    const toggleMenu = () => {
        setMenuOpen((prev) => !prev);
    };

    // ✅ ADD THIS FUNCTION
    const handleLogout = async (e) => {
        e.preventDefault();
        try {
            await signOut(auth);
            setMenuOpen(false);
            navigate("/");
        } catch (error) {
            console.error("Error logging out:", error);
        }
    };

    return (
        <header className="head">
            <img src={logo} alt="CCS Gadget Hub Logo" className="head-logo" />

            <div className={`hamburger ${menuOpen ? "open" : ""}`} onClick={toggleMenu}>
                <span></span>
                <span></span>
                <span></span>
            </div>

            <nav className={`head-links ${menuOpen ? "show" : ""}`}>
                {navLinks.map((link) => (
                    <Link
                        key={link.to}
                        to={link.to}
                        onClick={() => setMenuOpen(false)}
                        className={
                            location.pathname === link.to
                                ? "head-link active-link"
                                : "head-link"
                        }
                    >
                        {link.label}
                    </Link>
                ))}

                {/* ✅ UPDATED LOGOUT LINK */}
                <a href="/" className="logout-link" onClick={handleLogout}>
                    Log Out
                </a>
            </nav>
        </header>
    );
};

export default TeacherHeader;