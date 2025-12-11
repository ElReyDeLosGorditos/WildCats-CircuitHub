package com.example.CircuitHub.model;

import java.util.Date;
import java.util.List;
import java.util.Map;

/**
 * BorrowRequest model matching Firestore database structure
 * Supports multiple items per request with proper Timestamp handling
 */
public class BorrowRequest {
    private String id;

    // Request metadata
    private Date createdAt;           // Firestore Timestamp - MUST be Date type
    private String borrowDate;        // Date string for borrowing (e.g., "2025-12-17")
    private String status;            // "Pending-Teacher", "Approved", "Rejected", etc.

    // User information
    private String userId;            // User making the request
    private String userName;          // User's full name

    // Teacher assignment
    private String teacherAssigned;   // Teacher's name
    private String teacherId;         // Teacher's UID

    // Time slots
    private String startTime;         // Start time (e.g., "3:00 PM")
    private String returnTime;        // Return time (e.g., "4:30 PM")
    private String timeRange;         // Full time range display (e.g., "3:00 PM - 4:00 PM")

    // Request details
    private String reason;            // Reason for borrowing
    private List<String> groupMembers; // Array of group member names
    
    // Items - Array of maps with {id, name}
    private List<Map<String, String>> items; // Each item has "id" and "name"

    // Legacy single-item fields (kept for backward compatibility)
    private String itemId;
    private String itemName;

    // Additional borrower details
    private String borrowerId;
    private String borrowerName;
    private String borrowerEmail;
    private String borrowerCourse;
    private String borrowerYear;

    // Additional request details
    private String requestDate;
    private String startDate;
    private String endDate;
    private String purpose;
    private Integer requestedQuantity;
    
    // Room tracking
    private String roomNumber;
    private String labSection;

    // Item details
    private String description;
    private String itemCondition;

    // Approval workflow
    private String teacherApprovedBy;
    private String teacherApprovedAt;
    private String labAssistantApprovedBy;
    private String labAssistantApprovedAt;
    
    // Late return tracking
    private Boolean isLate;
    private Integer daysLate;
    private Integer hoursLate;
    private String lateReturnNotes;

    // Additional tracking fields
    private String updatedAt;
    private String returnedAt;
    private String adminNotes;
    private String borrowDurationDays;

    // REQUIRED: Public no-argument constructor for Firestore deserialization
    public BorrowRequest() {
        // Firestore SDK requires this empty constructor to instantiate objects during deserialization
    }

    // Full constructor for convenience (optional)
    public BorrowRequest(String id, Date createdAt, String borrowDate, String status,
                        String userId, String userName, String teacherAssigned, String teacherId,
                        String startTime, String returnTime, String timeRange, String reason,
                        List<String> groupMembers, List<Map<String, String>> items) {
        this.id = id;
        this.createdAt = createdAt;
        this.borrowDate = borrowDate;
        this.status = status;
        this.userId = userId;
        this.userName = userName;
        this.teacherAssigned = teacherAssigned;
        this.teacherId = teacherId;
        this.startTime = startTime;
        this.returnTime = returnTime;
        this.timeRange = timeRange;
        this.reason = reason;
        this.groupMembers = groupMembers;
        this.items = items;
    }

    // Getters and Setters - ALL fields must have getters and setters for Firestore

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public Date getCreatedAt() { return createdAt; }
    public void setCreatedAt(Date createdAt) { this.createdAt = createdAt; }

    public String getBorrowDate() { return borrowDate; }
    public void setBorrowDate(String borrowDate) { this.borrowDate = borrowDate; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }

    public String getTeacherAssigned() { return teacherAssigned; }
    public void setTeacherAssigned(String teacherAssigned) { this.teacherAssigned = teacherAssigned; }

    public String getTeacherId() { return teacherId; }
    public void setTeacherId(String teacherId) { this.teacherId = teacherId; }

    public String getStartTime() { return startTime; }
    public void setStartTime(String startTime) { this.startTime = startTime; }

    public String getReturnTime() { return returnTime; }
    public void setReturnTime(String returnTime) { this.returnTime = returnTime; }

    public String getTimeRange() { return timeRange; }
    public void setTimeRange(String timeRange) { this.timeRange = timeRange; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public List<String> getGroupMembers() { return groupMembers; }
    public void setGroupMembers(List<String> groupMembers) { this.groupMembers = groupMembers; }

    public List<Map<String, String>> getItems() { return items; }
    public void setItems(List<Map<String, String>> items) { this.items = items; }

    // Legacy single-item support
    public String getItemId() { return itemId; }
    public void setItemId(String itemId) { this.itemId = itemId; }

    public String getItemName() { return itemName; }
    public void setItemName(String itemName) { this.itemName = itemName; }

    // Additional borrower info
    public String getBorrowerId() { return borrowerId; }
    public void setBorrowerId(String borrowerId) { this.borrowerId = borrowerId; }

    public String getBorrowerName() { return borrowerName; }
    public void setBorrowerName(String borrowerName) { this.borrowerName = borrowerName; }

    public String getBorrowerEmail() { return borrowerEmail; }
    public void setBorrowerEmail(String borrowerEmail) { this.borrowerEmail = borrowerEmail; }

    public String getBorrowerCourse() { return borrowerCourse; }
    public void setBorrowerCourse(String borrowerCourse) { this.borrowerCourse = borrowerCourse; }

    public String getBorrowerYear() { return borrowerYear; }
    public void setBorrowerYear(String borrowerYear) { this.borrowerYear = borrowerYear; }

    public String getRequestDate() { return requestDate; }
    public void setRequestDate(String requestDate) { this.requestDate = requestDate; }

    public String getStartDate() { return startDate; }
    public void setStartDate(String startDate) { this.startDate = startDate; }

    public String getEndDate() { return endDate; }
    public void setEndDate(String endDate) { this.endDate = endDate; }

    public String getPurpose() { return purpose; }
    public void setPurpose(String purpose) { this.purpose = purpose; }

    public String getRoomNumber() { return roomNumber; }
    public void setRoomNumber(String roomNumber) { this.roomNumber = roomNumber; }

    public String getLabSection() { return labSection; }
    public void setLabSection(String labSection) { this.labSection = labSection; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getItemCondition() { return itemCondition; }
    public void setItemCondition(String itemCondition) { this.itemCondition = itemCondition; }

    public String getTeacherApprovedBy() { return teacherApprovedBy; }
    public void setTeacherApprovedBy(String teacherApprovedBy) { this.teacherApprovedBy = teacherApprovedBy; }

    public String getTeacherApprovedAt() { return teacherApprovedAt; }
    public void setTeacherApprovedAt(String teacherApprovedAt) { this.teacherApprovedAt = teacherApprovedAt; }

    public String getLabAssistantApprovedBy() { return labAssistantApprovedBy; }
    public void setLabAssistantApprovedBy(String labAssistantApprovedBy) { 
        this.labAssistantApprovedBy = labAssistantApprovedBy; 
    }

    public String getLabAssistantApprovedAt() { return labAssistantApprovedAt; }
    public void setLabAssistantApprovedAt(String labAssistantApprovedAt) { 
        this.labAssistantApprovedAt = labAssistantApprovedAt; 
    }

    public Boolean getIsLate() { return isLate; }
    public void setIsLate(Boolean isLate) { this.isLate = isLate; }

    public Integer getDaysLate() { return daysLate; }
    public void setDaysLate(Integer daysLate) { this.daysLate = daysLate; }

    public Integer getHoursLate() { return hoursLate; }
    public void setHoursLate(Integer hoursLate) { this.hoursLate = hoursLate; }

    public String getLateReturnNotes() { return lateReturnNotes; }
    public void setLateReturnNotes(String lateReturnNotes) { this.lateReturnNotes = lateReturnNotes; }

    public String getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(String updatedAt) { this.updatedAt = updatedAt; }

    public String getReturnedAt() { return returnedAt; }
    public void setReturnedAt(String returnedAt) { this.returnedAt = returnedAt; }

    public String getAdminNotes() { return adminNotes; }
    public void setAdminNotes(String adminNotes) { this.adminNotes = adminNotes; }

    public String getBorrowDurationDays() { return borrowDurationDays; }
    public void setBorrowDurationDays(String borrowDurationDays) { this.borrowDurationDays = borrowDurationDays; }

    public Integer getRequestedQuantity() { return requestedQuantity; }
    public void setRequestedQuantity(Integer requestedQuantity) { this.requestedQuantity = requestedQuantity; }

    @Override
    public String toString() {
        return "BorrowRequest{" +
                "id='" + id + '\'' +
                ", borrowDate='" + borrowDate + '\'' +
                ", status='" + status + '\'' +
                ", userName='" + userName + '\'' +
                ", items=" + (items != null ? items.size() : 0) + " items" +
                ", createdAt=" + createdAt +
                '}';
    }
}
