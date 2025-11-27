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
  const [statusFilter, setStatusFilter] = useState("pending");
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        const q = query(
            collection(db, "borrowRequests"),
            where("userID", "==", user.uid)
        );

        const querySnapshot = await getDocs(q);
        const fetchedRequests = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setRequests(fetchedRequests);
      } catch (err) {
        console.error("Failed to fetch requests:", err);
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
    const matchesStatus =
        statusFilter === "all" || (req.status || "").toLowerCase() === statusFilter;
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
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="returned">Returned</option>
                <option value="denied">Denied</option>
                <option value="all">All</option>
              </select>
            </div>

            <div className="request-table-wrapper">
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
                    </td>
                    <td>
                      {req.status?.toLowerCase() === "returned" && req.returnDate
                          ? formatDateTime(req.returnDate)
                          : "-"
                      }
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
          </div>
        </div>
      </div>
  );
};

export default MyRequests;