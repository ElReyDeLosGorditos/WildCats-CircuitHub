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

        maintenance.setStatus("Pending");

        Map<String, Object> data = new HashMap<>();
        data.put("equipmentName", maintenance.getEquipmentName());
        data.put("issue", maintenance.getIssue());
        data.put("status", maintenance.getStatus());
        data.put("date", maintenance.getRequestDate());

        DocumentReference ref = firestore.collection("maintenance").document();
        ApiFuture<WriteResult> future = ref.set(data);
        try {
            future.get();
        } catch (Exception e) {
            throw new RuntimeException("Error saving maintenance request: " + e.getMessage(), e);
        }

        maintenance.setMaintenanceId(ref.getId());
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

    public boolean updateProgress(String maintenanceId, String status, String progress) {
        DocumentReference ref = firestore.collection("maintenance").document(maintenanceId);
        ApiFuture<DocumentSnapshot> future = ref.get();
        try {
            DocumentSnapshot snapshot = future.get();
            if (!snapshot.exists()) {
                return false;
            }

            Map<String, Object> updates = new HashMap<>();
            updates.put("status", status);
            updates.put("progress", progress);

            ApiFuture<WriteResult> updateFuture = ref.update(updates);
            updateFuture.get();

            return true;
        } catch (Exception e) {
            throw new RuntimeException("Error updating maintenance progress: " + e.getMessage(), e);
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