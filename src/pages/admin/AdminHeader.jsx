import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../../assets/circuithubLogo2.png"; // update this path as needed
import "../../components/css/admin/admin-header.css";

// Now includes Maintenance link
const navLinks = [
    { label: "Dashboard", to: "/admin-dashboard" },
    { label: "Manage Items", to: "/admin-items" },
    { label: "Requests", to: "/admin-requests" },
    { label: "Maintenance", to: "/equipment-maintenance" },
    { label: "Manage Users", to: "/admin-users" },
];

const AdminHeader = () => {
    const location = useLocation();
    const navigate = useNavigate();

    return (
        <div className="head">
            <img src={logo} alt="CCS Gadget Hub Logo" className="head-logo" />
            <nav className="head-links">
                {navLinks.map((link) => (
                    <Link
                        key={link.to}
                        to={link.to}
                        className={
                            location.pathname === link.to
                                ? "head-link active-link"
                                : "head-link"
                        }
                    >
                        {link.label}
                    </Link>
                ))}
            </nav>
            <div className="navbar-logout">
                <Link to="/" className="logout-link">Log Out</Link>
            </div>
        </div>
    );
};

export default AdminHeader;
