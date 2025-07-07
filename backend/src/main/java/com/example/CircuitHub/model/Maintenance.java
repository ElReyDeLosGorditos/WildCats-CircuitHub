package com.example.CircuitHub.model;

import com.example.CircuitHub.serializer.LocalDateSerializer;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;

import java.time.LocalDate;


public class Maintenance {

    private String maintenanceId;  // Firestore auto-generated ID
    private String equipmentName;
    private String issue;
    @JsonSerialize(using = LocalDateSerializer.class)
    private LocalDate requestDate;
//    @JsonFormat(pattern = "yyyy-MM-dd")
//    private LocalDate scheduleDate;
//    private LocalDate completionDate;
//    private int technicianId;
    private String status;

    // Constructors
    public Maintenance() {}

    public Maintenance(String equipmentName, String issue, LocalDate requestDate,
                       String status) {
        this.equipmentName = equipmentName;
        this.issue = issue;
        this.requestDate = requestDate;
//        this.scheduleDate = scheduleDate;
//        this.completionDate = completionDate;
//        this.technicianId = technicianId;
        this.status = status;
    }

    // Getters and Setters

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

    public LocalDate getRequestDate() {
        return requestDate;
    }

    public void setRequestDate(LocalDate requestDate) {
        this.requestDate = requestDate;
    }

//    public LocalDate getScheduleDate() {
//        return scheduleDate;
//    }
//
//    public void setScheduleDate(LocalDate scheduleDate) {
//        this.scheduleDate = scheduleDate;
//    }

//    public LocalDate getCompletionDate() {
//        return completionDate;
//    }
//
//    public void setCompletionDate(LocalDate completionDate) {
//        this.completionDate = completionDate;
//    }
//
//    public int getTechnicianId() {
//        return technicianId;
//    }
//
//    public void setTechnicianId(int technicianId) {
//        this.technicianId = technicianId;
//    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    @Override
    public String toString() {
        return "Maintenance{" +
                "maintenanceId='" + maintenanceId + '\'' +
                ", equipmentName='" + equipmentName + '\'' +
                ", issue='" + issue + '\'' +
                ", requestDate=" + requestDate +
                // ", scheduleDate=" + scheduleDate +
//                ", completionDate=" + completionDate +
//                ", technicianId=" + technicianId +
                ", status='" + status + '\'' +
                '}';
    }
}