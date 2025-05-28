package com.example.CircuitHub.service;

import com.example.CircuitHub.dto.FirebaseUserDto;
import com.example.CircuitHub.dto.ProfileUpdateDto;
import com.example.CircuitHub.model.User;
import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import com.google.cloud.storage.BlobId;
import com.google.cloud.storage.BlobInfo;
import com.google.cloud.storage.Storage;
import com.google.firebase.cloud.FirestoreClient;
import com.google.firebase.cloud.StorageClient;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ExecutionException;

@Service
public class UserService {

    private final Firestore firestore;

    public UserService() {
        this.firestore = FirestoreClient.getFirestore();
    }

    public User syncUser(FirebaseUserDto dto) {
        try {
            if (dto.getUid() == null || dto.getUid().trim().isEmpty()) {
                throw new IllegalArgumentException("User ID cannot be null or empty");
            }

            if (dto.getEmail() == null || dto.getEmail().trim().isEmpty()) {
                throw new IllegalArgumentException("Email cannot be null or empty");
            }

            DocumentReference ref = firestore.collection("users").document(dto.getUid());
            ApiFuture<DocumentSnapshot> future = ref.get();
            DocumentSnapshot snapshot = future.get();

            if (snapshot.exists()) {
                User existing = snapshot.toObject(User.class);
                if (existing == null) throw new IllegalStateException("Invalid user object");

                Map<String, Object> updates = new HashMap<>();
                if (existing.getCourse() == null) updates.put("course", "");
                if (existing.getYear() == null) updates.put("year", "");
                if (existing.getProfileImageUrl() == null) updates.put("profileImageUrl", "");
                if (!updates.isEmpty()) {
                    ref.update(updates).get();
                }

                if (existing.getCourse() == null) existing.setCourse("");
                if (existing.getYear() == null) existing.setYear("");
                if (existing.getProfileImageUrl() == null) existing.setProfileImageUrl("");
                return existing;

            } else {
                User newUser = new User(
                        dto.getUid(),
                        dto.getFirstName() != null ? dto.getFirstName() : "Unnamed",
                        dto.getLastName() != null ? dto.getLastName() : "",
                        dto.getEmail(),
                        dto.getRole() != null ? dto.getRole() : "student",
                        LocalDateTime.now().toString(),
                        "",
                        "",
                        ""
                );

                Map<String, Object> data = new HashMap<>();
                data.put("uid", newUser.getUid());
                data.put("firstName", newUser.getFirstName());
                data.put("lastName", newUser.getLastName());
                data.put("email", newUser.getEmail());
                data.put("role", newUser.getRole());
                data.put("createdAt", newUser.getCreatedAt());
                data.put("course", "");
                data.put("year", "");
                data.put("profileImageUrl", "");

                System.out.println("🔄 Creating new user with data: " + data);

                try {
                    ref.set(data).get();
                } catch (Exception e) {
                    System.err.println("❌ Firestore write failed: " + e.getMessage());
                    throw new RuntimeException("Firestore set() failed", e);
                }

                return newUser;
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Error syncing user: interrupted operation", e);
        } catch (ExecutionException e) {
            throw new RuntimeException("Error syncing user: execution failed", e);
        } catch (Exception e) {
            System.err.println("❌ Unexpected sync error: " + e.getMessage());
            throw new RuntimeException("Error syncing user: " + e.getMessage(), e);
        }
    }

    public Optional<User> getUserByUid(String uid) {
        try {
            if (uid == null || uid.trim().isEmpty()) {
                return Optional.empty();
            }

            DocumentReference docRef = firestore.collection("users").document(uid);
            ApiFuture<DocumentSnapshot> future = docRef.get();
            DocumentSnapshot snapshot = future.get();

            if (!snapshot.exists()) {
                return Optional.empty();
            }

            User user = snapshot.toObject(User.class);
            if (user == null) {
                return Optional.empty();
            }

            if (user.getCourse() == null) user.setCourse("");
            if (user.getYear() == null) user.setYear("");
            if (user.getProfileImageUrl() == null) user.setProfileImageUrl("");

            return Optional.of(user);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Error retrieving user: interrupted operation", e);
        } catch (ExecutionException e) {
            throw new RuntimeException("Error retrieving user: execution failed", e);
        }
    }

    public User updateUserProfile(ProfileUpdateDto dto) throws ExecutionException, InterruptedException {
        if (dto.getUid() == null || dto.getUid().trim().isEmpty()) {
            throw new IllegalArgumentException("User ID cannot be null or empty");
        }

        DocumentReference ref = firestore.collection("users").document(dto.getUid());
        ApiFuture<DocumentSnapshot> future = ref.get();
        DocumentSnapshot snapshot = future.get();

        if (!snapshot.exists()) {
            throw new IllegalArgumentException("User not found: " + dto.getUid());
        }

        User user = snapshot.toObject(User.class);
        if (user == null) {
            throw new IllegalStateException("Invalid user document");
        }

        Map<String, Object> updates = new HashMap<>();
        if (dto.getFirstName() != null) {
            updates.put("firstName", dto.getFirstName());
            user.setFirstName(dto.getFirstName());
        }
        if (dto.getLastName() != null) {
            updates.put("lastName", dto.getLastName());
            user.setLastName(dto.getLastName());
        }
        if (dto.getCourse() != null) {
            updates.put("course", dto.getCourse());
            user.setCourse(dto.getCourse());
        }
        if (dto.getYear() != null) {
            updates.put("year", dto.getYear());
            user.setYear(dto.getYear());
        }

        if (!updates.isEmpty()) {
            ApiFuture<WriteResult> updateFuture = ref.update(updates);
            updateFuture.get();
        }

        if (user.getCourse() == null) user.setCourse("");
        if (user.getYear() == null) user.setYear("");
        if (user.getProfileImageUrl() == null) user.setProfileImageUrl("");

        return user;
    }

    public String uploadProfileImage(MultipartFile file, String uid) throws IOException, ExecutionException, InterruptedException {
        if (uid == null || uid.trim().isEmpty()) {
            throw new IllegalArgumentException("User ID cannot be null or empty");
        }

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File cannot be null or empty");
        }

        Storage storage = StorageClient.getInstance().bucket().getStorage();
        String bucketName = StorageClient.getInstance().bucket().getName();
        String filename = uid + "_" + UUID.randomUUID();
        String path = "profile-images/" + filename;
        String contentType = file.getContentType() != null ? file.getContentType() : "image/jpeg";

        BlobId blobId = BlobId.of(bucketName, path);
        BlobInfo blobInfo = BlobInfo.newBuilder(blobId)
                .setContentType(contentType)
                .build();

        storage.create(blobInfo, file.getBytes());

        String imageUrl = String.format("https://storage.googleapis.com/%s/%s", bucketName, path);

        DocumentReference ref = firestore.collection("users").document(uid);
        ApiFuture<WriteResult> updateFuture = ref.update("profileImageUrl", imageUrl);
        updateFuture.get();

        return imageUrl;
    }
}
