import React, { useState, useEffect } from "react";
import { Link, useLocation, useParams, useNavigate } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import { api } from "../../services/api";
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

  // Item selection
  const [allItems, setAllItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Date and time
  const [borrowDate, setBorrowDate] = useState("");
  const [startBlock, setStartBlock] = useState("");
  const [durationBlocks, setDurationBlocks] = useState("");
  const [returnTime, setReturnTime] = useState("");

  // Form fields
  const [reason, setReason] = useState("");
  const [roomNumber, setRoomNumber] = useState("");
  const [labSection, setLabSection] = useState("");
  const [agree, setAgree] = useState(false);

  // Teacher and group
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState("");
  const [selectedTeacherName, setSelectedTeacherName] = useState("");
  const [groupMembersText, setGroupMembersText] = useState("");

  // Modals
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Unavailable periods
  const unavailablePeriods = [
    { start: 9.0, end: 10.0 },
    { start: 13.0, end: 15.0 },
    { start: 16.5, end: 17.5 },
  ];

  // ✅ FIX 2: Set today's date as default
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setBorrowDate(today);
  }, []);

  // Fetch items and teachers
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
      const itemsResponse = await api.items.getAll();
      const items = itemsResponse.data;
      
      const validItems = items.filter(item => {
      if (!item.id) {
      console.error("❌ Item missing ID:", item);
      return false;
      }
      return true;
      });
      
      setAllItems(validItems);

      if (itemId) {
      const itemToSelect = validItems.find((item) => item.id === itemId);
      if (itemToSelect) {
      setSelectedItems([{ ...itemToSelect, requestedQty: 1 }]);
      }
      }

      const teachersResponse = await api.users.getAllTeachers();
      setTeachers(teachersResponse.data);
      } catch (error) {
      console.error("Error fetching initial data:", error);
      setErrorMessage("⚠️ Failed to load items or teachers. Please refresh the page and try again.");
      setShowErrorModal(true);
      }
    };

    fetchInitialData();
  }, [itemId]);

  const generateBlocks = () => {
    const blocks = [];
    let hour = 7.5;
    while (hour <= 21.0) {
      const label = formatTime(Math.floor(hour), hour % 1 === 0.5 ? 30 : 0);
      blocks.push({ value: hour.toFixed(2), label });
      hour += 0.5;
    }
    return blocks;
  };

  const formatTime = (hour, minute) => {
    const suffix = hour >= 12 ? "PM" : "AM";
    const formattedHour = ((hour + 11) % 12) + 1;
    const formattedMinute = String(minute).padStart(2, '0');
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

    while (count < 12 && current + 0.5 <= 21.0) {
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

  // ✅ FIX 3: Corrected return time calculation
  useEffect(() => {
    if (startBlock && durationBlocks) {
      const start = parseFloat(startBlock);
      const duration = parseFloat(durationBlocks);
      const end = start + duration;

      let endHour = Math.floor(end);
      let endMinute = Math.round((end % 1) * 60);
      endMinute += 10;

      if (endMinute >= 60) {
        endHour += Math.floor(endMinute / 60);
        endMinute = endMinute % 60;
      }

      const finalReturnTimeNumeric = endHour + endMinute / 60;
      
      const isRangeOrReturnUnavailable = unavailablePeriods.some((period) => {
        const borrowedRangeOverlap = start < period.end && end > period.start;
        const returnTimeOverlap =
          finalReturnTimeNumeric >= period.start &&
          finalReturnTimeNumeric < period.end + 0.01;
        return borrowedRangeOverlap || returnTimeOverlap;
      });

      if (finalReturnTimeNumeric > 21 || isRangeOrReturnUnavailable) {
        setReturnTime("Invalid (Conflicts or After 9:00 PM)");
      } else {
        setReturnTime(formatTime(endHour, endMinute));
      }
    } else {
      setReturnTime("");
    }
  }, [startBlock, durationBlocks]);

  useEffect(() => {
    if (borrowDate) {
      const selected = new Date(borrowDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      selected.setHours(0, 0, 0, 0);
      
      if (selected < today) {
        setBorrowDate("");
      }
    }
  }, [borrowDate]);

  const addItem = (item) => {
    if (!item.id) {
      setErrorMessage(`📦 Cannot add item "${item.name}" - missing ID. Please refresh the page.`);
      setShowErrorModal(true);
      return;
    }
    
    const alreadySelected = selectedItems.find(si => si.id === item.id);
    if (alreadySelected) {
      setErrorMessage("📦 This item is already in your selection.");
      setShowErrorModal(true);
      return;
    }
    setSelectedItems([...selectedItems, { ...item, requestedQty: 1 }]);
    setSearchTerm("");
  };

  const removeItem = (itemId) => {
    setSelectedItems(selectedItems.filter(si => si.id !== itemId));
  };

  const updateItemQuantity = (itemId, newQty) => {
    setSelectedItems(selectedItems.map(si => 
      si.id === itemId ? { ...si, requestedQty: Math.max(1, Math.min(newQty, si.quantity)) } : si
    ));
  };

  const filteredSearchResults = () => {
    if (!searchTerm || searchTerm.trim().length === 0) {
      return [];
    }
    
    return allItems.filter((item) => {
      const matchesSearch = item.name && item.name.toLowerCase().includes(searchTerm.toLowerCase());
      const notAlreadySelected = !selectedItems.find(si => si.id === item.id);
      const hasStock = item.quantity && item.quantity > 0;
      
      return matchesSearch && notAlreadySelected && hasStock;
    });
  };

  const handleTeacherChange = (e) => {
    const teacherId = e.target.value;
    setSelectedTeacherId(teacherId);

    const teacher = teachers.find((t) => t.uid === teacherId);
    if (teacher) {
      setSelectedTeacherName(`${teacher.firstName} ${teacher.lastName}`);
    } else {
      setSelectedTeacherName("");
    }
  };

  const parseGroupMembers = () =>
    groupMembersText
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedItems.length === 0) {
      setErrorMessage("📦 Please select at least one item to borrow.");
      setShowErrorModal(true);
      return;
    }
    if (!selectedTeacherId) {
      setErrorMessage("👨‍🏫 Please select a teacher who will approve your request.");
      setShowErrorModal(true);
      return;
    }
    if (!borrowDate) {
      setErrorMessage("📅 Please select a date for borrowing.");
      setShowErrorModal(true);
      return;
    }
    if (!startBlock) {
      setErrorMessage("⏰ Please select a start time for borrowing.");
      setShowErrorModal(true);
      return;
    }
    if (!durationBlocks) {
      setErrorMessage("⏱️ Please select a duration for borrowing.");
      setShowErrorModal(true);
      return;
    }
    if (!reason || reason.trim().length === 0) {
      setErrorMessage("✍️ Please provide a reason for borrowing.");
      setShowErrorModal(true);
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      setErrorMessage("🔐 You must be logged in to submit a request. Please log in and try again.");
      setShowErrorModal(true);
      return;
    }

    setShowConfirmModal(true);
  };

  const handleConfirmRequest = async () => {
    setIsSubmitting(true);
    
    try {
      const user = auth.currentUser;
      if (!user) {
        setErrorMessage("🔐 Please log in first to submit a request.");
        setShowConfirmModal(false);
        setShowErrorModal(true);
        setIsSubmitting(false);
        return;
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selectedDate = new Date(borrowDate);
      selectedDate.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        setErrorMessage("📅 You cannot select a past date. Please choose today or a future date.");
        setShowConfirmModal(false);
        setShowErrorModal(true);
        setIsSubmitting(false);
        return;
      }

      const startTimeNumeric = parseFloat(startBlock);
      const endTimeNumeric = startTimeNumeric + parseFloat(durationBlocks);
      
      const conflictFound = unavailablePeriods.some(
        (period) => startTimeNumeric < period.end && endTimeNumeric > period.start
      );
      if (conflictFound) {
        setErrorMessage("⏰ The selected time slot conflicts with an unavailable period (Break time or closing hours). Please choose a different time.");
        setShowConfirmModal(false);
        setShowErrorModal(true);
        setIsSubmitting(false);
        return;
      }

      const startDateTime = new Date(borrowDate);
      startDateTime.setHours(Math.floor(startTimeNumeric), (startTimeNumeric % 1) * 60);
      
      const endDateTime = new Date(borrowDate);
      endDateTime.setHours(Math.floor(endTimeNumeric), (endTimeNumeric % 1) * 60);

      const itemsArray = selectedItems.map(item => {
        if (!item.id) {
          throw new Error(`📦 Item "${item.name}" is missing an ID. Please refresh the page and try again.`);
        }
        return {
          id: item.id,
          name: item.name || "Unknown Item",
          quantity: item.requestedQty || 1
        };
      });

      const requestData = {
        items: itemsArray,
        itemId: itemsArray[0].id,
        itemName: itemsArray[0].name,
        borrowerId: user.uid,
        borrowerName: user.displayName || user.email || "Unknown User",
        borrowerEmail: user.email,
        userId: user.uid,
        userName: user.displayName || user.email || "Unknown User",
        borrowDate: borrowDate,
        startDate: startDateTime.toISOString(),
        endDate: endDateTime.toISOString(),
        startTime: formatTime(Math.floor(startTimeNumeric), (startTimeNumeric % 1) * 60),
        returnTime: returnTime,
        timeRange: formatTimeRange(startTimeNumeric, endTimeNumeric),
        teacherId: selectedTeacherId,
        teacherAssigned: selectedTeacherName,
        reason: reason,
        purpose: reason,
        roomNumber: roomNumber,
        labSection: labSection,
        groupMembers: parseGroupMembers(),
        requestedQuantity: itemsArray[0].quantity,
        description: selectedItems[0].description || "",
        itemCondition: selectedItems[0].condition || "Good",
      };

      const response = await api.requests.create(requestData);

      setShowConfirmModal(false);
      setShowSuccessModal(true);
      
      // Reset form but keep today's date
      setSelectedItems([]);
      const today2 = new Date().toISOString().split("T")[0];
      setBorrowDate(today2);
      setStartBlock("");
      setDurationBlocks("");
      setReturnTime("");
      setReason("");
      setRoomNumber("");
      setLabSection("");
      setSelectedTeacherId("");
      setSelectedTeacherName("");
      setGroupMembersText("");
      setAgree(false);
      
    } catch (error) {
      console.error("❌ Error submitting request:", error);
      
      let errorMsg = "";
      
      // Check for specific error types
      if (error.message && error.message.includes("missing an ID")) {
        errorMsg = error.message;
      } else if (error.response?.data?.error) {
        const backendError = error.response.data.error;
        
        // Simplify item availability errors
        if (backendError.includes("not available") || backendError.includes("Insufficient available quantity")) {
          // Extract just the item name
          const itemNameMatch = backendError.match(/Item '([^']+)'/);
          const itemName = itemNameMatch ? itemNameMatch[1] : "This item";
          errorMsg = `📦 ${itemName} is not available for the selected time. Please choose a different item or time slot.`;
        } else if (backendError.includes("already booked") || backendError.includes("conflicting bookings")) {
          errorMsg = `⏰ This time slot is already booked. Please select a different time.`;
        } else {
          errorMsg = backendError;
        }
      } else if (error.response?.data && typeof error.response.data === 'string') {
        const dataStr = error.response.data;
        if (dataStr.includes("not available") || dataStr.includes("Insufficient available quantity")) {
          errorMsg = `📦 One or more items are not available for the selected time. Please choose different items or a different time slot.`;
        } else {
          errorMsg = dataStr;
        }
      } else if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      } else if (error.code === "ERR_NETWORK") {
        errorMsg = "🌐 Network error. Please check your internet connection and try again.";
      } else if (error.code === "ERR_BAD_REQUEST") {
        errorMsg = "⚠️ Invalid request. Please check your selections and try again.";
      } else if (error.message) {
        errorMsg = `⚠️ ${error.message}`;
      } else {
        errorMsg = "⚠️ Something went wrong. Please try again or contact support if the problem continues.";
      }
      
      // Add emoji if not already present
      if (!errorMsg.match(/^[\p{Emoji}]/u)) {
        errorMsg = `⚠️ ${errorMsg}`;
      }
      
      setErrorMessage(errorMsg);
      setShowConfirmModal(false);
      setShowErrorModal(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      setErrorMessage("⚠️ Failed to log out. Please try again.");
      setShowErrorModal(true);
    }
  };

  return (
    <div className="items-page">
      <div className="navbar">
        <div style={{ display: "flex", alignItems: "center" }}>
          <img src={logo} alt="Wildcats Circuit Hub Logo" />
          <span style={{ color: "white", fontSize: "24px", fontWeight: "bold", marginLeft: "10px", lineHeight: "1.2" }}>
            Wildcats <br /> Circuit Hub
          </span>
        </div>
        <nav>
          {navLinks.map((link) => (
            <Link key={link.to} to={link.to} className={location.pathname === link.to ? "navbar-link active-link" : "navbar-link"}>
              {link.label}
            </Link>
          ))}
        </nav>
        <div style={{ marginLeft: "auto" }}>
          <button onClick={handleLogout} className="logout-link">Log Out</button>
        </div>
      </div>

      <div className="request-form-page">
        <div style={{ width: "100%", maxWidth: "1000px", margin: "0 auto" }}>
          <Link to="/useritems" className="back-arrow">← Back to Items</Link>
        </div>
        <h2 className="request-form-title">Request Form (Multiple Items)</h2>

        <form className="request-form-container" onSubmit={handleSubmit}>
          <div className="input-row full-width">
            <label>Selected Items ({selectedItems.length}): <span style={{color: 'red'}}>*</span></label>
            
            {selectedItems.length > 0 && (
              <div className="selected-items-display" style={{ marginBottom: "15px" }}>
                {selectedItems.map((item) => (
                  <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px", backgroundColor: "#f9f9f9", borderRadius: "5px", marginBottom: "8px", border: "1px solid #ddd" }}>
                    <div style={{ flex: 1 }}>
                      <strong>{item.name}</strong><br />
                      <small style={{ color: "#666" }}>Available: {item.quantity}</small>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                        <label style={{ margin: 0, fontSize: "14px" }}>Qty:</label>
                        <input type="number" min="1" max={item.quantity} value={item.requestedQty} onChange={(e) => updateItemQuantity(item.id, parseInt(e.target.value) || 1)} style={{ width: "60px", padding: "5px", borderRadius: "3px", border: "1px solid #ccc" }} />
                      </div>
                      <button type="button" onClick={() => removeItem(item.id)} style={{ padding: "5px 10px", backgroundColor: "#dc3545", color: "white", border: "none", borderRadius: "3px", cursor: "pointer", fontSize: "12px" }}>Remove</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div>
              <input type="text" placeholder="Search to add more items..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              {searchTerm && searchTerm.trim().length > 0 && (
                <ul className="search-results-list">
                  {filteredSearchResults().length > 0 ? (
                    filteredSearchResults().map((item) => (
                      <li key={item.id}>{item.name} (Available: {item.quantity})<button type="button" onClick={() => addItem(item)}>Add</button></li>
                    ))
                  ) : (
                    <li style={{ justifyContent: "center", color: "#888" }}>No matching items found.</li>
                  )}
                </ul>
              )}
            </div>
          </div>

          <div className="input-row full-width">
            <label>Date of Borrowing: <span style={{color: 'red'}}>*</span></label>
            <input type="date" value={borrowDate} onChange={(e) => setBorrowDate(e.target.value)} min={new Date().toISOString().split("T")[0]} max={new Date(new Date().setMonth(new Date().getMonth() + 5)).toISOString().split("T")[0]} required />
          </div>

          <div className="input-row">
            <div className="full-width">
              <label>Room Number:</label>
              <input type="text" value={roomNumber} onChange={(e) => setRoomNumber(e.target.value)} placeholder="e.g., Room 301" />
            </div>
            <div className="full-width">
              <label>Lab Section:</label>
              <input type="text" value={labSection} onChange={(e) => setLabSection(e.target.value)} placeholder="e.g., Laboratory Area 1" />
            </div>
          </div>

          <div className="input-row full-width">
            <label>Teacher Assigned: <span style={{color: 'red'}}>*</span></label>
            <select value={selectedTeacherId} onChange={handleTeacherChange} required>
              <option value="">-- Select a Teacher --</option>
              {teachers.map((teacher) => (
                <option key={teacher.uid} value={teacher.uid}>{teacher.firstName} {teacher.lastName}{teacher.department ? ` (${teacher.department})` : ""}</option>
              ))}
            </select>
            <small style={{ color: "#666", display: "block", marginTop: "5px" }}>Select the teacher who will approve this request</small>
          </div>

          <div className="input-row full-width">
            <label>Group Members (comma-separated):</label>
            <textarea value={groupMembersText} onChange={(e) => setGroupMembersText(e.target.value)} rows="2" placeholder="e.g., John Doe, Jane Smith, Bob Johnson" />
            <small style={{ color: "#666" }}>Optional: Separate names with commas. You'll be the group leader.</small>
          </div>

          <div className="input-row full-width">
            <label>Reason for Borrowing: <span style={{color: 'red'}}>*</span></label>
            <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows="3" required placeholder="Please provide a detailed reason for borrowing..." />
          </div>

          <div className="input-row slot-select-row">
            <div className="full-width">
              <label>Select Time Slot (Start): <span style={{color: 'red'}}>*</span></label>
              <select value={startBlock} onChange={(e) => { setStartBlock(e.target.value); setDurationBlocks(""); }} required>
                <option value="">-- Select Start Slot --</option>
                {generateBlocks().map(({ value, label }) => (
                  <option key={value} value={value} disabled={isBlockUnavailable(value)}>{label} {isBlockUnavailable(value) ? "(Unavailable)" : ""}</option>
                ))}
              </select>
            </div>

            <div className="full-width">
              <label>Select Duration: <span style={{color: 'red'}}>*</span></label>
              <select value={durationBlocks} onChange={(e) => setDurationBlocks(e.target.value)} required disabled={!startBlock}>
                <option value="">-- Select Duration --</option>
                {startBlock && getAvailableDurations(parseFloat(startBlock)).map((duration, idx) => (
                  <option key={idx} value={duration}>
                    {duration === 0.5 ? "30 minutes" : `${Math.floor(duration)} hour${duration > 1 ? "s" : ""}${duration % 1 !== 0 ? " 30 minutes" : ""}`}
                  </option>
                ))}
              </select>
            </div>

            <div className="full-width">
              <label>Estimated Return Time:</label>
              <input type="text" disabled value={returnTime && !returnTime.includes("Invalid") ? returnTime : returnTime || "Return time will be shown here"} style={{ color: returnTime.includes("Invalid") ? "red" : "inherit", backgroundColor: "#f0f0f0" }} />
            </div>
          </div>

          <div className="input-row full-width">
            <label>Terms and Agreement</label>
            <p style={{ marginBottom: "12px", fontSize: "14px", color: "#555" }}>The borrower or group leader, along with the entire group, hereby agrees to take full responsibility for the care and proper use of the equipment and accessories.</p>
            <p style={{ marginBottom: "12px", fontSize: "14px", color: "#555" }}>We accept full accountability for any damages or losses, and we agree to return all items on time to the lab assistant in charge.</p>
            <div className="checkbox-row" style={{ marginTop: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center" }}>
                <input type="checkbox" id="agree" checked={agree} onChange={() => setAgree(!agree)} style={{ width: "16px", height: "16px", margin: 0, marginRight: "8px", cursor: "pointer", flexShrink: 0 }} />
                <label htmlFor="agree">I agree to the terms and conditions.</label>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
            <button type="submit" className="submit-btn" disabled={!agree || selectedItems.length === 0 || !borrowDate || !selectedTeacherId || returnTime.includes("Invalid")}>Submit Request</button>
          </div>
        </form>
      </div>

      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Confirm Multi-Item Request</h3>
            <p><strong>Items ({selectedItems.length}):</strong></p>
            <ul style={{ marginLeft: "20px", marginBottom: "10px" }}>
              {selectedItems.map(item => (<li key={item.id}>{item.name} (Qty: {item.requestedQty})</li>))}
            </ul>
            <p><strong>Date:</strong> {borrowDate}</p>
            <p><strong>Time Slot:</strong> {formatTimeRange(parseFloat(startBlock), parseFloat(startBlock) + parseFloat(durationBlocks))}</p>
            <p><strong>Estimated Return Time:</strong> {returnTime}</p>
            {roomNumber && <p><strong>Room:</strong> {roomNumber}</p>}
            {labSection && <p><strong>Lab Section:</strong> {labSection}</p>}
            <p><strong>Teacher:</strong> {selectedTeacherName || "—"}</p>
            <p><strong>Reason:</strong> {reason}</p>
            {parseGroupMembers().length > 0 && (<p><strong>Group Members:</strong> {parseGroupMembers().join(", ")}</p>)}
            <div className="modal-actions-centered">
              <button className="confirm-btn" onClick={handleConfirmRequest} disabled={isSubmitting}>{isSubmitting ? 'Submitting...' : 'Confirm'}</button>
              <button className="cancel-btn" onClick={() => setShowConfirmModal(false)} disabled={isSubmitting}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Error Modal */}
      {showErrorModal && (
        <div className="modal-overlay">
          <div className="modal error-modal" style={{ maxWidth: "500px" }}>
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
              <div style={{ 
                width: "70px", 
                height: "70px", 
                borderRadius: "50%", 
                backgroundColor: "#fee", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center", 
                margin: "0 auto 15px", 
                fontSize: "36px",
                animation: "pulse 0.5s ease-in-out"
              }}>⚠️</div>
              <h3 style={{ color: "#dc3545", margin: "0 0 10px 0", fontSize: "22px" }}>Oops! Something went wrong</h3>
              <p style={{ 
                color: "#666", 
                fontSize: "15px", 
                lineHeight: "1.6", 
                margin: 0,
                textAlign: "left",
                padding: "10px 20px",
                backgroundColor: "#f8f9fa",
                borderRadius: "8px",
                border: "1px solid #e9ecef"
              }}>{errorMessage}</p>
            </div>
            <div style={{ textAlign: "center" }}>
              <button 
                onClick={() => setShowErrorModal(false)} 
                style={{ 
                  padding: "12px 40px", 
                  backgroundColor: "#461955", 
                  color: "white", 
                  border: "none", 
                  borderRadius: "8px", 
                  cursor: "pointer", 
                  fontSize: "15px", 
                  fontWeight: "600",
                  transition: "all 0.2s ease",
                  boxShadow: "0 2px 4px rgba(70, 25, 85, 0.2)"
                }}
                onMouseOver={(e) => e.target.style.transform = "translateY(-2px)"}
                onMouseOut={(e) => e.target.style.transform = "translateY(0)"}
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2 style={{ color: "#461955", textAlign: "center" }}>Multi-Item Request Submitted!</h2>
            <p style={{ textAlign: "center", marginTop: "10px" }}>Your request for {selectedItems.length} item(s) has been successfully submitted and is awaiting teacher approval.</p>
            <p style={{ textAlign: "center", marginTop: "5px" }}>Check its status in the <strong>My Requests</strong> section.</p>
            <div style={{ textAlign: "center", marginTop: "20px" }}>
              <Link to="/useritems" className="back-link" onClick={() => setShowSuccessModal(false)}>Back to Items Page</Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestForm;
