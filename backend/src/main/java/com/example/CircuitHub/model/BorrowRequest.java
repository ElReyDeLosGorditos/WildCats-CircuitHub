package com.example.CircuitHub.model;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BorrowRequest {
    private String id;

    // Item information
    private String itemId;
    private String itemName;

    // Borrower information
    private String borrowerId;    // Matches to userId in the frontend
    private String borrowerName;  // Matches to userName in the frontend
    private String borrowerEmail;
    private String borrowerCourse;  // NEW: Student's course
    private String borrowerYear;    // NEW: Student's year level

    // Request details
    private String requestDate;
    private String startDate;     // When borrowing starts
    private String endDate;       // When borrowing ends
    private String status;        // Pending, Teacher-Approved, Lab-Approved, Rejected, Returned, Overdue
    private String purpose;       // Reason for borrowing
    private String timeRange;     // Formatted time range for display
    
    // NEW: Room tracking
    private String roomNumber;    // Room where equipment will be used
    private String labSection;    // Laboratory section (e.g., "Laboratory Area 1")

    // Item details
    private String description;
    private String itemCondition; // Matches to condition in the frontend

    // NEW: Approval workflow
    private String teacherApprovedBy;      // Teacher who approved
    private String teacherApprovedAt;      // Timestamp of teacher approval
    private String labAssistantApprovedBy; // Lab assistant who approved
    private String labAssistantApprovedAt; // Timestamp of lab approval
    
    // NEW: Late return tracking
    private Boolean isLate;              // Whether this return was late
    private Integer daysLate;            // Number of days late if applicable
    private String lateReturnNotes;      // Notes about late return

    // Additional tracking fields
    private String createdAt;
    private String updatedAt;
    private String returnedAt;
    private String adminNotes;
    private String borrowDurationDays;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getItemId() { return itemId; }
    public void setItemId(String itemId) { this.itemId = itemId; }

    public String getItemName() { return itemName; }
    public void setItemName(String itemName) { this.itemName = itemName; }

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

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getPurpose() { return purpose; }
    public void setPurpose(String purpose) { this.purpose = purpose; }

    public String getTimeRange() { return timeRange; }
    public void setTimeRange(String timeRange) { this.timeRange = timeRange; }

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
    public void setLabAssistantApprovedBy(String labAssistantApprovedBy) { this.labAssistantApprovedBy = labAssistantApprovedBy; }

    public String getLabAssistantApprovedAt() { return labAssistantApprovedAt; }
    public void setLabAssistantApprovedAt(String labAssistantApprovedAt) { this.labAssistantApprovedAt = labAssistantApprovedAt; }

    public Boolean getIsLate() { return isLate; }
    public void setIsLate(Boolean isLate) { this.isLate = isLate; }

    public Integer getDaysLate() { return daysLate; }
    public void setDaysLate(Integer daysLate) { this.daysLate = daysLate; }

    public String getLateReturnNotes() { return lateReturnNotes; }
    public void setLateReturnNotes(String lateReturnNotes) { this.lateReturnNotes = lateReturnNotes; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public String getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(String updatedAt) { this.updatedAt = updatedAt; }

    public String getReturnedAt() { return returnedAt; }
    public void setReturnedAt(String returnedAt) { this.returnedAt = returnedAt; }

    public String getAdminNotes() { return adminNotes; }
    public void setAdminNotes(String adminNotes) { this.adminNotes = adminNotes; }

    public String getBorrowDurationDays() { return borrowDurationDays; }
    public void setBorrowDurationDays(String borrowDurationDays) { this.borrowDurationDays = borrowDurationDays; }
}
