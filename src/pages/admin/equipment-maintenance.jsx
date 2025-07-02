import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../../assets/circuithubLogo2.png";
import "../../admin.css";
import { db , storage} from "../../firebaseconfig";
import {
    collection,
    getDocs,
    query,
    where,
    orderBy,
    limit,
    doc,
    getDoc
} from "firebase/firestore";

const EquipmentMaintenance = () => {

    return (
        <div className="admin-dashboard">
            {/* Navbar */}
            <div className="navbar">
                <img src={logo} alt="CircuitHub Logo"/>
                <nav>
                    {[
                        {label: "Dashboard", to: "/admin-dashboard"},
                        {label: "Manage Items", to: "/admin-items"},
                        {label: "Requests", to: "/admin-requests"},
                        {label: "Maintenance", to: "/equipment-maintenance"},
                        {label: "Manage Users", to: "/admin-users"},
                    ].map((link) => (
                        <Link
                            key={link.to}
                            to={link.to}
                            className={
                                location.pathname === link.to
                                    ? "navbar-link active-link"
                                    : "navbar-link"
                            }
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>
                <div style={{marginLeft: "auto"}}>
                    <Link to="/" className="logout-link">Log Out</Link>
                </div>
            </div>
        </div>

    );
};

export default EquipmentMaintenance;