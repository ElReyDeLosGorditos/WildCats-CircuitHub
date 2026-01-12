import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "../../firebaseconfig";
import logo from "../../assets/circuithubLogo2.png";
import "../../components/css/admin/admin-header.css";

const AdminHeader = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { userRole } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);

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
        setMenuOpen(prev => !prev);
    };

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
            <img src={logo} alt="CircuitHub Logo" className="head-logo" />

            <div className={`hamburger ${menuOpen ? "open" : ""}`} onClick={toggleMenu}>
                <span></span>
                <span></span>
                <span></span>
            </div>

            <nav className={`head-links ${menuOpen ? "show" : ""}`}>
                <div className="head-links-top">
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
                </div>

                {/* ✅ MOBILE-FIXED LOGOUT */}
                <div className="head-links-bottom">
                    <button className="logout-btn" onClick={handleLogout}>
                        Log Out
                    </button>
                </div>
            </nav>
        </header>
    );
};

export default AdminHeader;
