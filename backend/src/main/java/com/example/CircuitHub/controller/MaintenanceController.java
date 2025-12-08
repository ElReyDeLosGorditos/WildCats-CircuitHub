package com.example.CircuitHub.controller;

import com.example.CircuitHub.model.Maintenance;
import com.example.CircuitHub.security.RoleAuthorization;
import com.example.CircuitHub.service.MaintenanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ExecutionException;

@RestController
@RequestMapping("/api/maintenance")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"}, allowCredentials = "true")
public class MaintenanceController {

    private final MaintenanceService maintenanceService;

    @Autowired
    public MaintenanceController(MaintenanceService maintenanceService) {
        this.maintenanceService = maintenanceService;
    }

    // Only admin and lab assistants can create maintenance requests
    @RoleAuthorization.AdminOrLabAssistant
    @PostMapping("/request")
    public ResponseEntity<String> requestMaintenance(@RequestBody Maintenance maintenance) {
        System.out.println("Received Maintenance Data: " + maintenance.toString());
        Maintenance savedMaintenance = maintenanceService.requestMaintenance(maintenance);
        return ResponseEntity.ok("Maintenance request submitted successfully. ID: " + savedMaintenance.getMaintenanceId());
    }

    // Staff can view all maintenance records
    @RoleAuthorization.StaffOnly
    @GetMapping("/all")
    public ResponseEntity<List<Maintenance>> getAllMaintenance() throws ExecutionException, InterruptedException {
        return ResponseEntity.ok(maintenanceService.getAllMaintenance());
    }

    // Staff can view pending requests
    @RoleAuthorization.StaffOnly
    @GetMapping("/pending")
    public ResponseEntity<List<Maintenance>> getPendingRequests() throws ExecutionException, InterruptedException {
        return ResponseEntity.ok(maintenanceService.getPendingRequests());
    }

    // Admin and lab assistants can update progress
    @RoleAuthorization.AdminOrLabAssistant
    @PutMapping("/{id}/update-progress")
    public ResponseEntity<String> updateProgress(
            @PathVariable String id,
            @RequestParam String equipmentName,
            @RequestParam String issue,
            @RequestParam String status,
            @RequestParam String requestDate) {

        boolean updated = maintenanceService.updateProgress(id, equipmentName, issue, status, requestDate);
        if (updated) {
            return ResponseEntity.ok("Maintenance record updated successfully.");
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // Admin and lab assistants can delete maintenance records
    @RoleAuthorization.AdminOrLabAssistant
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteMaintenance(@PathVariable String id) throws ExecutionException, InterruptedException {
        boolean deleted = maintenanceService.deleteMaintenance(id);
        if (deleted) {
            return ResponseEntity.ok("Maintenance request deleted.");
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // Staff can view individual maintenance records
    @RoleAuthorization.StaffOnly
    @GetMapping("/{id}")
    public ResponseEntity<Maintenance> getMaintenanceById(@PathVariable String id) throws ExecutionException, InterruptedException {
        Optional<Maintenance> maintenance = maintenanceService.getMaintenanceById(id);
        return maintenance.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
