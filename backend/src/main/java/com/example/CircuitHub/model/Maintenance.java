package com.example.CircuitHub.model;
import java.time.LocalDate;

public class Maintenance {

    private int maintenanceId;
    private String equipmentName;
    private String issue;
    private LocalDate requestDate;
    private LocalDate scheduleDate;
    private LocalDate completionDate;
    private int technicianId;
    private String status;
    private String progress;

    // Constructors
    public Maintenance() {}

    public Maintenance(int maintenanceId, String equipmentName, String issue,
                       LocalDate requestDate, LocalDate scheduleDate, LocalDate completionDate,
                       int technicianId, String status, String progress) {
        this.maintenanceId = maintenanceId;
        this.equipmentName = equipmentName;
        this.issue = issue;
        this.requestDate = requestDate;
        this.scheduleDate = scheduleDate;
        this.completionDate = completionDate;
        this.technicianId = technicianId;
        this.status = status;
        this.progress = progress;
    }

    // Getters and Setters

    public int getMaintenanceId() { return maintenanceId; }
    public void setMaintenanceId(int maintenanceId) { this.maintenanceId = maintenanceId; }

    public String getEquipmentName() { return equipmentName; }
    public void setEquipmentName(String equipmentName) { this.equipmentName = equipmentName; }

    public String getIssue() { return issue; }
    public void setIssue(String issue) { this.issue = issue; }

    public LocalDate getRequestDate() { return requestDate; }
    public void setRequestDate(LocalDate requestDate) { this.requestDate = requestDate; }

    public LocalDate getScheduleDate() { return scheduleDate; }
    public void setScheduleDate(LocalDate scheduleDate) { this.scheduleDate = scheduleDate; }

    public LocalDate getCompletionDate() { return completionDate; }
    public void setCompletionDate(LocalDate completionDate) { this.completionDate = completionDate; }

    public int getTechnicianId() { return technicianId; }
    public void setTechnicianId(int technicianId) { this.technicianId = technicianId; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getProgress() { return progress; }
    public void setProgress(String progress) { this.progress = progress; }

    @Override
    public String toString() {
        return "Maintenance{" +
                "maintenanceId=" + maintenanceId +
                ", equipmentName='" + equipmentName + '\'' +
                ", issue='" + issue + '\'' +
                ", requestDate=" + requestDate +
                ", scheduleDate=" + scheduleDate +
                ", completionDate=" + completionDate +
                ", technicianId=" + technicianId +
                ", status='" + status + '\'' +
                ", progress='" + progress + '\'' +
                '}';
    }
}