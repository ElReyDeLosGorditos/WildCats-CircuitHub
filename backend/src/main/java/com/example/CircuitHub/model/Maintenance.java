package com.example.CircuitHub.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.time.LocalDate;

@JsonIgnoreProperties(ignoreUnknown = true) // ✅ Allows extra fields like scheduleDate
public class Maintenance {

    private String maintenanceId; // Firestore auto-generated ID
    private String equipmentName;
    private String issue;

    private String requestDate;

    private String status;

    // ✅ Default constructor (required for JSON deserialization)
    public Maintenance() {}

    // ✅ Custom constructor
    public Maintenance(String equipmentName, String issue, String requestDate, String status) {
        this.equipmentName = equipmentName;
        this.issue = issue;
        this.requestDate = requestDate;
        this.status = status;
    }

    // ✅ Getters and Setters

    public String getMaintenanceId() {
        return maintenanceId;
    }

    public void setMaintenanceId(String maintenanceId) {
        this.maintenanceId = maintenanceId;
    }

    public String getEquipmentName() {
        return equipmentName;
    }

    public void setEquipmentName(String equipmentName) {
        this.equipmentName = equipmentName;
    }

    public String getIssue() {
        return issue;
    }

    public void setIssue(String issue) {
        this.issue = issue;
    }

    public String getRequestDate() {
        return requestDate;
    }

    public void setRequestDate(String requestDate) {
        this.requestDate = requestDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    // ✅ Useful for logging
    @Override
    public String toString() {
        return "Maintenance{" +
                "maintenanceId='" + maintenanceId + '\'' +
                ", equipmentName='" + equipmentName + '\'' +
                ", issue='" + issue + '\'' +
                ", requestDate=" + requestDate +
                ", status='" + status + '\'' +
                '}';
    }
}
