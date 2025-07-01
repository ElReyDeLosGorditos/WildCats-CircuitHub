import React, { useState, useEffect } from "react";
import { Link, useLocation, useParams, useNavigate } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth"; // Import getAuth and signOut
import { db } from "../../firebaseconfig"; // Assuming db and auth are exported from firebaseconfig
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import logo from "../../assets/circuithubLogo2.png";
import "../../components/css/requestform.css"; // Ensure this path is correct

// Navigation links for the user dashboard
const navLinks = [
  { label: "Dashboard", to: "/dashboard" },
  { label: "Items", to: "/useritems" },
  { label: "My Requests", to: "/my-requests" },
  { label: "Profile", to: "/userprofile" },
];

const RequestForm = () => {
  const location = useLocation();
  const { itemId } = useParams(); // Used to pre-select an item if navigating from an item's detail page
  const navigate = useNavigate();
  const auth = getAuth(); // Initialize auth

  const [allItems, setAllItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [reason, setReason] = useState("");
  const [borrowDate, setBorrowDate] = useState("");
  const [startBlock, setStartBlock] = useState("");
  const [durationBlocks, setDurationBlocks] = useState("");
  const [returnTime, setReturnTime] = useState(""); // This will store the final return time including +10 mins
  const [agree, setAgree] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Fetch initial item (if itemId is present) and all items on component mount
  useEffect(() => {
    const fetchInitialItemAndAllItems = async () => {
      // Fetch all items first
      const snapshot = await getDocs(collection(db, "items"));
      const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setAllItems(items);

      // If an itemId is provided in the URL, try to pre-select it
      if (itemId) {
        const itemToSelect = items.find((item) => item.id === itemId);
        if (itemToSelect) {
          setSelectedItems([itemToSelect]);
        }
      }
    };

    fetchInitialItemAndAllItems();
  }, [itemId]); // Depend on itemId to re-fetch if it changes (e.g., navigating from one item to another)

  // Function to add an item to the selected list
  const addItem = (item) => {
    if (!selectedItems.find((i) => i.id === item.id)) {
      setSelectedItems([...selectedItems, item]);
      setSearchTerm(""); // Clear search term after adding an item to keep the form neat
    }
  };

  // Function to remove an item from the selected list
  const removeItem = (idToRemove) => {
    setSelectedItems(selectedItems.filter((item) => item.id !== idToRemove));
  };

  // Filtered search results based on searchTerm and items already selected
  const filteredSearchResults = () =>
      allItems.filter(
          (item) =>
              item.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
              !selectedItems.find((i) => i.id === item.id) // Exclude already selected items
      );

  // Define unavailable time periods (example data, these should ideally come from a central source or database)
  const unavailablePeriods = [
    { start: 9.0, end: 10.0 }, // 9:00 AM - 10:00 AM
    { start: 13.0, end: 15.0 }, // 1:00 PM - 3:00 PM
    { start: 16.5, end: 17.5 }, // 4:30 PM - 5:30 PM
  ];

  // Generates 30-minute time blocks for the dropdown
  const generateBlocks = () => {
    const blocks = [];
    let hour = 7.5; // Start at 7:30 AM (7.5 hours from midnight)
    const endHour = 21.0; // End at 9:00 PM (21.0 hours from midnight)

    while (hour <= endHour) {
      const label = formatTime(Math.floor(hour), hour % 1 === 0.5 ? 30 : 0);
      blocks.push({ value: hour.toFixed(2), label });
      hour += 0.5; // Increment by 30 minutes
    }
    return blocks;
  };

  // Formats a numeric hour and minute into a readable time string (e.g., "9:00 AM")
  const formatTime = (hour, minute) => {
    const suffix = hour >= 12 ? "PM" : "AM";
    const formattedHour = ((hour + 11) % 12) + 1; // Converts 0 (midnight) to 12, and 13 (1 PM) to 1
    const formattedMinute = minute === 0 ? "00" : "30";
    return `${formattedHour}:${formattedMinute} ${suffix}`;
  };

  // Formats a time range (start and end numeric hours) into a readable string
  const formatTimeRange = (start, end) => {
    const startHour = Math.floor(start);
    const startMin = start % 1 === 0.5 ? 30 : 0;
    const endHour = Math.floor(end);
    const endMin = end % 1 === 0.5 ? 30 : 0;
    return `${formatTime(startHour, startMin)} - ${formatTime(endHour, endMin)}`;
  };

  // Checks if a given time block value falls within an unavailable period
  const isBlockUnavailable = (value) => {
    const numericValue = parseFloat(value);
    return unavailablePeriods.some(
        (period) => numericValue >= period.start && numericValue < period.end
    );
  };

  // Calculates available durations based on the selected start block, avoiding unavailable periods
  const getAvailableDurations = (start) => {
    const durations = [];
    let current = parseFloat(start);
    let count = 0;
    const maxDurationBlocks = 12; // Max 6 hours (12 * 0.5hr blocks)
    const maxEndTime = 21.0; // 9:00 PM

    while (
        count < maxDurationBlocks &&
        current + 0.5 <= maxEndTime // Ensure we don't go past 9 PM
        ) {
      const nextHalfHour = current + 0.5;
      // Check if the *interval* [current, nextHalfHour] overlaps with any unavailable period [period.start, period.end)
      const conflictsWithUnavailable = unavailablePeriods.some((period) => {
        return current < period.end && nextHalfHour > period.start;
      });

      if (conflictsWithUnavailable) {
        break; // Stop adding durations if a conflict is found
      }

      count++;
      durations.push(count * 0.5); // Add duration in half-hour increments
      current = nextHalfHour;
    }
    return durations;
  };

  // Pre-caution if user tries to paste or manipulate the date manually
  useEffect(() => {
    if (borrowDate) {
      const selected = new Date(borrowDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      selected.setHours(0, 0, 0, 0);

      if (selected < today) {
        setBorrowDate(""); // Clear invalid date
      }
    }
  }, [borrowDate]);

  // Effect to calculate and update the return time whenever startBlock or durationBlocks change
  useEffect(() => {
    if (startBlock && durationBlocks) {
      const start = parseFloat(startBlock);
      const duration = parseFloat(durationBlocks);
      const end = start + duration;

      const returnDateObj = new Date(); // Use a dummy date object for time calculations
      let endHour = Math.floor(end);
      let endMinute = (end % 1) * 60; // Convert 0.5 to 30 minutes

      // Add the 10-minute grace period
      endMinute += 10;

      // Handle minute overflow (e.g., 50 + 10 = 60 mins -> next hour)
      if (endMinute >= 60) {
        endHour += Math.floor(endMinute / 60);
        endMinute %= 60;
      }

      // Check for conflicts with unavailable periods for the *entire* borrowed and return time
      const finalReturnTimeNumeric = endHour + endMinute / 60;
      const isRangeOrReturnUnavailable = unavailablePeriods.some((period) => {
        // Overlap of the borrowed range [start, end)
        const borrowedRangeOverlap = start < period.end && end > period.start;
        // Overlap of the return time (a point in time, but consider a small window around it)
        const returnTimeOverlap = finalReturnTimeNumeric >= period.start && finalReturnTimeNumeric < period.end + 0.01; // Small buffer for point in time
        return borrowedRangeOverlap || returnTimeOverlap;
      });


      if (endHour + endMinute / 60 > 21 || isRangeOrReturnUnavailable) {
        setReturnTime("Invalid (Conflicts or After 9:00 PM)"); // More descriptive error
      } else {
        setReturnTime(formatTime(endHour, endMinute));
      }
    } else {
      setReturnTime(""); // Clear return time if inputs are incomplete
    }
  }, [startBlock, durationBlocks]);


  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validate all required fields including selected items and valid return time
    if (
        !borrowDate ||
        !startBlock ||
        !durationBlocks ||
        !agree ||
        selectedItems.length === 0 ||
        returnTime.includes("Invalid") // Prevent submission if return time is invalid
    ) {
      return alert("Please complete all required fields, select at least one item, and ensure the time slot is valid.");
    }
    setShowConfirmModal(true); // Show confirmation modal
  };

  // Handle confirming the request from the modal
  const handleConfirmRequest = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        alert("Please log in first.");
        return;
      }

      // Date validation: ensure borrow date is not in the past
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Normalize to start of day
      const selectedDate = new Date(borrowDate);
      selectedDate.setHours(0, 0, 0, 0); // Normalize to start of day

      if (selectedDate < today) {
        alert("You cannot select a past date.");
        setShowConfirmModal(false); // Close modal on error
        return;
      }

      const startTimeNumeric = parseFloat(startBlock);
      const endTimeNumeric = startTimeNumeric + parseFloat(durationBlocks);
      const formattedTimeRange = formatTimeRange(startTimeNumeric, endTimeNumeric);

      // Check for time slot conflicts against unavailable periods before submission
      const conflictFound = unavailablePeriods.some(period =>
          (startTimeNumeric < period.end && endTimeNumeric > period.start)
      );

      if (conflictFound) {
        alert("The selected time slot conflicts with an unavailable period. Please choose a different time.");
        setShowConfirmModal(false); // Close modal on error
        return;
      }

      // Batch all requests if multiple items are selected
      await Promise.all(
          selectedItems.map(async (item) => {
            const requestData = {
              userId: user.uid,
              userName: user.displayName || user.email || "Unknown User", // Fallback for user name
              itemId: item.id,
              itemName: item.name,
              borrowDate,
              startTime: formatTime(
                  Math.floor(startTimeNumeric),
                  startTimeNumeric % 1 === 0.5 ? 30 : 0
              ),
              returnTime, // This already includes the +10 mins calculation
              reason,
              timeRange: formattedTimeRange, // The selected time range without +10 mins
              status: "Pending", // Initial status for all new requests
              createdAt: serverTimestamp(), // Timestamp of creation
            };
            await addDoc(collection(db, "borrowRequests"), requestData);
          })
      );

      setShowConfirmModal(false); // Close confirmation modal
      setShowSuccessModal(true); // Show success modal
    } catch (err) {
      console.error("Error submitting request:", err);
      alert("Failed to submit request. Please try again.");
    }
  };

  // Handle user logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/"); // Redirect to login page after logout
    } catch (error) {
      console.error("Error signing out:", error);
      alert("Failed to log out. Please try again.");
    }
  };

  return (
      <div className="items-page">
        {/* Navbar - Consistent across user pages */}
        <div className="navbar">
          <div style={{ display: "flex", alignItems: "center" }}>
            <img src={logo} alt="Wildcats Circuit Hub Logo" />
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
            <button onClick={handleLogout} className="logout-link">Log Out</button> {/* Use button for logout */}
          </div>
        </div>

        {/* Main Content Area for Request Form */}
        <div className="request-form-page">
          <div style={{ width: '100%', maxWidth: '1000px', margin: '0 auto' }}>
            <Link to="/useritems" className="back-arrow">← Back to Items</Link>
          </div>
          <h2 className="request-form-title">Request Form</h2>

          <form className="request-form-container" onSubmit={handleSubmit}>
            {/* Section for Selected Items */}
            <div className="input-row full-width">
              <label>Selected Items:</label>
              <div className="selected-items-display">
                {selectedItems.length > 0 ? (
                    <ul className="selected-items-list">
                      {selectedItems.map((item) => (
                          <li key={item.id}>
                            {item.name} <button type="button" onClick={() => removeItem(item.id)}>x</button> {/* Changed "Remove" to "x" for a cleaner look consistent with common tag UIs */}
                          </li>
                      ))}
                    </ul>
                ) : (
                    <p style={{ color: '#888', textAlign: 'center', fontSize: '14px', padding: '10px' }}>
                      No items selected yet. Search and add items below.
                    </p>
                )}
              </div>

              {/* Search and Add Items Input */}
              <input
                  type="text"
                  placeholder="Search and add more items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && ( // Only show search results if there's a search term
                  <ul className="search-results-list">
                    {filteredSearchResults().length > 0 ? (
                        filteredSearchResults().map((item) => (
                            <li key={item.id}>
                              {item.name} <button type="button" onClick={() => addItem(item)}>Add</button>
                            </li>
                        ))
                    ) : (
                        <li style={{ justifyContent: 'center', color: '#888' }}>No matching items found.</li>
                    )}
                  </ul>
              )}
              {/* Message if no items are loaded at all (e.g., database empty or error) */}
              {!searchTerm && allItems.length === 0 && (
                  <p style={{ color: '#888', textAlign: 'center', fontSize: '14px', marginTop: '10px' }}>
                    Loading items or no items available for selection.
                  </p>
              )}
            </div>

            {/* Date of Borrowing */}
            <div className="input-row full-width">
              <label>Date of Borrowing:</label>
              <input
                  type="date"
                  id="borrowDate"
                  value={borrowDate}
                  onChange={(e) => setBorrowDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]} // today
                  max={new Date(new Date().setMonth(new Date().getMonth() + 5))
                      .toISOString()
                      .split("T")[0]} // two months from today
              />
            </div>

            {/* Reason for Borrowing */}
            <div className="input-row full-width">
              <label>Reason for Borrowing:</label>
              <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows="3"
                  required
              />
            </div>

            {/* Time Slot Selection */}
            <div className="input-row slot-select-row">
              <div className="full-width">
                <label>Select Time Slot (Start):</label>
                <select
                    value={startBlock}
                    onChange={(e) => {
                      setStartBlock(e.target.value);
                      setDurationBlocks(""); // Reset duration when start changes
                    }}
                    required
                >
                  <option value="">-- Select Start Slot --</option>
                  {generateBlocks().map(({ value, label }) => (
                      <option key={value} value={value} disabled={isBlockUnavailable(value)}>
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
                    disabled={!startBlock} // Disable until start time is chosen
                >
                  <option value="">-- Select Duration --</option>
                  {startBlock &&
                      getAvailableDurations(parseFloat(startBlock)).map((duration, idx) => (
                          <option key={idx} value={duration}>
                            {duration === 0.5
                                ? "30 minutes"
                                : `${Math.floor(duration)} hour${duration > 1 ? "s" : ""}${
                                    duration % 1 !== 0 ? " 30 minutes" : ""
                                }`}
                          </option>
                      ))}
                </select>
              </div>
              <div className="full-width">
                <label>Estimated Return Time:</label> {/* Improved label */}
                <input
                    type="text"
                    disabled
                    value={
                      returnTime && !returnTime.includes("Invalid")
                          ? returnTime
                          : returnTime || "Return time will be shown here"
                    }
                    style={{
                      color: returnTime.includes("Invalid") ? "red" : "inherit", // Style invalid text
                      backgroundColor: "#f0f0f0" // Gray out disabled input
                    }}
                />
              </div>
            </div>

            {/* Terms and Agreement */}
            <div className="input-row full-width">
              <label>Terms and Agreement</label>
              <p style={{ marginBottom: "12px", fontSize: "14px", color: '#555' }}>
                The borrower or group leader, along with the entire group, hereby agrees to take full responsibility
                for the care and proper use of the equipment and all associated accessories. We commit to preserving
                their condition as received prior to use.
              </p>
              <p style={{ marginBottom: "12px", fontSize: "14px", color: '#555' }}>
                We accept full accountability and agree to pay for any damages or losses caused by vandalism, theft,
                carelessness, abuse, or pilferage, as determined during or after inspection of our laboratory or field
                work.
              </p>
              <p style={{ marginBottom: "12px", fontSize: "14px", color: '#555' }}>
                We understand that no borrowed equipment shall be brought home and must be returned to the laboratory
                assistant in charge at the end of the laboratory or field session.
              </p>
              <p style={{ marginBottom: "12px", fontSize: "14px", color: '#555' }}>
                Failure to return the equipment on time may result in penalties. Any damaged items must be reported
                immediately. All borrowers must comply with the department’s borrowing policies.
              </p>
              <div className="checkbox-row" style={{marginTop: '1rem'}}>
                <div style={{display: 'flex', alignItems: 'center'}}>
                  <input
                      type="checkbox"
                      id="agree"
                      checked={agree}
                      onChange={() => setAgree(!agree)}
                      style={{
                        width: '16px',
                        height: '16px',
                        margin: 0,
                        marginRight: '8px',
                        cursor: 'pointer',
                        flexShrink: 0,
                      }}
                  />
                  <label>
                    I agree to the terms and conditions.
                  </label>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div style={{display: "flex", justifyContent: "flex-end", marginTop: "20px"}}>
              <button
                  type="submit"
                  className="submit-btn"
                  disabled={!agree || selectedItems.length === 0 || returnTime.includes("Invalid")}
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
                <p><strong>Items:</strong><br/>{selectedItems.map(item => item.name).join(", ")}</p>
                <p><strong>Date:</strong> {borrowDate}</p>
                <p><strong>Reason:</strong> {reason}</p>
                <p><strong>Time Slot:</strong> {formatTimeRange(parseFloat(startBlock), parseFloat(startBlock) + parseFloat(durationBlocks))}</p>
                <p><strong>Estimated Return Time:</strong> {returnTime}</p>
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
                <p style={{ textAlign: "center", marginTop: "10px" }}>Your request has been successfully submitted and is awaiting approval.</p>
                <p style={{ textAlign: "center", marginTop: "5px" }}>Check its status in the <strong>My Requests</strong> section.</p>
                <div style={{ textAlign: "center", marginTop: "20px" }}>
                  <Link to="/useritems" className="back-link" onClick={() => setShowSuccessModal(false)}>Back to Items Page</Link> {/* Close modal on click */}
                </div>
              </div>
            </div>
        )}
      </div>
  );
};

export default RequestForm;