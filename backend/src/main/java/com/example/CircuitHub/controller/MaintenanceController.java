package com.example.CircuitHub.controller;

import com.example.CircuitHub.model.Maintenance;
import com.example.CircuitHub.service.MaintenanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.concurrent.ExecutionException;

@RestController
@RequestMapping("/api/maintenance")
// @CrossOrigin(origins = "https://ccs-gadgethubb.onrender.com", allowCredentials = "true")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"}, allowCredentials = "true")
public class MaintenanceController {

    private final MaintenanceService maintenanceService;

    @Autowired
    public MaintenanceController(MaintenanceService maintenanceService) {
        this.maintenanceService = maintenanceService;
    }

    // Create a maintenance request
    @PostMapping("/request")
    public ResponseEntity<String> requestMaintenance(@RequestBody Maintenance maintenance) {
        System.out.println("Received Maintenance Data: " + maintenance.toString());
        Maintenance savedMaintenance = maintenanceService.requestMaintenance(maintenance);
        return ResponseEntity.ok("Maintenance request submitted successfully. ID: " + savedMaintenance.getMaintenanceId());
    }

    // Get all maintenance records
    @GetMapping("/all")
    public ResponseEntity<List<Maintenance>> getAllMaintenance() throws ExecutionException, InterruptedException {
        return ResponseEntity.ok(maintenanceService.getAllMaintenance());
    }

    // Get pending maintenance requests
    @GetMapping("/pending")
    public ResponseEntity<List<Maintenance>> getPendingRequests() throws ExecutionException, InterruptedException {
        return ResponseEntity.ok(maintenanceService.getPendingRequests());
    }

    // Get under maintenance list
//    @GetMapping("/in-progress")
//    public ResponseEntity<List<Maintenance>> getUnderMaintenance() {
//        return ResponseEntity.ok(maintenanceService.getUnderMaintenance());
//    }

    // Dashboard view
//    @GetMapping("/dashboard")
//    public ResponseEntity<List<Maintenance>> getDashboardOverview() {
//        return ResponseEntity.ok(maintenanceService.getDashboardOverview());
//    }

    // Update status and progress
    @PutMapping("/{id}/update-progress")
    public ResponseEntity<String> updateProgress(
            @PathVariable String id,  // ID is now a String (Firestore auto-generated ID)
            @RequestParam String status,
            @RequestParam String progress) {

        boolean updated = maintenanceService.updateProgress(id, status, progress);
        if (updated) {
            return ResponseEntity.ok("Progress updated successfully.");
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // Delete maintenance by ID
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteMaintenance(@PathVariable String id) throws ExecutionException, InterruptedException {  // ID is now a String
        boolean deleted = maintenanceService.deleteMaintenance(id);
        if (deleted) {
            return ResponseEntity.ok("Maintenance request deleted.");
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // Get maintenance by ID
    @GetMapping("/{id}")
    public ResponseEntity<Maintenance> getMaintenanceById(@PathVariable String id) throws ExecutionException, InterruptedException {
        Optional<Maintenance> maintenance = maintenanceService.getMaintenanceById(id);
        return maintenance.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}