import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useState, useEffect } from "react";
import { db } from "../../firebaseconfig";
import { collection, getDocs, getDoc, doc } from "firebase/firestore";
import "../../components/css/teacher/trequests.css";
import TeacherHeader from "./t-header.jsx";
//import TeacherRequestReview from "./t-review.jsx"; // ensure this exists

const TeacherRequests = () => {
    const [requests, setRequests] = useState([]);
    const [statusFilter, setStatusFilter] = useState("Pending-Teacher");
    const [searchTerm, setSearchTerm] = useState("");
    const [error, setError] = useState("");
    const [selectedRequest, setSelectedRequest] = useState(null);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const snapshot = await getDocs(collection(db, "borrowRequests"));
            const fetched = await Promise.all(
                snapshot.docs.map(async (docSnap) => {
                    const data = { id: docSnap.id, ...docSnap.data() };

                    if (data.userId) {
                        try {
                            const userRef = doc(db, "users", data.userId);
                            const userSnap = await getDoc(userRef);
                            if (userSnap.exists()) {
                                const userData = userSnap.data();
                                data.borrowerName = `${userData.firstName} ${userData.lastName}`;
                            }
                        } catch (err) {
                            console.error("User fetch error:", err);
                        }
                    }

                    return data;
                })
            );
            setRequests(fetched);
        } catch (err) {
            console.error("Request fetch error:", err);
            setError("Failed to fetch requests.");
        }
    };

    const groupRequestsByDate = (requests) => {
        const groups = {};
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);

        const formatKey = (dateObj) => {
            const day = dateObj.getDate().toString().padStart(2, "0");
            const month = (dateObj.getMonth() + 1).toString().padStart(2, "0");
            const dayStr = dateObj.toLocaleDateString("en-US", {
                weekday: "short",
            }).toUpperCase();
            return `${day}/${month}, ${dayStr}`;
        };

        for (let req of requests) {
            if (!req.createdAt || !req.createdAt.seconds) continue;

            const created = new Date(req.createdAt.seconds * 1000);
            const createdDate = created.toDateString();
            const todayStr = today.toDateString();
            const yesterdayStr = yesterday.toDateString();

            let key = "";
            if (createdDate === todayStr) key = "Today";
            else if (createdDate === yesterdayStr) key = "Yesterday";
            else key = formatKey(created);

            if (!groups[key]) groups[key] = [];
            groups[key].push({ ...req, createdDate: created });
        }

        return groups;
    };

    const filteredRequests = requests.filter((req) => {
        const matchesStatus =
            statusFilter === "All" || req.status === statusFilter;
        const matchesSearch =
            req.borrowerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            req.itemName?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const groupedRequests = groupRequestsByDate(filteredRequests);

    const sortedGroups = Object.entries(groupedRequests).sort(
        ([aKey, aReqs], [bKey, bReqs]) => {
            const getDateValue = (key, reqs) => {
                if (key === "Today") return new Date();
                if (key === "Yesterday") {
                    const y = new Date();
                    y.setDate(y.getDate() - 1);
                    return y;
                }
                return reqs[0]?.createdDate || new Date(0);
            };
            return getDateValue(bKey, bReqs) - getDateValue(aKey, aReqs);
        }
    );


    return (
        <div className={`TR-container`}>
            <TeacherHeader />

            <div className={`TR-wrapper ${selectedRequest ? "blurred" : ""}`}>
                <div className="TR-content">
                    <div className="TR-header">
                        <h1 className="TR-title">Manage Student Requests</h1>
                    </div>

                    {error && <p className="TR-error">{error}</p>}

                    <div className="TR-filters">
                        <input
                            type="text"
                            className="TR-search"
                            placeholder="Search by borrower or item..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />

                        <select
                            className="TR-dropdown"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="Pending-Teacher">Pending</option>
                            <option value="Approved-Teacher">Approved</option>
                            <option value="Denied-Teacher">Denied</option>
                            <option value="Returned">Returned</option>
                            <option value="All">All</option>
                        </select>
                    </div>

                    {sortedGroups.length === 0 ? (
                        <p className="TR-empty">No requests found.</p>
                    ) : (
                        sortedGroups.map(([label, reqs]) => (
                            <div key={label} className="TR-group">
                                <h2 className="TR-group-label">{label}</h2>

                                <div className="TR-grid">
                                    {reqs.map((req) => (
                                        <div
                                            key={req.id}
                                            className="TR-card"
                                            onClick={() => setSelectedRequest(req)}
                                            style={{ cursor: "pointer" }}
                                        >
                                            <div className="TR-card-content">
                                                <h3 className="TR-borrower">
                                                    {req.borrowerName || "Unknown"}
                                                </h3>
                                                <p>
                                                    <strong>Item:</strong> {req.itemName || "Unknown"}
                                                </p>
                                                <p>
                                                    <strong>Time Slot:</strong>{" "}
                                                    {req.timeRange ||
                                                        `${req.startTime || ""} - ${req.returnTime || ""}`}
                                                </p>
                                                <p>
                                                    <strong>Status:</strong>{" "}
                                                    <span className={`TR-status pending`}>
                                                        {req.status === "Pending-Teacher" || req.status === "Pending-Admin"
                                                            ? "Pending"
                                                                : req.status}
                                                    </span>

                                                </p>

                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {selectedRequest && (
                <TeacherRequestReview
                    request={selectedRequest}
                    onClose={() => setSelectedRequest(null)}
                    refresh={fetchRequests}
                />
            )}
        </div>
    );

};

export default TeacherRequests;
