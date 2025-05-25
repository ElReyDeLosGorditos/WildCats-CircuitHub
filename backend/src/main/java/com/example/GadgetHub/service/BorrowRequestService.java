package com.example.GadgetHub.service;

import com.example.GadgetHub.model.BorrowRequest;
import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import com.google.firebase.cloud.FirestoreClient;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
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
        request.setStatus("Pending");
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

    public BorrowRequest updateStatus(String id, String status) throws ExecutionException, InterruptedException {
        DocumentReference docRef = firestore.collection("borrowRequests").document(id);
        ApiFuture<DocumentSnapshot> future = docRef.get();
        DocumentSnapshot document = future.get();
        
        if (document.exists()) {
            BorrowRequest request = document.toObject(BorrowRequest.class);
            
            // Update the status
            request.setStatus(status);
            docRef.set(request).get();
            
            // If approved, update the item status
            if ("Approved".equals(status)) {
                updateItemStatus(request.getItemId(), "Borrowed", request.getBorrowerId());
            }
            // If returned, update the item status back to Available
            else if ("Returned".equals(status)) {
                updateItemStatus(request.getItemId(), "Available", null);
            }
            
            return request;
        } else {
            throw new RuntimeException("Request not found");
        }
    }
    
    private void updateItemStatus(String itemId, String status, String borrowerId) throws ExecutionException, InterruptedException {
        if (itemId == null || itemId.isEmpty()) {
            return;
        }
        
        DocumentReference itemRef = firestore.collection("items").document(itemId);
        ApiFuture<DocumentSnapshot> future = itemRef.get();
        DocumentSnapshot document = future.get();
        
        if (document.exists()) {
            Map<String, Object> updates = new HashMap<>();
            updates.put("status", status);
            
            if ("Borrowed".equals(status)) {
                updates.put("borrowedBy", borrowerId);
                updates.put("borrowedAt", LocalDateTime.now().toString());
            } else if ("Available".equals(status)) {
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
}