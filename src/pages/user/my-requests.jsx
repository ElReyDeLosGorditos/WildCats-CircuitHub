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

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          console.log("No user logged in");
          setLoading(false);
          return;
        }

        console.log("Fetching requests for user:", user.uid);
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

          return dateB - dateA; // newest → oldest
        });

        console.log("Fetched requests:", fetchedRequests);
        console.log("Total requests found:", fetchedRequests.length);
        
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
    // Keep search filtering comprehensive, even if display is concise
    const itemNamesToSearch = Array.isArray(req.items) && req.items.length > 0
        ? req.items.map(item => item.name).join(' ') // Join all item names for search
        : req.itemName || ''; // Fallback to itemName if no 'items' array

    const matchesSearch = itemNamesToSearch.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Improved status filtering to handle various status formats
    let matchesStatus = false;
    if (statusFilter === "all") {
      matchesStatus = true;
    } else {
      const reqStatus = (req.status || "").toLowerCase();
      const filter = statusFilter.toLowerCase();
      
      // Map filter options to actual status values
      if (filter === "pending") {
        matchesStatus = reqStatus.includes("pending");
      } else if (filter === "approved") {
        matchesStatus = reqStatus.includes("approved") && !reqStatus.includes("pending");
      } else if (filter === "denied") {
        matchesStatus = reqStatus.includes("denied") || reqStatus.includes("rejected");
      } else if (filter === "returned") {
        matchesStatus = reqStatus.includes("returned") || reqStatus.includes("completed");
      } else {
        matchesStatus = reqStatus.includes(filter);
      }
    }
    
    return matchesSearch && matchesStatus;
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

  const formatDateTime = (timestamp) => {
    if (!timestamp) return "-";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString();
  };

  return (
      <div className="items-page"> {/* This seems to be your common page wrapper class */}
        {/* Navbar */}
        <div className="navbar">
          {/* Container for logo and title - ensures they are side-by-side */}
          <div style={{ display: "flex", alignItems: "center" }}>
            <img src={logo} alt="CCS Gadget Hub Logo" />
            {/* ADDED LINE BELOW */}
            <span style={{ color: "white", fontSize: "24px", fontWeight: "bold", marginLeft: "10px", lineHeight: "1.2" }}>
            Wildcats <br /> Circuit Hub
          </span>
          </div>
          <nav>
            {[
              { label: "Dashboard", to: "/dashboard" },
              { label: "Items", to: "/useritems" },
              { label: "My Requests", to: "/my-requests" },
              { label: "Profile", to: "/userprofile" },
            ].map((link) => (
                <Link
                    key={link.to}
                    to={link.to}
                    className={
                      location.pathname === link.to ? "navbar-link active-link" : "navbar-link"
                    }
                >
                  {link.label}
                </Link>
            ))}
          </nav>
          <div style={{ marginLeft: "auto" }}>
            <Link to="/" className="logout-link">Log Out</Link>
          </div>
        </div>

        {/* Content */}
          <div className="dashboard-container"> {/* This seems to be your main content wrapper class for this page */}
            <h2 className="featured-title">My Requests</h2>

            <div className="filter-bar">
              <input
                  type="text"
                  placeholder="Search by item name(s)..."
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

            <div className="request-table-wrapper">
              {loading ? (
                <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
                  <p>Loading your requests...</p>
                </div>
              ) : requests.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
                  <p>You haven't made any requests yet.</p>
                  <Link to="/useritems" style={{ color: "#d96528", textDecoration: "underline" }}>
                    Browse items to make your first request
                  </Link>
                </div>
              ) : filteredRequests.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
                  <p>No requests found matching your filters.</p>
                  <button 
                    onClick={() => { setSearchTerm(""); setStatusFilter("all"); }}
                    style={{ 
                      marginTop: "10px",
                      padding: "8px 16px",
                      backgroundColor: "#d96528",
                      color: "white",
                      border: "none",
                      borderRadius: "5px",
                      cursor: "pointer"
                    }}
                  >
                    Clear Filters
                  </button>
                </div>
              ) : (
              <table className="request-table">
              <thead>
              <tr>
                <th>Item(s)</th> {/* Updated column header for clarity */}
                <th>Request Date</th>
                <th>Status</th>
                <th>Return Time</th>
                <th>Action</th>
              </tr>
              </thead>
              <tbody>
              {filteredRequests.map((req) => (
                  <tr key={req.id}>
                    <td>
                      {Array.isArray(req.items) && req.items.length > 0 ? (
                          // If there are multiple items, show the first one and " (+X more)"
                          req.items.length > 1 ?
                              `${req.items[0].name} (+${req.items.length - 1} more)` :
                              // If there's exactly one item in the array, just show its name
                              req.items[0].name
                      ) : (
                          // Fallback to itemName if 'items' array doesn't exist or is empty
                          req.itemName || 'N/A'
                      )}
                    </td>
                    <td>{formatDate(req.borrowDate)}</td>
                    <td>
                    <span className={`status-badge ${req.status.toLowerCase()}`}>
                      {req.status}
                    </span>
                      {req.status === "Returned" && req.isLate && (
                          <span style={{
                            display: "inline-block",
                            marginLeft: "8px",
                            padding: "2px 8px",
                            backgroundColor: "#fff3cd",
                            color: "#856404",
                            borderRadius: "12px",
                            fontSize: "12px",
                            fontWeight: "600"
                          }}>
                            ⚠️ Late
                          </span>
                      )}
                    </td>
                    <td>
                      {req.returnTime ? req.returnTime : "-"}
                    </td>
                    <td>
                      <button
                          className="view-btn"
                          onClick={() => navigate(`/view-request/${req.id}`)}
                      >
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