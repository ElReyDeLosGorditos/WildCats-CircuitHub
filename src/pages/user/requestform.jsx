import React, { useState, useEffect } from "react";
import { Link, useLocation, useParams, useNavigate } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import { db } from "../../firebaseconfig";
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
  getDocs,
} from "firebase/firestore";
import logo from "../../assets/circuithubLogo2.png";
import "../../components/css/requestform.css";

const navLinks = [
  { label: "Dashboard", to: "/dashboard" },
  { label: "Items", to: "/useritems" },
  { label: "My Requests", to: "/my-requests" },
  { label: "Profile", to: "/userprofile" },
];

const RequestForm = () => {
  const location = useLocation();
  const { itemId } = useParams();
  const navigate = useNavigate();
  const auth = getAuth();

  const [allItems, setAllItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [startTime, setStartTime] = useState(""); // kept for your legacy save path

  const [reason, setReason] = useState("");
  const [borrowDate, setBorrowDate] = useState("");
  const [startBlock, setStartBlock] = useState("");
  const [durationBlocks, setDurationBlocks] = useState("");
  const [returnTime, setReturnTime] = useState("");
  const [agree, setAgree] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // NEW: group/teacher fields
  const [teacherAssigned, setTeacherAssigned] = useState("");
  const [groupMembersText, setGroupMembersText] = useState(""); // comma-separated input

  useEffect(() => {
    const fetchInitialItemAndAllItems = async () => {
      const snapshot = await getDocs(collection(db, "items"));
      const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setAllItems(items);
      if (itemId) {
        const itemToSelect = items.find((item) => item.id === itemId);
        if (itemToSelect) setSelectedItems([itemToSelect]);
      }
    };
    fetchInitialItemAndAllItems();
  }, [itemId]);

  const addItem = (item) => {
    if (!selectedItems.find((i) => i.id === item.id)) {
      setSelectedItems([...selectedItems, item]);
      setSearchTerm("");
    }
  };

  const removeItem = (idToRemove) => {
    setSelectedItems(selectedItems.filter((item) => item.id !== idToRemove));
  };

  const filteredSearchResults = () =>
      allItems.filter(
          (item) =>
              item.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
              !selectedItems.find((i) => i.id === item.id)
      );

  const unavailablePeriods = [
    { start: 9.0, end: 10.0 },
    { start: 13.0, end: 15.0 },
    { start: 16.5, end: 17.5 },
  ];

  const generateBlocks = () => {
    const blocks = [];
    let hour = 7.5;
    const endHour = 21.0;
    while (hour <= endHour) {
      const label = formatTime(Math.floor(hour), hour % 1 === 0.5 ? 30 : 0);
      blocks.push({ value: hour.toFixed(2), label });
      hour += 0.5;
    }
    return blocks;
  };

  const formatTime = (hour, minute) => {
    const suffix = hour >= 12 ? "PM" : "AM";
    const formattedHour = ((hour + 11) % 12) + 1;
    const formattedMinute = minute === 0 ? "00" : "30";
    return `${formattedHour}:${formattedMinute} ${suffix}`;
  };

  const formatTimeRange = (start, end) => {
    const startHour = Math.floor(start);
    const startMin = start % 1 === 0.5 ? 30 : 0;
    const endHour = Math.floor(end);
    const endMin = end % 1 === 0.5 ? 30 : 0;
    return `${formatTime(startHour, startMin)} - ${formatTime(endHour, endMin)}`;
  };

  const isBlockUnavailable = (value) => {
    const numericValue = parseFloat(value);
    return unavailablePeriods.some(
        (period) => numericValue >= period.start && numericValue < period.end
    );
  };

  const getAvailableDurations = (start) => {
    const durations = [];
    let current = parseFloat(start);
    let count = 0;
    const maxDurationBlocks = 12;
    const maxEndTime = 21.0;

    while (count < maxDurationBlocks && current + 0.5 <= maxEndTime) {
      const nextHalfHour = current + 0.5;
      const conflictsWithUnavailable = unavailablePeriods.some((period) => {
        return current < period.end && nextHalfHour > period.start;
      });
      if (conflictsWithUnavailable) break;
      count++;
      durations.push(count * 0.5);
      current = nextHalfHour;
    }
    return durations;
  };

  useEffect(() => {
    if (borrowDate) {
      const selected = new Date(borrowDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      selected.setHours(0, 0, 0, 0);
      if (selected < today) setBorrowDate("");
    }
  }, [borrowDate]);

  useEffect(() => {
    if (startBlock && durationBlocks) {
      const start = parseFloat(startBlock);
      const duration = parseFloat(durationBlocks);
      const end = start + duration;

      let endHour = Math.floor(end);
      let endMinute = (end % 1) * 60;
      endMinute += 10; // 10-minute grace

      if (endMinute >= 60) {
        endHour += Math.floor(endMinute / 60);
        endMinute %= 60;
      }

      const finalReturnTimeNumeric = endHour + endMinute / 60;
      const isRangeOrReturnUnavailable = unavailablePeriods.some((period) => {
        const borrowedRangeOverlap = start < period.end && end > period.start;
        const returnTimeOverlap =
            finalReturnTimeNumeric >= period.start &&
            finalReturnTimeNumeric < period.end + 0.01;
        return borrowedRangeOverlap || returnTimeOverlap;
      });

      if (endHour + endMinute / 60 > 21 || isRangeOrReturnUnavailable) {
        setReturnTime("Invalid (Conflicts or After 9:00 PM)");
      } else {
        setReturnTime(formatTime(endHour, endMinute));
      }
    } else {
      setReturnTime("");
    }
  }, [startBlock, durationBlocks]);

  // ---- Helpers for new fields ----
  const parseGroupMembers = () =>
      groupMembersText
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s.length > 0);

  // Submit (legacy path used by your form onSubmit)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedItems.length === 0) {
      alert("Please select at least one item.");
      return;
    }
    if (!teacherAssigned.trim()) {
      alert("Please enter the Teacher Assigned.");
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      alert("User not logged in.");
      return;
    }

    // Open confirm modal instead of writing immediately
    setShowConfirmModal(true);
  };

  // Confirm → write to Firestore (one doc per item, keeping your existing approach)
  const handleConfirmRequest = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        alert("Please log in first.");
        return;
      }

      // date not in the past
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selectedDate = new Date(borrowDate);
      selectedDate.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        alert("You cannot select a past date.");
        setShowConfirmModal(false);
        return;
      }

      const startTimeNumeric = parseFloat(startBlock);
      const endTimeNumeric = startTimeNumeric + parseFloat(durationBlocks);
      const formattedTimeRange = formatTimeRange(startTimeNumeric, endTimeNumeric);

      const conflictFound = unavailablePeriods.some(
          (period) => startTimeNumeric < period.end && endTimeNumeric > period.start
      );
      if (conflictFound) {
        alert(
            "The selected time slot conflicts with an unavailable period. Please choose a different time."
        );
        setShowConfirmModal(false);
        return;
      }

      const groupMembers = parseGroupMembers();

      await Promise.all(
          selectedItems.map(async (item) => {
            const requestData = {
              userId: user.uid,
              userName: user.displayName || user.email || "Unknown User",
              itemId: item.id,
              itemName: item.name,
              borrowDate,
              startTime: formatTime(
                  Math.floor(startTimeNumeric),
                  startTimeNumeric % 1 === 0.5 ? 30 : 0
              ),
              returnTime, // includes +10 mins
              reason,
              timeRange: formattedTimeRange,
              status: "Pending",
              createdAt: serverTimestamp(),

              // NEW FIELDS
              teacherAssigned: teacherAssigned.trim(),
              groupMembers, // array of names
            };
            await addDoc(collection(db, "borrowRequests"), requestData);
          })
      );

      setShowConfirmModal(false);
      setShowSuccessModal(true);
      // reset basics
      setSelectedItems([]);
      setBorrowDate("");
      setStartBlock("");
      setDurationBlocks("");
      setReturnTime("");
      setReason("");
      setTeacherAssigned("");
      setGroupMembersText("");
    } catch (err) {
      console.error("Error submitting request:", err);
      alert("Failed to submit request. Please try again.");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
      alert("Failed to log out. Please try again.");
    }
  };

  return (
      <div className="items-page">
        {/* Navbar */}
        <div className="navbar">
          <div style={{ display: "flex", alignItems: "center" }}>
            <img src={logo} alt="Wildcats Circuit Hub Logo" />
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
          <nav>
            {navLinks.map((link) => (
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
          <div style={{ marginLeft: "auto" }}>
            <button onClick={handleLogout} className="logout-link">
              Log Out
            </button>
          </div>
        </div>

        {/* Page */}
        <div className="request-form-page">
          <div style={{ width: "100%", maxWidth: "1000px", margin: "0 auto" }}>
            <Link to="/useritems" className="back-arrow">
              ← Back to Items
            </Link>
          </div>
          <h2 className="request-form-title">Request Form</h2>

          <form className="request-form-container" onSubmit={handleSubmit}>
            {/* Selected Items */}
            <div className="input-row full-width">
              <label>Selected Items:</label>
              <div className="selected-items-display">
                {selectedItems.length > 0 ? (
                    <ul className="selected-items-list">
                      {selectedItems.map((item) => (
                          <li key={item.id}>
                            {item.name}{" "}
                            <button
                                type="button"
                                onClick={() => removeItem(item.id)}
                                aria-label={`Remove ${item.name}`}
                            >
                              x
                            </button>
                          </li>
                      ))}
                    </ul>
                ) : (
                    <p
                        style={{
                          color: "#888",
                          textAlign: "center",
                          fontSize: "14px",
                          padding: "10px",
                        }}
                    >
                      No items selected yet. Search and add items below.
                    </p>
                )}
              </div>

              <input
                  type="text"
                  placeholder="Search and add more items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                  <ul className="search-results-list">
                    {filteredSearchResults().length > 0 ? (
                        filteredSearchResults().map((item) => (
                            <li key={item.id}>
                              {item.name}{" "}
                              <button type="button" onClick={() => addItem(item)}>
                                Add
                              </button>
                            </li>
                        ))
                    ) : (
                        <li style={{ justifyContent: "center", color: "#888" }}>
                          No matching items found.
                        </li>
                    )}
                  </ul>
              )}
              {!searchTerm && allItems.length === 0 && (
                  <p
                      style={{
                        color: "#888",
                        textAlign: "center",
                        fontSize: "14px",
                        marginTop: "10px",
                      }}
                  >
                    Loading items or no items available for selection.
                  </p>
              )}
            </div>

            {/* NEW: Class & Group Info */}
            <div className="input-row full-width">
              <label>Teacher Assigned:</label>
              <input
                  type="text"
                  value={teacherAssigned}
                  onChange={(e) => setTeacherAssigned(e.target.value)}
                  required
              />
            </div>

            <div className="input-row full-width">
              <label>Group Members (comma-separated):</label>
              <textarea
                  value={groupMembersText}
                  onChange={(e) => setGroupMembersText(e.target.value)}
                  rows="2"

              />
              <small style={{ color: "#666" }}>
                Tip: Separate names with commas. You’ll be recorded as the group leader.
              </small>
            </div>

            {/* Date of Borrowing */}
            <div className="input-row full-width">
              <label>Date of Borrowing:</label>
              <input
                  type="date"
                  id="borrowDate"
                  value={borrowDate}
                  onChange={(e) => setBorrowDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  max={new Date(new Date().setMonth(new Date().getMonth() + 5))
                      .toISOString()
                      .split("T")[0]}
                  required
              />
            </div>

            {/* Reason */}
            <div className="input-row full-width">
              <label>Reason for Borrowing:</label>
              <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows="3"
                  required
              />
            </div>

            {/* Time Slot */}
            <div className="input-row slot-select-row">
              <div className="full-width">
                <label>Select Time Slot (Start):</label>
                <select
                    value={startBlock}
                    onChange={(e) => {
                      setStartBlock(e.target.value);
                      setDurationBlocks("");
                    }}
                    required
                >
                  <option value="">-- Select Start Slot --</option>
                  {generateBlocks().map(({ value, label }) => (
                      <option
                          key={value}
                          value={value}
                          disabled={isBlockUnavailable(value)}
                      >
                        {label} {isBlockUnavailable(value) ? "(Unavailable)" : ""}
                      </option>
                  ))}
                </select>
              </div>

              <div className="full-width">
                <label>Select Duration:</label>
                <select
                    value={durationBlocks}
                    onChange={(e) => setDurationBlocks(e.target.value)}
                    required
                    disabled={!startBlock}
                >
                  <option value="">-- Select Duration --</option>
                  {startBlock &&
                      getAvailableDurations(parseFloat(startBlock)).map(
                          (duration, idx) => (
                              <option key={idx} value={duration}>
                                {duration === 0.5
                                    ? "30 minutes"
                                    : `${Math.floor(duration)} hour${
                                        duration > 1 ? "s" : ""
                                    }${duration % 1 !== 0 ? " 30 minutes" : ""}`}
                              </option>
                          )
                      )}
                </select>
              </div>

              <div className="full-width">
                <label>Estimated Return Time:</label>
                <input
                    type="text"
                    disabled
                    value={
                      returnTime && !returnTime.includes("Invalid")
                          ? returnTime
                          : returnTime || "Return time will be shown here"
                    }
                    style={{
                      color: returnTime.includes("Invalid") ? "red" : "inherit",
                      backgroundColor: "#f0f0f0",
                    }}
                />
              </div>
            </div>

            {/* Terms */}
            <div className="input-row full-width">
              <label>Terms and Agreement</label>
              <p style={{ marginBottom: "12px", fontSize: "14px", color: "#555" }}>
                The borrower or group leader, along with the entire group, hereby
                agrees to take full responsibility for the care and proper use of
                the equipment and accessories.
              </p>
              <p style={{ marginBottom: "12px", fontSize: "14px", color: "#555" }}>
                We accept full accountability for any damages or losses, and we
                agree to return all items on time to the lab assistant in charge.
              </p>
              <div className="checkbox-row" style={{ marginTop: "1rem" }}>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <input
                      type="checkbox"
                      id="agree"
                      checked={agree}
                      onChange={() => setAgree(!agree)}
                      style={{
                        width: "16px",
                        height: "16px",
                        margin: 0,
                        marginRight: "8px",
                        cursor: "pointer",
                        flexShrink: 0,
                      }}
                  />
                  <label htmlFor="agree">I agree to the terms and conditions.</label>
                </div>
              </div>
            </div>

            {/* Submit */}
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
              <button
                  type="submit"
                  className="submit-btn"
                  disabled={
                      !agree ||
                      selectedItems.length === 0 ||
                      returnTime.includes("Invalid") ||
                      !teacherAssigned.trim()
                  }
              >
                Submit Request
              </button>
            </div>
          </form>
        </div>

        {/* Confirmation Modal */}
        {showConfirmModal && (
            <div className="modal-overlay">
              <div className="modal">
                <h3>Confirm Request</h3>
                <p>
                  <strong>Items:</strong>
                  <br />
                  {selectedItems.map((item) => item.name).join(", ")}
                </p>
                <p><strong>Date:</strong> {borrowDate}</p>
                <p><strong>Reason:</strong> {reason}</p>
                <p>
                  <strong>Time Slot:</strong>{" "}
                  {formatTimeRange(parseFloat(startBlock), parseFloat(startBlock) + parseFloat(durationBlocks))}
                </p>
                <p><strong>Estimated Return Time:</strong> {returnTime}</p>
                <p><strong>Teacher Assigned:</strong> {teacherAssigned || "—"}</p>
                <p>
                  <strong>Group Members:</strong>{" "}
                  {parseGroupMembers().length ? parseGroupMembers().join(", ") : "—"}
                </p>
                <div className="modal-actions-centered">
                  <button className="confirm-btn" onClick={handleConfirmRequest}>Confirm</button>
                  <button className="cancel-btn" onClick={() => setShowConfirmModal(false)}>Cancel</button>
                </div>
              </div>
            </div>
        )}

        {/* Success Modal */}
        {showSuccessModal && (
            <div className="modal-overlay">
              <div className="modal">
                <h2 style={{ color: "#d96528", textAlign: "center" }}>Request submitted!</h2>
                <p style={{ textAlign: "center", marginTop: "10px" }}>
                  Your request has been successfully submitted and is awaiting approval.
                </p>
                <p style={{ textAlign: "center", marginTop: "5px" }}>
                  Check its status in the <strong>My Requests</strong> section.
                </p>
                <div style={{ textAlign: "center", marginTop: "20px" }}>
                  <Link to="/useritems" className="back-link" onClick={() => setShowSuccessModal(false)}>
                    Back to Items Page
                  </Link>
                </div>
              </div>
            </div>
        )}
      </div>
  );
};

export default RequestForm;
