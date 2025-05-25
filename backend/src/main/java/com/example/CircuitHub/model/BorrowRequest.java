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

    // Request details
    private String requestDate;
    private String startDate;     // When borrowing starts
    private String endDate;       // When borrowing ends
    private String status;        // Pending, Approved, Rejected, Returned
    private String purpose;       // Reason for borrowing
    private String timeRange;     // Formatted time range for display

    // Item details
    private String description;
    private String itemCondition; // Matches to condition in the frontend

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

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getItemCondition() { return itemCondition; }
    public void setItemCondition(String itemCondition) { this.itemCondition = itemCondition; }

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