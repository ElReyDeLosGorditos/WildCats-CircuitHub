import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../firebaseconfig";
import logo from "../../assets/circuithubLogo2.png";
import "../../components/css/teacher/theader.css";

const navLinks = [
    { label: "Dashboard", to: "/t-dashboard" },
    { label: "Requests", to: "/t-requests" },
];

const TeacherHeader = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    const toggleMenu = () => {
        setMenuOpen((prev) => !prev);
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

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <header className="TH-head">
            <img src={logo} alt="Logo" className="TH-logo" />

            {/* Hamburger */}
            {isMobile && (
                <div className={`TH-hamburger ${menuOpen ? "open" : ""}`} onClick={toggleMenu}>
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            )}

            {/* Navigation */}
            <nav className={`TH-links ${menuOpen ? "show" : ""}`}>
                {navLinks.map((link) => (
                    <Link
                        key={link.to}
                        to={link.to}
                        onClick={() => setMenuOpen(false)}
                        className={
                            location.pathname === link.to
                                ? "TH-link active-link"
                                : "TH-link"
                        }
                    >
                        {link.label}
                    </Link>
                ))}

                <a href="/" className="TH-logout" onClick={handleLogout}>
                    Log Out
                </a>
            </nav>
        </header>
    );
};

export default TeacherHeader;
