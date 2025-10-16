import React, { useEffect, useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { collection, getDocs, query, orderBy, limit, doc, getDoc, where } from "firebase/firestore";
import { auth, db } from "../../firebaseconfig";
import { signOut } from "firebase/auth";
import logo from "../../assets/circuithubLogo2.png";
import "..//../components/css/dashboard.css"

const TeacherDashboard = () => {
    return (Hi);
};

export default TeacherDashboard;