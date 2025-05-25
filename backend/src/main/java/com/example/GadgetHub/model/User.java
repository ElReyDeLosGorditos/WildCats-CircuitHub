package com.example.GadgetHub.model;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Getter
@Setter
@NoArgsConstructor // Required for Firestore deserialization
@AllArgsConstructor
public class User {
    private String uid;             // Firebase UID
    private String firstName;       // First name
    private String lastName;        // Last name
    private String email;           // Email
    private String role;            // "admin" or "student"
    private String createdAt;       // Store as string for Firestore compatibility
    private String course;          // Course (e.g., BSIT)
    private String year;            // Year level (e.g., 4th Year)
    private String profileImageUrl; // URL to profile image
    
    // Helper method to get full name
    public String getFullName() {
        return firstName + " " + lastName;
    }
}