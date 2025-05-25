package com.example.GadgetHub.model;

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
}