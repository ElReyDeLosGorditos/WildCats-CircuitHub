import React, { useEffect } from "react";
import { useLocation, Link } from "react-router-dom";

import "../components/css/admin/landing.css";

import logo from "../assets/circuithubLogo1.png";
import iconHome from "../assets/icons/home (1).png";
import iconFeatures from "../assets/icons/star.png";
import iconHowItWorks from "../assets/icons/question (1).png";
import iconFaqs from "../assets/icons/conversation.png";
import iconContact from "../assets/icons/phone.png";
import heroBg from "../assets/heroimg.jfif";

const FaqsPage = () => {
    const location = useLocation();

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
                <div className="logo">
                    <img src={logo} alt="Wildcats Circuit Hub Logo" className="logo-img" />
                    <span className="logo-text">
                        <strong>Wildcats<br />Circuit Hub</strong>
                    </span>
                </div>

                <nav className="nav-links">
                    {navItems.map((link) => (
                        <Link
                            key={link.to}
                            to={link.to}
                            className="navbar-link"
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

            {/* ✅ Hero Section */}
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
                     }}
                >
                    <div className="hero-section-block">
                        <h1 className="title">FAQs</h1>
                    </div>

                    <div className="hero-section-block">
                        <h2 className="sub-heading">Frequently Asked Questions</h2>

                        <div className="feature-block">
                            <h3 className="feature-title">What if the equipment I need is already borrowed?</h3>
                            <p className="feature-description">
                                You can check its expected return date and place a reservation to ensure you get it next.
                            </p>
                        </div>

                        <div className="feature-block">
                            <h3 className="feature-title">Can I cancel a reservation?</h3>
                            <p className="feature-description">
                                Yes, cancellations are allowed as long as the item hasn’t been picked up yet.
                            </p>
                        </div>

                        <div className="feature-block">
                            <h3 className="feature-title">What happens if I return an item late?</h3>
                            <p className="feature-description">
                                Returning items late may affect your borrowing privileges, including temporary suspension.
                            </p>
                        </div>

                        <div className="feature-block">
                            <h3 className="feature-title">Who do I contact for help?</h3>
                            <p className="feature-description">
                                You can visit the "Contact Us" page or speak directly with the lab supervisor for assistance.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default FaqsPage;
