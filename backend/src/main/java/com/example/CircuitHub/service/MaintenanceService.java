package com.example.CircuitHub.service;

import com.example.CircuitHub.model.Maintenance;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class MaintenanceService {

    private final List<Maintenance> maintenanceList = new ArrayList<>();

    public void requestMaintenance(Maintenance maintenance) {
        maintenance.setStatus("Pending");
        maintenanceList.add(maintenance);
    }

    public List<Maintenance> getAllMaintenance() {
        return new ArrayList<>(maintenanceList);
    }

    public List<Maintenance> getPendingRequests() {
        return maintenanceList.stream()
                .filter(m -> "Pending".equalsIgnoreCase(m.getStatus()))
                .collect(Collectors.toList());
    }

    public List<Maintenance> getUnderMaintenance() {
        return maintenanceList.stream()
                .filter(m -> "In Progress".equalsIgnoreCase(m.getStatus()))
                .collect(Collectors.toList());
    }

    public List<Maintenance> getDashboardOverview() {
        return new ArrayList<>(maintenanceList);
    }

    public boolean updateProgress(int id, String status, String progress) {
        Optional<Maintenance> mOpt = getMaintenanceById(id);
        if (mOpt.isPresent()) {
            Maintenance m = mOpt.get();
            m.setStatus(status);
            m.setProgress(progress);
            return true;
        }
        return false;
    }

    public Optional<Maintenance> getMaintenanceById(int id) {
        return maintenanceList.stream()
                .filter(m -> m.getMaintenanceId() == id)
                .findFirst();
    }

    public boolean deleteMaintenance(int id) {
        return maintenanceList.removeIf(m -> m.getMaintenanceId() == id);
    }
}
