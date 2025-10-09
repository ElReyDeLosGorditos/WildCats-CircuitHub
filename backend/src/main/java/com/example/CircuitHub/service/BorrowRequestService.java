package com.example.CircuitHub.service;

import com.example.CircuitHub.model.BorrowRequest;
import com.example.CircuitHub.model.User;
import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import com.google.firebase.cloud.FirestoreClient;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutionException;
import java.util.stream.Collectors;

@Service
public class BorrowRequestService {

    private final Firestore firestore;

    public BorrowRequestService() {
        this.firestore = FirestoreClient.getFirestore();
    }

    public BorrowRequest createRequest(BorrowRequest request) throws ExecutionException, InterruptedException {
        DocumentReference docRef = firestore.collection("borrowRequests").document();
        request.setId(docRef.getId());
        request.setRequestDate(LocalDateTime.now().toString());
        request.setCreatedAt(LocalDateTime.now().toString());
        request.setStatus("Pending");  // Initial status - waiting for teacher approval
        
        // Initialize late tracking fields
        request.setIsLate(false);
        request.setDaysLate(0);
        
        // Fetch borrower details to include course and year
        if (request.getBorrowerId() != null) {
            DocumentReference userRef = firestore.collection("users").document(request.getBorrowerId());
            DocumentSnapshot userDoc = userRef.get().get();
            if (userDoc.exists()) {
                User user = userDoc.toObject(User.class);
                if (user != null) {
                    request.setBorrowerCourse(user.getCourse());
                    request.setBorrowerYear(user.getYear());
                }
            }
        }
        
        docRef.set(request).get();
        return request;
    }

    public List<BorrowRequest> getAllRequests() throws ExecutionException, InterruptedException {
        ApiFuture<QuerySnapshot> future = firestore.collection("borrowRequests").get();
        List<QueryDocumentSnapshot> documents = future.get().getDocuments();
        return documents.stream()
                .map(doc -> doc.toObject(BorrowRequest.class))
                .collect(Collectors.toList());
    }
    
    public List<BorrowRequest> getRequestsByStatus(String status) throws ExecutionException, InterruptedException {
        ApiFuture<QuerySnapshot> future = firestore.collection("borrowRequests")
                .whereEqualTo("status", status)
                .get();
        List<QueryDocumentSnapshot> documents = future.get().getDocuments();
        return documents.stream()
                .map(doc -> doc.toObject(BorrowRequest.class))
                .collect(Collectors.toList());
    }
    
    public List<BorrowRequest> getRequestsByBorrowerId(String borrowerId) throws ExecutionException, InterruptedException {
        ApiFuture<QuerySnapshot> future = firestore.collection("borrowRequests")
                .whereEqualTo("borrowerId", borrowerId)
                .get();
        List<QueryDocumentSnapshot> documents = future.get().getDocuments();
        return documents.stream()
                .map(doc -> doc.toObject(BorrowRequest.class))
                .collect(Collectors.toList());
    }
    
    // NEW: Get requests pending teacher approval
    public List<BorrowRequest> getPendingTeacherApproval() throws ExecutionException, InterruptedException {
        ApiFuture<QuerySnapshot> future = firestore.collection("borrowRequests")
                .whereEqualTo("status", "Pending")
                .get();
        List<QueryDocumentSnapshot> documents = future.get().getDocuments();
        return documents.stream()
                .map(doc -> doc.toObject(BorrowRequest.class))
                .collect(Collectors.toList());
    }
    
    // NEW: Get requests pending lab assistant approval (teacher already approved)
    public List<BorrowRequest> getPendingLabApproval() throws ExecutionException, InterruptedException {
        ApiFuture<QuerySnapshot> future = firestore.collection("borrowRequests")
                .whereEqualTo("status", "Teacher-Approved")
                .get();
        List<QueryDocumentSnapshot> documents = future.get().getDocuments();
        return documents.stream()
                .map(doc -> doc.toObject(BorrowRequest.class))
                .collect(Collectors.toList());
    }
    
    public BorrowRequest getRequestById(String id) throws ExecutionException, InterruptedException {
        DocumentReference docRef = firestore.collection("borrowRequests").document(id);
        ApiFuture<DocumentSnapshot> future = docRef.get();
        DocumentSnapshot document = future.get();
        
        if (document.exists()) {
            return document.toObject(BorrowRequest.class);
        } else {
            return null;
        }
    }

    // NEW: Teacher approval method
    public BorrowRequest teacherApprove(String requestId, String teacherId, String teacherName) throws ExecutionException, InterruptedException {
        DocumentReference docRef = firestore.collection("borrowRequests").document(requestId);
        DocumentSnapshot document = docRef.get().get();
        
        if (document.exists()) {
            BorrowRequest request = document.toObject(BorrowRequest.class);
            
            request.setStatus("Teacher-Approved");
            request.setTeacherApprovedBy(teacherName);
            request.setTeacherApprovedAt(LocalDateTime.now().toString());
            request.setUpdatedAt(LocalDateTime.now().toString());
            
            docRef.set(request).get();
            return request;
        } else {
            throw new RuntimeException("Request not found");
        }
    }
    
    // NEW: Lab assistant approval method
    public BorrowRequest labApprove(String requestId, String labAssistantId, String labAssistantName) throws ExecutionException, InterruptedException {
        DocumentReference docRef = firestore.collection("borrowRequests").document(requestId);
        DocumentSnapshot document = docRef.get().get();
        
        if (document.exists()) {
            BorrowRequest request = document.toObject(BorrowRequest.class);
            
            // Can only approve if teacher has already approved
            if (!"Teacher-Approved".equals(request.getStatus())) {
                throw new RuntimeException("Request must be teacher-approved first");
            }
            
            request.setStatus("Approved");
            request.setLabAssistantApprovedBy(labAssistantName);
            request.setLabAssistantApprovedAt(LocalDateTime.now().toString());
            request.setUpdatedAt(LocalDateTime.now().toString());
            
            docRef.set(request).get();
            
            // Update item status to Borrowed
            updateItemStatus(request.getItemId(), "Borrowed", request.getBorrowerId());
            
            return request;
        } else {
            throw new RuntimeException("Request not found");
        }
    }

    public BorrowRequest updateStatus(String id, String status) throws ExecutionException, InterruptedException {
        DocumentReference docRef = firestore.collection("borrowRequests").document(id);
        ApiFuture<DocumentSnapshot> future = docRef.get();
        DocumentSnapshot document = future.get();
        
        if (document.exists()) {
            BorrowRequest request = document.toObject(BorrowRequest.class);
            
            // Update the status
            request.setStatus(status);
            request.setUpdatedAt(LocalDateTime.now().toString());
            
            // If returned, check if it's late and update user's late count
            if ("Returned".equals(status)) {
                request.setReturnedAt(LocalDateTime.now().toString());
                
                // Check if return is late
                if (request.getEndDate() != null) {
                    try {
                        LocalDate endDate = LocalDate.parse(request.getEndDate(), DateTimeFormatter.ISO_DATE_TIME);
                        LocalDate returnDate = LocalDate.now();
                        
                        if (returnDate.isAfter(endDate)) {
                            long daysLate = ChronoUnit.DAYS.between(endDate, returnDate);
                            request.setIsLate(true);
                            request.setDaysLate((int) daysLate);
                            
                            // Update user's late return count
                            updateUserLateCount(request.getBorrowerId());
                        }
                    } catch (Exception e) {
                        System.err.println("Error parsing dates for late check: " + e.getMessage());
                    }
                }
                
                // Update item status back to Available
                updateItemStatus(request.getItemId(), "Available", null);
            }
            
            docRef.set(request).get();
            return request;
        } else {
            throw new RuntimeException("Request not found");
        }
    }
    
    // NEW: Update user's late return count
    private void updateUserLateCount(String userId) throws ExecutionException, InterruptedException {
        if (userId == null || userId.isEmpty()) {
            return;
        }
        
        DocumentReference userRef = firestore.collection("users").document(userId);
        DocumentSnapshot userDoc = userRef.get().get();
        
        if (userDoc.exists()) {
            User user = userDoc.toObject(User.class);
            if (user != null) {
                Integer currentCount = user.getLateReturnCount();
                if (currentCount == null) {
                    currentCount = 0;
                }
                
                Map<String, Object> updates = new HashMap<>();
                updates.put("lateReturnCount", currentCount + 1);
                updates.put("lastLateReturnDate", LocalDateTime.now().toString());
                
                userRef.update(updates).get();
            }
        }
    }

    private void updateItemStatus(String itemId, String status, String borrowerId) throws ExecutionException, InterruptedException {
        if (itemId == null || itemId.isEmpty()) {
            return;
        }

        DocumentReference itemRef = firestore.collection("items").document(itemId);
        DocumentSnapshot document = itemRef.get().get();

        if (document.exists()) {
            Map<String, Object> updates = new HashMap<>();
            Long currentQuantity = document.getLong("quantity");
            if (currentQuantity == null) currentQuantity = 0L;

            updates.put("status", status);

            if ("Borrowed".equals(status)) {
                // Decrease quantity only if it's greater than 0
                if (currentQuantity > 0) {
                    updates.put("quantity", currentQuantity - 1);
                }
                updates.put("borrowedBy", borrowerId);
                updates.put("borrowedAt", LocalDateTime.now().toString());

            } else if ("Available".equals(status)) {
                // Increase quantity back
                updates.put("quantity", currentQuantity + 1);
                updates.put("borrowedBy", null);
                updates.put("returnedAt", LocalDateTime.now().toString());
            }

            itemRef.update(updates).get();
        }
    }
    
    public boolean deleteRequest(String id) throws ExecutionException, InterruptedException {
        DocumentReference docRef = firestore.collection("borrowRequests").document(id);
        ApiFuture<DocumentSnapshot> future = docRef.get();
        DocumentSnapshot document = future.get();
        
        if (document.exists()) {
            docRef.delete().get();
            return true;
        } else {
            return false;
        }
    }
    
    // NEW: Get user's borrow history with late return info
    public Map<String, Object> getUserBorrowHistory(String userId) throws ExecutionException, InterruptedException {
        // Get user info
        DocumentReference userRef = firestore.collection("users").document(userId);
        DocumentSnapshot userDoc = userRef.get().get();
        
        Map<String, Object> history = new HashMap<>();
        
        if (userDoc.exists()) {
            User user = userDoc.toObject(User.class);
            if (user != null) {
                history.put("lateReturnCount", user.getLateReturnCount());
                history.put("lastLateReturnDate", user.getLastLateReturnDate());
            }
        }
        
        // Get all user's requests
        List<BorrowRequest> requests = getRequestsByBorrowerId(userId);
        history.put("requests", requests);
        history.put("totalRequests", requests.size());
        
        // Count late returns from requests
        long lateReturns = requests.stream()
                .filter(r -> Boolean.TRUE.equals(r.getIsLate()))
                .count();
        history.put("lateReturnsFromHistory", lateReturns);
        
        return history;
    }
}
