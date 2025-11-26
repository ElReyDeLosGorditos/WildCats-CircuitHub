import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import logo from "../../assets/circuithubLogo2.png";
import "../../components/css/admin/admin-header.css";

const navLinks = [
    { label: "Dashboard", to: "/t-dashboard" },
    { label: "Requests", to: "/t-requests" },
    // { label: "Profile", to: "/t-profile" },
];

const TeacherHeader = () => {
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);

    const toggleMenu = () => {
        setMenuOpen((prev) => !prev);
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
                        onClick={() => setMenuOpen(false)} // close menu on link click
                        className={
                            location.pathname === link.to
                                ? "head-link active-link"
                                : "head-link"
                        }
                    >
                        {link.label}
                    </Link>
                ))}
                <Link to="/" className="logout-link" onClick={() => setMenuOpen(false)}>
                    Log Out
                </Link>
            </nav>
        </header>
    );
};

export default TeacherHeader;