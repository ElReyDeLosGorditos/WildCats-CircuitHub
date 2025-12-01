package com.example.CircuitHub.security;

public class FirebaseUserDetails {
    private final String uid;
    private final String email;
    private final String role;
    
    public FirebaseUserDetails(String uid, String email, String role) {
        this.uid = uid;
        this.email = email;
        this.role = role;
    }
    
    public String getUid() {
        return uid;
    }
    
    public String getEmail() {
        return email;
    }
    
    public String getRole() {
        return role;
    }
}
