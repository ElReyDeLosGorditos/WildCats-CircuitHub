import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebaseconfig";
import logo from "../../assets/circuithubLogo2.png";
import "../../components/css/profile.css"

const navLinks = [
  { label: "Dashboard", to: "/dashboard" },
  { label: "Items", to: "/useritems" },
  { label: "My Requests", to: "/my-requests" },
  { label: "Profile", to: "/userprofile" },
];

const Profile = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const auth = getAuth();

  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    course: "",
    year: "",
    role: "",
    createdAt: "",
    lateReturnCount: 0
  });

  const [stats, setStats] = useState({
    totalRequests: 0,
    activeRequests: 0,
    completedRequests: 0
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Fetch user data
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setUserData({
              firstName: data.firstName || "",
              lastName: data.lastName || "",
              email: user.email || "",
              course: data.course || "Not set",
              year: data.year || "Not set",
              role: data.role || "student",
              createdAt: data.createdAt || "",
              lateReturnCount: data.lateReturnCount || 0
            });
          } else {
            setUserData(prev => ({ ...prev, email: user.email || "" }));
          }

          // Fetch request statistics
          const requestsRef = collection(db, "borrowRequests");
          const userRequestsQuery = query(requestsRef, where("userId", "==", user.uid));
          const requestsSnapshot = await getDocs(userRequestsQuery);
          
          const requests = requestsSnapshot.docs.map(doc => doc.data());
          const activeCount = requests.filter(r => 
            r.status === "Pending" || r.status === "Teacher-Approved" || r.status === "Approved"
          ).length;
          const completedCount = requests.filter(r => r.status === "Returned").length;

          setStats({
            totalRequests: requests.length,
            activeRequests: activeCount,
            completedRequests: completedCount
          });

        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        navigate("/");
      }
    });

    return () => unsubscribe();
  }, [auth, navigate]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    try {
      const date = new Date(timestamp);
      return date.toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return "N/A";
    }
  };

  return (
      <div className="items-page">
        {/* Navbar */}
        <div className="navbar">
          <div style={{ display: "flex", alignItems: "center" }}>
            <img src={logo} alt="CCS Gadget Hub Logo" />
            <span style={{ color: "white", fontSize: "24px", fontWeight: "bold", marginLeft: "10px", lineHeight: "1.2" }}>
            Wildcats <br /> Circuit Hub
          </span>
          </div>
          <nav>
            {navLinks.map((link) => (
                <Link
                    key={link.to}
                    to={link.to}
                    className={location.pathname === link.to ? "navbar-link active-link" : "navbar-link"}
                >
                  {link.label}
                </Link>
            ))}
          </nav>
          <div style={{ marginLeft: "auto" }}>
            <button onClick={handleLogout} className="logout-link">Log Out</button>
          </div>
        </div>

        {/* Profile Content */}
        <div className="profile-page">
          <div className="profile-container">
            <div className="profile-info" style={{ width: "100%", maxWidth: "800px", margin: "0 auto" }}>
              <div className="profile-edit" style={{ textAlign: "right" }}>
                <Link to="/usereditprofile">
                  <button className="edit-btn" style={{ 
                    padding: "8px 20px", 
                    fontSize: "15px", 
                    backgroundColor: "#d96528",
                    border: "none",
                    borderRadius: "5px",
                    color: "white",
                    cursor: "pointer"
                  }}>
                    Edit Profile
                  </button>
                </Link>
              </div>

              <h2 className="profile-name" style={{ fontSize: "28px", marginBottom: "5px" }}>
                {userData.firstName} {userData.lastName}
              </h2>
              <p style={{ 
                color: "#666", 
                marginBottom: "25px",
                textTransform: "capitalize"
              }}>
                {userData.role}
              </p>

              {/* Quick Stats */}
              <div className="profile-stats" style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                gap: "15px",
                marginBottom: "30px"
              }}>
                <div style={{
                  backgroundColor: "#f8f9fa",
                  padding: "15px",
                  borderRadius: "8px",
                  textAlign: "center"
                }}>
                  <p style={{ fontSize: "24px", fontWeight: "bold", color: "#d96528", margin: "0 0 5px 0" }}>
                    {stats.totalRequests}
                  </p>
                  <p style={{ fontSize: "13px", color: "#666", margin: 0 }}>Total Requests</p>
                </div>
                <div style={{
                  backgroundColor: "#f8f9fa",
                  padding: "15px",
                  borderRadius: "8px",
                  textAlign: "center"
                }}>
                  <p style={{ fontSize: "24px", fontWeight: "bold", color: "#28a745", margin: "0 0 5px 0" }}>
                    {stats.activeRequests}
                  </p>
                  <p style={{ fontSize: "13px", color: "#666", margin: 0 }}>Active</p>
                </div>
                <div style={{
                  backgroundColor: "#f8f9fa",
                  padding: "15px",
                  borderRadius: "8px",
                  textAlign: "center"
                }}>
                  <p style={{ fontSize: "24px", fontWeight: "bold", color: "#6c757d", margin: "0 0 5px 0" }}>
                    {stats.completedRequests}
                  </p>
                  <p style={{ fontSize: "13px", color: "#666", margin: 0 }}>Completed</p>
                </div>
              </div>

              {/* Detailed Information */}
              <div className="profile-grid" style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "20px"
              }}>
                <div>
                  <p className="profile-label" style={{ color: "#666", fontSize: "13px", marginBottom: "5px" }}>
                    Email Address
                  </p>
                  <p style={{ fontWeight: "600", wordBreak: "break-word" }}>{userData.email}</p>
                </div>
                
                <div>
                  <p className="profile-label" style={{ color: "#666", fontSize: "13px", marginBottom: "5px" }}>
                    Course
                  </p>
                  <p style={{ fontWeight: "600" }}>{userData.course}</p>
                </div>
                
                <div>
                  <p className="profile-label" style={{ color: "#666", fontSize: "13px", marginBottom: "5px" }}>
                    Year Level
                  </p>
                  <p style={{ fontWeight: "600" }}>{userData.year}</p>
                </div>

                <div>
                  <p className="profile-label" style={{ color: "#666", fontSize: "13px", marginBottom: "5px" }}>
                    Account Created
                  </p>
                  <p style={{ fontWeight: "600" }}>{formatDate(userData.createdAt)}</p>
                </div>

                {userData.lateReturnCount > 0 && (
                  <div>
                    <p className="profile-label" style={{ color: "#666", fontSize: "13px", marginBottom: "5px" }}>
                      Late Returns
                    </p>
                    <p style={{ fontWeight: "600", color: "#dc3545" }}>
                      ⚠️ {userData.lateReturnCount} {userData.lateReturnCount === 1 ? 'time' : 'times'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default Profile;
