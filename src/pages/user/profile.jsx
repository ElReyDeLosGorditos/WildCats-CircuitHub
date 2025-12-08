import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebaseconfig";
import logo from "../../assets/circuithubLogo2.png";
import "../../components/css/profile.css";

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

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    course: "",
    year: "",
    role: "",
    createdAt: "",
    lateReturnCount: 0,
  });

  const [stats, setStats] = useState({
    totalRequests: 0,
    activeRequests: 0,
    completedRequests: 0,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
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
              lateReturnCount: data.lateReturnCount || 0,
            });
          } else {
            setUserData((prev) => ({ ...prev, email: user.email || "" }));
          }

          const requestsRef = collection(db, "borrowRequests");
          const userRequestsQuery = query(
              requestsRef,
              where("userId", "==", user.uid)
          );
          const requestsSnapshot = await getDocs(userRequestsQuery);

          const requests = requestsSnapshot.docs.map((doc) => doc.data());
          const activeCount = requests.filter(
              (r) =>
                  r.status === "Pending" ||
                  r.status === "Teacher-Approved" ||
                  r.status === "Approved"
          ).length;
          const completedCount = requests.filter(
              (r) => r.status === "Returned"
          ).length;

          setStats({
            totalRequests: requests.length,
            activeRequests: activeCount,
            completedRequests: completedCount,
          });
        } catch (error) {}
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
    } catch (error) {}
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    try {
      const date = new Date(timestamp);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  return (
      <div className="items-page">
        <div className="navbar">
          <div style={{ display: "flex", alignItems: "center" }}>
            <img src={logo} alt="CCS Gadget Hub Logo" />
            <span
                style={{
                  color: "white",
                  fontSize: "24px",
                  fontWeight: "bold",
                  marginLeft: "10px",
                  lineHeight: "1.2",
                }}
            >
            Wildcats <br /> Circuit Hub
          </span>
          </div>

          <div className="hamburger" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <span></span>
            <span></span>
            <span></span>
          </div>

          <nav className={isMenuOpen ? "open" : ""}>
            {navLinks.map((link) => (
                <Link
                    key={link.to}
                    to={link.to}
                    className={
                      location.pathname === link.to
                          ? "navbar-link active-link"
                          : "navbar-link"
                    }
                    onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
            ))}

            <button onClick={handleLogout} className="logout-link">
              Log Out
            </button>
          </nav>
        </div>

        <div className="profile-page">
          <div className="profile-container">
            <div
                className="profile-info"
                style={{ width: "100%", maxWidth: "800px", margin: "0 auto" }}
            >
              {userData.lateReturnCount > 0 && (
                  <div
                      style={{
                        backgroundColor:
                            userData.lateReturnCount >= 3 ? "#f8d7da" : "#fff3cd",
                        border: `1px solid ${
                            userData.lateReturnCount >= 3 ? "#f5c6cb" : "#ffc107"
                        }`,
                        borderRadius: "8px",
                        padding: "15px",
                        marginBottom: "20px",
                      }}
                  >
                    <p
                        style={{
                          fontWeight: "600",
                          fontSize: "15px",
                        }}
                    >
                      ⚠ Late Return Warning
                    </p>
                  </div>
              )}

              <h2
                  className="profile-name"
                  style={{ fontSize: "28px", marginBottom: "5px" }}
              >
                {userData.firstName} {userData.lastName}
              </h2>
              <p
                  style={{
                    color: "#666",
                    marginBottom: "25px",
                    textTransform: "capitalize",
                  }}
              >
                {userData.role}
              </p>

              <div
                  className="profile-stats"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                    gap: "15px",
                    marginBottom: "30px",
                  }}
              >
                <div>
                  <p style={{ fontSize: "24px", fontWeight: "bold", color: "#461955", margin: 0 }}>
                    {stats.totalRequests}
                  </p>
                  <p>Total Requests</p>
                </div>

                <div>
                  <p style={{ fontSize: "24px", fontWeight: "bold", color: "#28a745", margin: 0 }}>
                    {stats.activeRequests}
                  </p>
                  <p>Active</p>
                </div>

                <div>
                  <p style={{ fontSize: "24px", fontWeight: "bold", color: "#6c757d", margin: 0 }}>
                    {stats.completedRequests}
                  </p>
                  <p>Completed</p>
                </div>
              </div>

              <div className="profile-grid">
                <div>
                  <p className="profile-label">Email Address</p>
                  <p>{userData.email}</p>
                </div>

                <div>
                  <p className="profile-label">Course</p>
                  <p>{userData.course}</p>
                </div>

                <div>
                  <p className="profile-label">Year Level</p>
                  <p>{userData.year}</p>
                </div>

                <div>
                  <p className="profile-label">Account Created</p>
                  <p>{formatDate(userData.createdAt)}</p>
                </div>
              </div>

              {/* BOTTOM EDIT PROFILE BUTTON */}
              <div style={{ textAlign: "right", marginTop:"30px" }}>
                <Link to="/usereditprofile">
                  <button
                      className="edit-btn"
                      style={{
                        padding: "8px 20px",
                        fontSize: "15px",
                        backgroundColor: "#461955",
                        border: "none",
                        borderRadius: "5px",
                        color: "white",
                        cursor: "pointer",
                      }}
                  >
                    Edit Profile
                  </button>
                </Link>
              </div>

            </div>
          </div>
        </div>
      </div>
  );
};

export default Profile;
