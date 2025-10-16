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

const ContactUsPage = () => {
    const location = useLocation();

    useEffect(() => {
        document.body.classList.add("landing-body");
        return () => document.body.classList.remove("landing-body");
    }, []);

    const navItems = [
        { label: "Home", to: "/", icon: iconHome },
        { label: "Features", to: "/features", icon: iconFeatures },
        { label: "How it Works", to: "/HowItWorks", icon: iconHowItWorks },
        { label: "FAQs", to: "/FAQs", icon: iconFaqs },
        { label: "Contact Us", to: "/ContactUs", icon: iconContact },
    ];

    const members = [
        {
            name: "Xyrill Dereck N. Canete",
            role: "Project Manager, Backend Developer",
            email: "xyrilldereck.canete@cit.edu",
            phone: "+63 912 111 2233",
        },
        {
            name: "Karl T. Baricuatro",
            role: "UI/UX Designer, Frontend Developer",
            email: "karl.baricuatro@cit.edu",
            phone: "+63 912 444 5566",
        },
        {
            name: "Jestopher Dela Torre",
            role: "Backend Developer",
            email: "jestopher.delatorre@cit.edu",
            phone: "+63 912 777 8899",
        },
        {
            name: "John Lawrence Regis",
            role: "Backend Developer",
            email: "johnlawrence.regis@cit.edu",
            phone: "+63 912 000 1122",
        },
        {
            name: "Geanna Ricci Pacana",
            role: "Frontend Developer",
            email: "geannaricci.pacana@cit.edu",
            phone: "+63 912 333 4455",
        },
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
                rgba(80,45,130,.9) 0%,
                rgba(164,139,224,.85) 25%,
                rgba(164,139,224,.85) 75%,
                rgba(80,45,130,.9) 100%
              ),
              url(${heroBg})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat",
                    }}
                >
                    {/* Contact details */}
                    <div className="hero-section-block">
                        <h1 className="title">Contact&nbsp;Us</h1>
                        <p className="feature-description" style={{ maxWidth: 700 }}>
                            If you have questions or need assistance, please reach out:
                        </p>
                    </div>
                    {/* Members */}
                    <div className="hero-section-block">
                        <h2 className="sub-heading">Members</h2>

                        {/* contact-section uses flexbox & wrap */}
                        <div className="contact-section">
                            {members.map((m, i) => (
                                <div key={i} className="contact-card">
                                    <h4>{m.name}</h4>
                                    <p className="contact-role">{m.role}</p>
                                    <p>Email:&nbsp;{m.email}</p>
                                    {/*<p>Phone:&nbsp;{m.phone}</p>*/}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ContactUsPage;
