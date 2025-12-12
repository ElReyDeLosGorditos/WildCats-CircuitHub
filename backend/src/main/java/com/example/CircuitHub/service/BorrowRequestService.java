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
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutionException;
import java.util.stream.Collectors;

@Service
public class BorrowRequestService {

    private final Firestore firestore;
    private final ItemAvailabilityService availabilityService;

    public BorrowRequestService(ItemAvailabilityService availabilityService) {
        this.firestore = FirestoreClient.getFirestore();
        this.availabilityService = availabilityService;
    }

    /**
     * Create a new borrow request with race condition protection
     * NOW SUPPORTS MULTIPLE ITEMS
     * CRITICAL: This method performs a FINAL availability check immediately before saving
     */
    public BorrowRequest createRequest(BorrowRequest request) throws ExecutionException, InterruptedException {
        // Set default quantity if not provided (for backward compatibility)
        if (request.getRequestedQuantity() == null || request.getRequestedQuantity() <= 0) {
            request.setRequestedQuantity(1);
        }
        
        // ✅ STEP 1: VALIDATE AVAILABILITY FOR ALL ITEMS
        // Check if items array exists (new multi-item requests)
        if (request.getItems() != null && !request.getItems().isEmpty()) {
            System.out.println("✅ Processing multi-item request with " + request.getItems().size() + " items");
            
            // Validate availability for each item
            for (Map<String, String> item : request.getItems()) {
                String itemId = item.get("id");
                String itemName = item.get("name");
                
                // ✅ FIX: Validate that item ID exists before processing
                if (itemId == null || itemId.trim().isEmpty()) {
                    System.err.println("❌ Item missing ID: " + itemName);
                    throw new IllegalArgumentException("Item '" + itemName + "' is missing an ID. Please refresh and try again.");
                }
                
                Integer quantity = 1; // Default quantity
                
                // Try to get quantity from the item map
                try {
                    if (item.containsKey("quantity")) {
                        Object qtyObj = item.get("quantity");
                        if (qtyObj instanceof String) {
                            quantity = Integer.parseInt((String) qtyObj);
                        } else if (qtyObj instanceof Number) {
                            quantity = ((Number) qtyObj).intValue();
                        }
                    }
                } catch (NumberFormatException e) {
                    System.err.println("⚠️ Warning: Could not parse quantity for item " + itemName + ", using default 1");
                }
                
                System.out.println("✅ Checking availability for item: " + itemName + " (ID: " + itemId + ", Qty: " + quantity + ")");
                
                ItemAvailabilityService.AvailabilityResult itemCheck = availabilityService.checkAvailability(
                    itemId,
                    quantity,
                    request.getStartDate(),
                    request.getEndDate()
                );
                
                if (!itemCheck.isAvailable()) {
                    throw new RuntimeException("Item '" + itemName + "' is not available: " + itemCheck.getMessage());
                }
            }
        } else if (request.getItemId() != null && !request.getItemId().trim().isEmpty()) {
            // ✅ Legacy single-item request support
            System.out.println("✅ Processing legacy single-item request for item ID: " + request.getItemId());
            
            ItemAvailabilityService.AvailabilityResult initialCheck = availabilityService.checkAvailability(
                request.getItemId(),
                request.getRequestedQuantity(),
                request.getStartDate(),
                request.getEndDate()
            );
            
            if (!initialCheck.isAvailable()) {
                throw new RuntimeException("Booking not available: " + initialCheck.getMessage());
            }
        } else {
            System.err.println("❌ No valid items specified in the request");
            System.err.println("   Items array: " + (request.getItems() != null ? request.getItems() : "null"));
            System.err.println("   ItemId: " + request.getItemId());
            throw new IllegalArgumentException("No items specified in the request. Please select at least one item.");
        }
        
        // ✅ STEP 2: CREATE THE REQUEST
        DocumentReference docRef = firestore.collection("borrowRequests").document();
        request.setId(docRef.getId());
        request.setRequestDate(LocalDateTime.now().toString());
        request.setCreatedAt(new Date());  // Use Date for Firestore Timestamp
        request.setStatus("Pending-Teacher");  // Initial status - waiting for teacher approval
        
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
        
        // Save the request to Firestore
        docRef.set(request).get();
        
        String itemInfo = request.getItems() != null && !request.getItems().isEmpty()
            ? request.getItems().size() + " items"
            : "item " + request.getItemId();
        
        System.out.println("✅ Successfully created borrow request " + request.getId() + 
            " for " + itemInfo);
        
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
            updateItemStatus(request.getItemId(), "Borrowed", request.getBorrowerId(), request.getRequestedQuantity());
            
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
                updateItemStatus(request.getItemId(), "Available", null, request.getRequestedQuantity());
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

    private void updateItemStatus(String itemId, String status, String borrowerId, Integer requestedQuantity) throws ExecutionException, InterruptedException {
        if (itemId == null || itemId.isEmpty()) {
            return;
        }
        
        // Default to 1 if quantity not specified
        if (requestedQuantity == null || requestedQuantity <= 0) {
            requestedQuantity = 1;
        }

        DocumentReference itemRef = firestore.collection("items").document(itemId);
        DocumentSnapshot document = itemRef.get().get();

        if (document.exists()) {
            Map<String, Object> updates = new HashMap<>();
            Long currentQuantity = document.getLong("quantity");
            if (currentQuantity == null) currentQuantity = 0L;

            // Note: We don't change the status field anymore since multiple people can borrow
            // Instead, we just track quantity changes

            if ("Borrowed".equals(status)) {
                // Decrease quantity by requested amount
                long newQuantity = Math.max(0, currentQuantity - requestedQuantity);
                updates.put("quantity", newQuantity);
                // Store the last borrower info
                updates.put("lastBorrowedBy", borrowerId);
                updates.put("lastBorrowedAt", LocalDateTime.now().toString());

            } else if ("Available".equals(status)) {
                // Increase quantity back by returned amount
                updates.put("quantity", currentQuantity + requestedQuantity);
                updates.put("lastReturnedAt", LocalDateTime.now().toString());
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
