import React, { useEffect, useState } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";

import "../components/css/admin/landing.css";

import logo from "../assets/circuithubLogo1.png";
import iconHome from "../assets/icons/home (1).png";
import iconFeatures from "../assets/icons/star.png";
import iconHowItWorks from "../assets/icons/question (1).png";
import iconFaqs from "../assets/icons/conversation.png";
import iconContact from "../assets/icons/phone.png";
import heroBg from "../assets/heroimg.jfif";

const FeaturesPage = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [menuOpen, setMenuOpen] = useState(false);

    // Add landing-body class to <body>
    useEffect(() => {
        document.body.classList.add("landing-body");
        return () => {
            document.body.classList.remove("landing-body");
        };
    }, []);

    const navItems = [
        { label: "Home", to: "/", icon: iconHome },
        { label: "Features", to: "/features", icon: iconFeatures },
        { label: "How it Works", to: "/HowItWorks", icon: iconHowItWorks },
        { label: "FAQs", to: "/FAQs", icon: iconFaqs },
        { label: "Contact Us", to: "/ContactUs", icon: iconContact },
    ];

    return (
        <div className="landing-container">

            {/* ✅ Navbar */}
            <div className="navbar">

                {/* logo */}
                <div className="logo">
                    <img src={logo} alt="Wildcats Circuit Hub Logo" className="logo-img" />
                    <span className="logo-text">
                        <strong>Wildcats<br />Circuit Hub</strong>
                    </span>
                </div>

                {/* ✅ Hamburger */}
                <div
                    className={`hamburger ${menuOpen ? "open" : ""}`}
                    onClick={() => setMenuOpen(!menuOpen)}
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </div>

                {/* nav links */}
                <nav className={`nav-links ${menuOpen ? "show-menu" : ""}`}>
                    {navItems.map((link) => (
                        <Link
                            key={link.to}
                            to={link.to}
                            className="navbar-link"
                            onClick={() => setMenuOpen(false)}
                        >
                            <span
                                className={
                                    location.pathname === link.to
                                        ? "nav-label active-link"
                                        : "nav-label"
                                }
                            >
                                {link.label}
                            </span>
                            <img
                                src={link.icon}
                                alt={`${link.label} icon`}
                                className="nav-icon-img"
                            />
                        </Link>
                    ))}
                </nav>
            </div>

            {/* HERO SECTION */}
            <main className="hero-section">
                <div className="hero-card"
                     style={{
                         background: `
                            linear-gradient(
                                to right,
                                rgba(80, 45, 130, 0.9) 0%,
                                rgba(164, 139, 224, 0.85) 25%,
                                rgba(164, 139, 224, 0.85) 75%,
                                rgba(80, 45, 130, 0.9) 100%
                            ),
                            url(${heroBg})`,
                         backgroundSize: "cover",
                         backgroundPosition: "center",
                         backgroundRepeat: "no-repeat",
                     }}>

                    <div className="hero-section-block">
                        <h1 className="title">Features</h1>
                    </div>

                    <div className="hero-section-block">
                        <h2 className="sub-heading">What You Can Do</h2>
                        <div className="feature-intro-card">
                            <p>
                                Discover the core features of our Laboratory Equipment Borrowing system,
                                carefully crafted to enhance your borrowing experience.
                            </p>
                        </div>
                    </div>

                    <div className="hero-section-block">
                        <h2 className="sub-heading">Core Features</h2>

                        <div className="feature-block">
                            <h3 className="feature-title">Real-time Availability</h3>
                            <p className="feature-description">
                                Check which laboratory equipment is available for borrowing.
                            </p>
                        </div>

                        <div className="feature-block">
                            <h3 className="feature-title">Borrow with ease</h3>
                            <p className="feature-description">
                                Easily borrow equipment without needing manual approval.
                            </p>
                        </div>

                        <div className="feature-block">
                            <h3 className="feature-title">User-friendly Dashboard</h3>
                            <p className="feature-description">
                                Track your borrowed equipment, return history, and account details in one clean interface.
                            </p>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
};

export default FeaturesPage;