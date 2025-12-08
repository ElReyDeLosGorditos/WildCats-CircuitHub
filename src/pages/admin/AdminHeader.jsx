import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom"; // Import useNavigate
import { useAuth } from "../../contexts/AuthContext";
import { signOut } from "firebase/auth"; // Import signOut
import { auth } from "../../firebaseconfig"; // Import auth
import logo from "../../assets/circuithubLogo2.png";
import "../../components/css/admin/admin-header.css";

const AdminHeader = () => {
    const location = useLocation();
    const navigate = useNavigate(); // Hook for navigation
    const { userRole } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);

    // ... (getNavLinks logic remains the same) ...
    const getNavLinks = () => {
        const baseLinks = [
            { label: "Dashboard", to: "/admin-dashboard", roles: ["admin"] },
            { label: "Manage Items", to: "/admin-items", roles: ["admin"] },
            { label: "Requests", to: "/admin-requests", roles: ["admin", "lab_assistant"] },
            { label: "Maintenance", to: "/equipment-maintenance", roles: ["admin", "lab_assistant"] },
            { label: "Manage Users", to: "/admin-users", roles: ["admin"] },
        ];
        return baseLinks.filter(link => link.roles.includes(userRole));
    };
    const navLinks = getNavLinks();

    const toggleMenu = () => {
        setMenuOpen((prev) => !prev);
    };

    // ✅ ADD THIS FUNCTION
    const handleLogout = async (e) => {
        e.preventDefault(); // Prevent immediate navigation
        try {
            await signOut(auth); // Clear Firebase Session
            setMenuOpen(false);
            navigate("/"); // Navigate after sign out
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

export default AdminHeader;