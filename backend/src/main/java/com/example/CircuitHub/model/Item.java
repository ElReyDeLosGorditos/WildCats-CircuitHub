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
}
