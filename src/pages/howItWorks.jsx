import React, { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";

import "../components/css/admin/landing.css";

import logo from "../assets/circuithubLogo1.png";
import iconHome from "../assets/icons/home (1).png";
import iconFeatures from "../assets/icons/star.png";
import iconHowItWorks from "../assets/icons/question (1).png";
import iconFaqs from "../assets/icons/conversation.png";
import iconContact from "../assets/icons/phone.png";
import heroBg from "../assets/heroimg.jfif";

const HowItWorksPage = () => {
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);

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

                {/* Logo */}
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

                {/* Navigation Links */}
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
                <div
                    className="hero-card"
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
                    }}
                >

                    <div className="hero-section-block">
                        <h1 className="title">How It Works</h1>
                    </div>

                    <div className="hero-section-block">
                        <h2 className="sub-heading">Step-by-Step Guide</h2>
                        <div className="feature-intro-card">
                            <p>
                                Understand how to borrow lab equipment with ease using our platform.
                                Follow these simple steps:
                            </p>
                        </div>
                    </div>

                    {/* Login & Register */}
                    <div className="hero-section-block">
                        <h2 className="sub-heading">Getting Started</h2>

                        <div className="feature-block">
                            <h3 className="feature-title">Register an Account</h3>
                            <p className="feature-description">
                                Click on the "Login" button and choose "Sign up with Google" using your school email address.
                                This will automatically create your account in the system.
                            </p>
                        </div>

                        <div className="feature-block">
                            <h3 className="feature-title">Login to Your Account</h3>
                            <p className="feature-description">
                                On future visits, simply click "Login with Google" and you’ll be redirected to your dashboard instantly.
                            </p>
                        </div>
                    </div>

                    {/* Main Instructions */}
                    <div className="hero-section-block">
                        <h2 className="sub-heading">Using the Platform</h2>

                        <div className="feature-block">
                            <h3 className="feature-title">1. Browse Equipment</h3>
                            <p className="feature-description">
                                View a list of available lab equipment in real-time.
                            </p>
                        </div>

                        <div className="feature-block">
                            <h3 className="feature-title">2. Reserve Equipment</h3>
                            <p className="feature-description">
                                Select your equipment and click to reserve it instantly.
                            </p>
                        </div>

                        <div className="feature-block">
                            <h3 className="feature-title">3. Wait for Approval</h3>
                            <p className="feature-description">
                                After reserving, your request will be reviewed by the admin.
                                Once approved, you may proceed to claim the equipment.
                            </p>
                        </div>

                        <div className="feature-block">
                            <h3 className="feature-title">4. Return on Time</h3>
                            <p className="feature-description">
                                Bring the item back before the deadline to avoid penalties.
                            </p>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
};

export default HowItWorksPage;