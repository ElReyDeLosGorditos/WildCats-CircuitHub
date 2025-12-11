package com.example.CircuitHub.model;

import java.util.Date;

public class Item {
    private String id;
    private String name;
    private String description;
    private String condition;
    private String status;
    private String imagePath;
    private Date createdAt;      // Changed from String to Date for Firestore Timestamp
    private Date updatedAt;      // Added updatedAt field for Firestore Timestamp
    private Integer quantity;    // Changed from int to Integer to handle nulls

    // REQUIRED: Public no-argument constructor for Firestore deserialization
    public Item() {
        // Firestore SDK requires this to create instances during deserialization
    }

    // Full-arguments constructor for convenience
    public Item(String id, String name, String description, String condition, String status, 
                String imagePath, Date createdAt, Date updatedAt, Integer quantity) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.condition = condition;
        this.status = status;
        this.imagePath = imagePath;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.quantity = quantity;
    }

    // Getters and Setters
    public String getId() { 
        return id; 
    }
    
    public void setId(String id) { 
        this.id = id; 
    }

    public String getName() { 
        return name; 
    }
    
    public void setName(String name) { 
        this.name = name; 
    }

    public String getDescription() { 
        return description; 
    }
    
    public void setDescription(String description) { 
        this.description = description; 
    }

    public String getCondition() { 
        return condition; 
    }
    
    public void setCondition(String condition) { 
        this.condition = condition; 
    }

    public String getStatus() { 
        return status; 
    }
    
    public void setStatus(String status) { 
        this.status = status; 
    }

    public String getImagePath() { 
        return imagePath; 
    }
    
    public void setImagePath(String imagePath) { 
        this.imagePath = imagePath; 
    }

    public Date getCreatedAt() { 
        return createdAt; 
    }
    
    public void setCreatedAt(Date createdAt) { 
        this.createdAt = createdAt; 
    }

    public Date getUpdatedAt() { 
        return updatedAt; 
    }
    
    public void setUpdatedAt(Date updatedAt) { 
        this.updatedAt = updatedAt; 
    }

    public Integer getQuantity() { 
        return quantity; 
    }
    
    public void setQuantity(Integer quantity) { 
        this.quantity = quantity; 
    }
}
