package com.example.CircuitHub.model;

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

    public User() {
        // no-args constructor
    }

    public User(String uid, String firstName, String lastName, String email, String role,
                String createdAt, String course, String year, String profileImageUrl) {
        this.uid = uid;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.role = role;
        this.createdAt = createdAt;
        this.course = course;
        this.year = year;
        this.profileImageUrl = profileImageUrl;
    }

    public String getUid() {
        return uid;
    }
    public void setUid(String uid) {
        this.uid = uid;
    }
    public String getFirstName() {
        return firstName;
    }
    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }
    public String getLastName() {
        return lastName;
    }
    public void setLastName(String lastName) {
        this.lastName = lastName;
    }
    public String getEmail() {
        return email;
    }
    public void setEmail(String email) {
        this.email = email;
    }
    public String getRole() {
        return role;
    }
    public void setRole(String role) {
        this.role = role;
    }
    public String getCreatedAt() {
        return createdAt;
    }
    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }
    public String getCourse() {
        return course;
    }
    public void setCourse(String course) {
        this.course = course;
    }
    public String getYear() {
        return year;
    }
    public void setYear(String year) {
        this.year = year;
    }
    public String getProfileImageUrl() {
        return profileImageUrl;
    }
    public void setProfileImageUrl(String profileImageUrl) {
        this.profileImageUrl = profileImageUrl;
    }
}