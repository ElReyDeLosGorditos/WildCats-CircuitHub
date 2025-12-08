import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { db, auth } from "../../firebaseconfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import logo from "../../assets/circuithubLogo2.png";
import "../../components/css/my-request.css"

const MyRequests = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          setLoading(false);
          return;
        }
        const q = query(
            collection(db, "borrowRequests"),
            where("userId", "==", user.uid)
        );
        const querySnapshot = await getDocs(q);

        const fetchedRequests = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        fetchedRequests.sort((a, b) => {
          const dateA = a.borrowDate?.toDate
              ? a.borrowDate.toDate()
              : new Date(a.borrowDate);
          const dateB = b.borrowDate?.toDate
              ? b.borrowDate.toDate()
              : new Date(b.borrowDate);
          return dateB - dateA;
        });

        setRequests(fetchedRequests);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch requests:", err);
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const filteredRequests = requests.filter((req) => {
    const itemNames = Array.isArray(req.items)
        ? req.items.map(item => item.name).join(" ")
        : req.itemName || "";

    const matchesSearch = itemNames.toLowerCase().includes(searchTerm.toLowerCase());
    const reqStatus = (req.status || "").toLowerCase();
    const filter = statusFilter.toLowerCase();

    if (filter === "all") return matchesSearch;
    if (filter === "pending") return matchesSearch && reqStatus.includes("pending");
    if (filter === "approved") return matchesSearch && reqStatus.includes("approved");
    if (filter === "denied") return matchesSearch && (reqStatus.includes("denied") || reqStatus.includes("rejected"));
    if (filter === "returned") return matchesSearch && (reqStatus.includes("returned") || reqStatus.includes("completed"));

    return matchesSearch;
  });

  const formatDate = (timestamp) => {
    if (!timestamp) return "-";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
      <div className="items-page">
        {/* --- Navbar --- */}
        <div className="navbar">
          <div style={{ display: "flex", alignItems: "center" }}>
            <img src={logo} alt="CCS Gadget Hub Logo" />
            <span style={{ color: "white", fontSize: "24px", fontWeight: "bold", marginLeft: "10px", lineHeight: "1.2" }}>
            Wildcats <br /> Circuit Hub
          </span>
          </div>

          <div className="hamburger" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <span></span><span></span><span></span>
          </div>

          <nav className={isMenuOpen ? "open" : ""}>
            <Link to="/dashboard" className="navbar-link">Dashboard</Link>
            <Link to="/useritems" className="navbar-link">Items</Link>
            <Link to="/my-requests" className="navbar-link active-link">My Requests</Link>
            <Link to="/userprofile" className="navbar-link">Profile</Link>
            <Link to="/" className="logout-link">Log Out</Link>
          </nav>
        </div>

        {/* --- Page --- */}
        <div className="dashboard-container">
          <h2 className="featured-title">My Requests</h2>

          {/* Filter */}
          <div className="filter-bar">
            <input
                type="text"
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="returned">Returned</option>
              <option value="denied">Denied</option>
            </select>
          </div>

          {/* Requests */}
          <div className="request-table-wrapper">
            {loading ? (
                <p>Loading...</p>
            ) : filteredRequests.length === 0 ? (
                <p>No requests found.</p>
            ) : (
                <table className="request-table">
                  <tbody>
                  {filteredRequests.map((req) => (
                      <tr key={req.id}>
                        <td data-label="Item(s)">
                          {Array.isArray(req.items)
                              ? req.items.length > 1
                                  ? `${req.items[0].name} (+${req.items.length - 1} more)`
                                  : req.items[0].name
                              : req.itemName || "N/A"}
                        </td>

                        <td data-label="Request Date">
                          {formatDate(req.borrowDate)}
                        </td>

                        <td data-label="Status">
                      <span className={`status-badge ${req.status.toLowerCase()}`}>
                        {req.status}
                      </span>
                        </td>

                        <td data-label="Return Time">
                          {req.returnTime || "-"}
                        </td>

                        <td data-label="Action">
                          <button className="view-btn"
                                  onClick={() => navigate(`/view-request/${req.id}`)}>
                            View
                          </button>
                        </td>
                      </tr>
                  ))}
                  </tbody>
                </table>
            )}
          </div>
        </div>
      </div>
  );
};

export default MyRequests;
