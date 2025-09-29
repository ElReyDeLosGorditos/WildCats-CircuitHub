package com.example.CircuitHub.service;

import com.example.CircuitHub.model.Maintenance;
import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import com.google.firebase.cloud.FirestoreClient;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ExecutionException;

@Service
public class MaintenanceService {

    private final Firestore firestore;

    public MaintenanceService() {
        this.firestore = FirestoreClient.getFirestore();
    }

    public Maintenance requestMaintenance(Maintenance maintenance) {
        if (maintenance.getEquipmentName() == null || maintenance.getEquipmentName().isEmpty()) {
            throw new IllegalArgumentException("Equipment name is required");
        }

        maintenance.setStatus(maintenance.getStatus() != null ? maintenance.getStatus() : "Pending");

        // 🔧 Create document reference to get ID first
        DocumentReference ref = firestore.collection("maintenance").document();
        String generatedId = ref.getId();
        maintenance.setMaintenanceId(generatedId);

        Map<String, Object> data = new HashMap<>();
        data.put("maintenanceId", generatedId); // ✅ Save it in Firestore
        data.put("equipmentName", maintenance.getEquipmentName());
        data.put("issue", maintenance.getIssue());
        data.put("status", maintenance.getStatus());
        data.put("requestDate", maintenance.getRequestDate().toString());

        ApiFuture<WriteResult> future = ref.set(data);
        try {
            future.get();
        } catch (Exception e) {
            throw new RuntimeException("Error saving maintenance request: " + e.getMessage(), e);
        }

        return maintenance;
    }

    public List<Maintenance> getAllMaintenance() throws ExecutionException, InterruptedException {
        ApiFuture<QuerySnapshot> future = firestore.collection("maintenance").get();
        List<Maintenance> maintenanceList = future.get().toObjects(Maintenance.class);
        return maintenanceList;
    }

    public List<Maintenance> getPendingRequests() throws ExecutionException, InterruptedException {
        ApiFuture<QuerySnapshot> future = firestore.collection("maintenance")
                .whereEqualTo("status", "Pending")
                .get();
        return future.get().toObjects(Maintenance.class);
    }

    public boolean updateProgress(String maintenanceId, String equipmentName, String issue, String status, String requestDate) {
        DocumentReference ref = firestore.collection("maintenance").document(maintenanceId);
        ApiFuture<DocumentSnapshot> future = ref.get();
        try {
            DocumentSnapshot snapshot = future.get();
            if (!snapshot.exists()) {
                return false;
            }

            // 🔍 Lookup item by equipmentName
            CollectionReference itemsRef = firestore.collection("items");
            QuerySnapshot itemQuery = itemsRef.whereEqualTo("name", equipmentName).get().get();
            if (itemQuery.isEmpty()) {
                throw new RuntimeException("No item found with equipment name: " + equipmentName);
            }

            DocumentSnapshot itemDoc = itemQuery.getDocuments().get(0);
            String itemId = itemDoc.getId();
            Long quantity = itemDoc.getLong("quantity");
            if (quantity == null) quantity = 0L;

            // ✅ SAFETY CHECK
            if ("In Progress".equals(status) && quantity <= 0) {
                throw new RuntimeException("Item is out of stock and cannot be sent to maintenance.");
            }

            // ✅ Update item status and quantity
            if ("In Progress".equals(status)) {
                updateItemStatus(itemId, "Maintenance", -1);
            } else if ("Completed".equals(status)) {
                updateItemStatus(itemId, "Available", 1);
            }

            Map<String, Object> updates = new HashMap<>();
            updates.put("equipmentName", equipmentName);
            updates.put("issue", issue);
            updates.put("status", status);
            updates.put("requestDate", requestDate);

            ref.update(updates).get();
            return true;

        } catch (Exception e) {
            throw new RuntimeException("Error updating maintenance record: " + e.getMessage(), e);
        }
    }

    private void updateItemStatus(String itemId, String status, int quantityChange) throws ExecutionException, InterruptedException {
        DocumentReference itemRef = firestore.collection("items").document(itemId);
        DocumentSnapshot document = itemRef.get().get();

        if (document.exists()) {
            Map<String, Object> updates = new HashMap<>();
            Long currentQty = document.getLong("quantity");
            if (currentQty == null) currentQty = 0L;

            updates.put("status", status);
            updates.put("quantity", currentQty + quantityChange);

            if ("Maintenance".equals(status)) {
                updates.put("maintenanceAt", java.time.LocalDateTime.now().toString());
            } else if ("Available".equals(status)) {
                updates.put("returnedFromMaintenanceAt", java.time.LocalDateTime.now().toString());
            }

            itemRef.update(updates).get();
        }
    }

    public Optional<Maintenance> getMaintenanceById(String maintenanceId) throws ExecutionException, InterruptedException {
        DocumentReference ref = firestore.collection("maintenance").document(maintenanceId);
        ApiFuture<DocumentSnapshot> future = ref.get();
        DocumentSnapshot snapshot = future.get();

        if (snapshot.exists()) {
            Maintenance maintenance = snapshot.toObject(Maintenance.class);
            return Optional.ofNullable(maintenance);
        }
        return Optional.empty();
    }

    public boolean deleteMaintenance(String maintenanceId) throws ExecutionException, InterruptedException {
        DocumentReference ref = firestore.collection("maintenance").document(maintenanceId);
        ApiFuture<WriteResult> deleteFuture = ref.delete();
        try {
            deleteFuture.get();
            return true;
        } catch (Exception e) {
            throw new RuntimeException("Error deleting maintenance request: " + e.getMessage(), e);
        }
    }
}