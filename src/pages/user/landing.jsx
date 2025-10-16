import React, { useEffect } from "react"; // ✅ import useEffect
import { useNavigate, useLocation, Link } from "react-router-dom";

import "../../components/css/admin/landing.css";

import logo from "../../assets/circuithubLogo2.png";
import heroBg from "../../assets/heroimg.jfif";
import loanIcon from "../../assets/icons/loan (3).png";

import iconHome from "../../assets/icons/home (1).png";
import iconFeatures from "../../assets/icons/star.png";
import iconHowItWorks from "../../assets/icons/question (1).png";
import iconFaqs from "../../assets/icons/conversation.png";
import iconContact from "../../assets/icons/phone.png";

const LandingPage = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // ✅ Add body class only when this component mounts
    useEffect(() => {
        document.body.classList.add("landing-body");
        return () => {
            document.body.classList.remove("landing-body");
        };
    }, []);

    const handleStart = () => {
        navigate("/login");
    };

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
                    <h1>
                        "Effortless Laboratory Equipment Borrowing – <br/>
                        Fast, Reliable, and Organized!"
                    </h1>
                    <p>
                        Reserve laboratory with ease. Track availability, request
                        equipments, and manage returns seamlessly.
                    </p>
                    <div style={{marginTop: "2rem"}}>
                        <button className="start-button" onClick={handleStart}>
                            <img src={loanIcon} alt="Loan Icon" className="icon-img"/> Start Borrowing
                        </button>
                    </div>

                </div>
            </main>
        </div>
    );
};

export default LandingPage;
