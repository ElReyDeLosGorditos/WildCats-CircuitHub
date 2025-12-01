package com.example.CircuitHub.controller;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ExecutionException;

import com.example.CircuitHub.security.RoleAuthorization;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.CircuitHub.model.Item;
import com.example.CircuitHub.service.ItemService;
import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.DocumentReference;
import com.google.cloud.firestore.DocumentSnapshot;
import com.google.firebase.cloud.FirestoreClient;

@RestController
@RequestMapping("/api/items")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"}, allowCredentials = "true")
public class ItemController {

    private final ItemService itemService;

    public ItemController(ItemService itemService) {
        this.itemService = itemService;
    }

    // Admin and Lab Assistant can add items
    @RoleAuthorization.AdminOrLabAssistant
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> addItemWithImage(
            @RequestParam("name") String name,
            @RequestParam("description") String description,
            @RequestParam("condition") String condition,
            @RequestParam(value = "image", required = false) MultipartFile image,
            @RequestParam("quantity") int quantity
    ) {
        try {
            System.out.println("Received multipart request: " + name);
            Item newItem = itemService.saveItem(name, description, condition, image, quantity);
            return ResponseEntity.ok(newItem);
        } catch (Exception e) {
            System.out.println("Error adding item with image: " + e.getMessage());
            e.printStackTrace();
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @RoleAuthorization.AdminOrLabAssistant
    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> addSimpleItem(@RequestBody Map<String, String> itemData) {
        try {
            System.out.println("Received JSON request: " + itemData);

            String name = itemData.get("name");
            String description = itemData.get("description");
            String condition = itemData.get("condition");
            int quantity = Integer.parseInt(itemData.getOrDefault("quantity", "0"));

            String itemId = UUID.randomUUID().toString();
            Map<String, Object> dbItemData = new HashMap<>();
            dbItemData.put("id", itemId);
            dbItemData.put("name", name);
            dbItemData.put("description", description);
            dbItemData.put("condition", condition);
            dbItemData.put("status", "Available");
            dbItemData.put("createdAt", LocalDateTime.now().toString());
            dbItemData.put("imagePath", "https://placehold.co/150");
            dbItemData.put("quantity", quantity);

            FirestoreClient.getFirestore().collection("items").document(itemId).set(dbItemData).get();

            Map<String, Object> response = new HashMap<>(dbItemData);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.out.println("Error adding simple item: " + e.getMessage());
            e.printStackTrace();
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    // Everyone can view items (authenticated users)
    @RoleAuthorization.AuthenticatedOnly
    @GetMapping
    public ResponseEntity<List<Item>> getAllItems() {
        try {
            List<Item> items = itemService.getAllItems();
            return ResponseEntity.ok(items);
        } catch (ExecutionException | InterruptedException e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    @RoleAuthorization.AuthenticatedOnly
    @GetMapping("/{id}")
    public ResponseEntity<?> getItemById(@PathVariable String id) {
        try {
            System.out.println("Fetching item with ID: " + id);

            DocumentReference docRef = FirestoreClient.getFirestore().collection("items").document(id);
            ApiFuture<DocumentSnapshot> future = docRef.get();
            DocumentSnapshot document = future.get();

            if (!document.exists()) {
                return ResponseEntity.notFound().build();
            }

            Map<String, Object> itemData = document.getData();
            if (itemData != null) {
                itemData.put("id", document.getId());
                return ResponseEntity.ok(itemData);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    // Only admin and lab assistant can update items
    @RoleAuthorization.AdminOrLabAssistant
    @PutMapping("/{id}")
    public ResponseEntity<?> updateItem(@PathVariable String id, @RequestBody Map<String, String> itemData) {
        try {
            System.out.println("Updating item: " + id);

            DocumentReference docRef = FirestoreClient.getFirestore().collection("items").document(id);
            ApiFuture<DocumentSnapshot> future = docRef.get();
            DocumentSnapshot document = future.get();

            if (!document.exists()) {
                return ResponseEntity.notFound().build();
            }

            Map<String, Object> updates = new HashMap<>();
            String prevStatus = document.getString("status");
            if (itemData.containsKey("name")) updates.put("name", itemData.get("name"));
            if (itemData.containsKey("description")) updates.put("description", itemData.get("description"));
            if (itemData.containsKey("condition")) updates.put("condition", itemData.get("condition"));
            if (itemData.containsKey("status")) {
                String newStatus = itemData.get("status");
                updates.put("status", newStatus);

                Long currentQuantity = document.getLong("quantity");
                if (currentQuantity != null) {
                    if ((newStatus.equalsIgnoreCase("Borrowed") || newStatus.equalsIgnoreCase("Maintenance"))
                            && currentQuantity > 0) {
                        updates.put("quantity", currentQuantity - 1);
                    }

                    if (newStatus.equalsIgnoreCase("Available") &&
                            (prevStatus.equalsIgnoreCase("Borrowed") || prevStatus.equalsIgnoreCase("Maintenance"))) {
                        updates.put("quantity", currentQuantity + 1);
                    }
                }
            }
            if (itemData.containsKey("quantity")) updates.put("quantity", Integer.parseInt(itemData.get("quantity")));

            docRef.update(updates).get();

            ApiFuture<DocumentSnapshot> updatedFuture = docRef.get();
            DocumentSnapshot updatedDoc = updatedFuture.get();
            Map<String, Object> updatedData = updatedDoc.getData();
            updatedData.put("id", updatedDoc.getId());

            return ResponseEntity.ok(updatedData);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @RoleAuthorization.AdminOrLabAssistant
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteItem(@PathVariable String id) {
        try {
            System.out.println("Deleting item: " + id);
            FirestoreClient.getFirestore().collection("items").document(id).delete().get();
            return ResponseEntity.ok(Map.of("success", true, "message", "Item deleted successfully"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
}
