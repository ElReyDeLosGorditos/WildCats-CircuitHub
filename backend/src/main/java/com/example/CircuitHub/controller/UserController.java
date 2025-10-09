package com.example.CircuitHub.controller;

import com.example.CircuitHub.dto.FirebaseUserDto;
import com.example.CircuitHub.dto.ProfileUpdateDto;
import com.example.CircuitHub.model.User;
import com.example.CircuitHub.service.UserService;
import com.google.firebase.cloud.FirestoreClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api") // No @CrossOrigin here; CORS is globally configured
public class UserController {

    private final UserService userService;

    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/sync/user")
    public ResponseEntity<?> syncUser(@RequestBody FirebaseUserDto firebaseUserDto) {
        try {
            System.out.println("Received sync request for: " + firebaseUserDto.getUid() + ", " + firebaseUserDto.getEmail());
            User syncedUser = userService.syncUser(firebaseUserDto);
            return ResponseEntity.ok(syncedUser);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            errorResponse.put("cause", e.getCause() != null ? e.getCause().getMessage() : "Unknown");
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @GetMapping("/sync/get-by-uid")
    public ResponseEntity<User> getUserByUid(@RequestParam String uid) {
        return userService.getUserByUid(uid)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/sync/test-firestore")
    public ResponseEntity<String> testFirestore() {
        try {
            Map<String, Object> data = new HashMap<>();
            data.put("test", "value");
            data.put("timestamp", java.time.LocalDateTime.now().toString());

            FirestoreClient.getFirestore().collection("test").document("test-doc").set(data).get();
            return ResponseEntity.ok("Firestore write successful");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Firestore error: " + e.getMessage());
        }
    }

    @PostMapping("/sync/set-admin")
    public ResponseEntity<?> setAdmin(@RequestParam String uid) {
        try {
            var docRef = FirestoreClient.getFirestore().collection("users").document(uid);
            Map<String, Object> updates = new HashMap<>();
            updates.put("role", "admin");
            docRef.update(updates).get();
            return ResponseEntity.ok(Map.of("success", true, "message", "User set as admin"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/users/{uid}/profile")
    public ResponseEntity<?> getUserProfile(@PathVariable String uid) {
        try {
            System.out.println("GET Profile requested for user: " + uid);
            return userService.getUserByUid(uid)
                    .map(user -> {
                        System.out.println("Found user: " + user.getFirstName() + " " + user.getLastName());
                        return ResponseEntity.ok(user);
                    })
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            System.err.println("Error fetching profile: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Failed to fetch profile: " + e.getMessage()));
        }
    }

    @PutMapping("/users/{uid}/profile")
    public ResponseEntity<?> updateUserProfile(
            @PathVariable String uid,
            @RequestBody ProfileUpdateDto profileUpdateDto) {
        try {
            System.out.println("PUT Profile update requested for user: " + uid);
            if (!uid.equals(profileUpdateDto.getUid())) {
                return ResponseEntity.badRequest().body(Map.of("error", "User ID mismatch"));
            }

            User updatedUser = userService.updateUserProfile(profileUpdateDto);
            System.out.println("Profile updated successfully for: " + updatedUser.getFirstName());
            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            System.err.println("Error updating profile: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(  "error", "Failed to update profile: " + e.getMessage()));
        }
    }

    @PostMapping("/users/{uid}/profile-image")
    public ResponseEntity<?> uploadProfileImage(
            @PathVariable String uid,
            @RequestParam("image") MultipartFile file) {
        try {
            System.out.println("POST Profile image upload requested for user: " + uid);
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Please upload a file"));
            }

            String imageUrl = userService.uploadProfileImage(file, uid);
            System.out.println("Profile image uploaded successfully: " + imageUrl);
            return ResponseEntity.ok(Map.of("imageUrl", imageUrl));
        } catch (Exception e) {
            System.err.println("Error uploading profile image: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Failed to upload image: " + e.getMessage()));
        }
    }
}