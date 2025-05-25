package com.example.GadgetHub.model;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Getter
@Setter
@NoArgsConstructor // Required for Firestore deserialization
@AllArgsConstructor
public class Item {
    private String id;
    private String name;
    private String description;
    private String condition;
    private String status;
    private String imagePath;
    private String createdAt;
}