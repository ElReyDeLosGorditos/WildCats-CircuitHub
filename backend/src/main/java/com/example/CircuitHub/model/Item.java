package com.example.CircuitHub.model;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Getter
@Setter
@NoArgsConstructor // Required for Firestore deserialization
public class Item {
    private String id;
    private String name;
    private String description;
    private String condition;
    private String status;
    private String imagePath;
    private String createdAt;

    public Item(String id, String name, String description, String condition, String status, String imagePath, String createdAt) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.condition = condition;
        this.status = status;
        this.imagePath = imagePath;
        this.createdAt = createdAt;
    }

    // Generate getters and setters for all fields (or at least getters)
    public String getId() { return id; }
    public String getName() { return name; }
    public String getDescription() { return description; }
    public String getCondition() { return condition; }
    public String getStatus() { return status; }
    public String getImagePath() { return imagePath; }
    public String getCreatedAt() { return createdAt; }

    public void setId(String id) { this.id = id; }
    public void setName(String name) { this.name = name; }
    public void setDescription(String description) { this.description = description; }
    public void setCondition(String condition) { this.condition = condition; }
    public void setStatus(String status) { this.status = status; }
    public void setImagePath(String imagePath) { this.imagePath = imagePath; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
}
