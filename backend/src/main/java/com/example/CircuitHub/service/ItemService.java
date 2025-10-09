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

        String createdAt = LocalDateTime.now().toString();

        Map<String, Object> data = new HashMap<>();
        data.put("id", itemId);
        data.put("name", name);
        data.put("description", description);
        data.put("condition", condition);
        data.put("status", "Available");
        data.put("imagePath", imageUrl);
        data.put("createdAt", createdAt);
        data.put("quantity", quantity);

        firestore.collection("items").document(itemId).set(data).get();

        // Fixed constructor call - removed the colon and added the comma properly
        return new Item(itemId, name, description, condition, "Available", imageUrl, createdAt, quantity);
    }

    public List<Item> getAllItems() throws ExecutionException, InterruptedException {
        List<Item> items = new ArrayList<>();
        ApiFuture<QuerySnapshot> future = firestore.collection("items").get();
        for (QueryDocumentSnapshot doc : future.get().getDocuments()) {
            Item item = doc.toObject(Item.class);
            items.add(item);
        }
        return items;
    }

    public Item getItemById(String id) throws ExecutionException, InterruptedException {
        DocumentSnapshot doc = firestore.collection("items").document(id).get().get();
        return doc.exists() ? doc.toObject(Item.class) : null;
    }
}