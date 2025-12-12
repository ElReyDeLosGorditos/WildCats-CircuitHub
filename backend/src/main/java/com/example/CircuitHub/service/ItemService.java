package com.example.CircuitHub.service;

import com.example.CircuitHub.model.Item;
import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import com.google.cloud.storage.BlobInfo;
import com.google.firebase.cloud.FirestoreClient;
import com.google.firebase.cloud.StorageClient;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ExecutionException;

@Service
public class ItemService {

    private final Firestore firestore;

    public ItemService() {
        this.firestore = FirestoreClient.getFirestore();
    }

    public Item saveItem(String name, String description, String condition, MultipartFile image, int quantity)
            throws IOException, ExecutionException, InterruptedException {

        String itemId = UUID.randomUUID().toString();
        String imageUrl = "https://placehold.co/150x150?text=No+Image";

        if (image != null && !image.isEmpty()) {
            String originalFilename = Objects.requireNonNull(image.getOriginalFilename()).replace(" ", "_");
            String filename = UUID.randomUUID() + "_" + originalFilename;

            BlobInfo blob = StorageClient.getInstance().bucket().create(
                    filename,
                    image.getBytes(),
                    image.getContentType()
            );

            String bucket = blob.getBucket();
            imageUrl = String.format(
                    "https://firebasestorage.googleapis.com/v0/b/%s/o/%s?alt=media",
                    bucket,
                    URLEncoder.encode(filename, StandardCharsets.UTF_8)
            );
        }

        Date now = new Date();

        Map<String, Object> data = new HashMap<>();
        data.put("id", itemId);
        data.put("name", name);
        data.put("description", description);
        data.put("condition", condition);
        data.put("status", "Available");
        data.put("imagePath", imageUrl);
        data.put("createdAt", now);  // Store as Timestamp in Firestore
        data.put("updatedAt", now);  // Store as Timestamp in Firestore
        data.put("quantity", quantity);

        firestore.collection("items").document(itemId).set(data).get();

        // Return Item with proper Date objects
        return new Item(itemId, name, description, condition, "Available", imageUrl, now, now, quantity);
    }

    public List<Item> getAllItems() throws ExecutionException, InterruptedException {
        List<Item> items = new ArrayList<>();
        ApiFuture<QuerySnapshot> future = firestore.collection("items").get();
        for (QueryDocumentSnapshot doc : future.get().getDocuments()) {
            Item item = doc.toObject(Item.class);
            // ✅ FIX: Ensure the ID is always set from the document ID
            if (item.getId() == null || item.getId().isEmpty()) {
                item.setId(doc.getId());
            }
            items.add(item);
        }
        return items;
    }

    public Item getItemById(String id) throws ExecutionException, InterruptedException {
        DocumentSnapshot doc = firestore.collection("items").document(id).get().get();
        if (!doc.exists()) {
            return null;
        }
        Item item = doc.toObject(Item.class);
        // ✅ FIX: Ensure the ID is always set from the document ID
        if (item != null && (item.getId() == null || item.getId().isEmpty())) {
            item.setId(doc.getId());
        }
        return item;
    }
}