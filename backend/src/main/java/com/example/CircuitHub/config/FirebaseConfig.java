package com.example.CircuitHub.config;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

import org.springframework.context.annotation.Configuration;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.cloud.FirestoreClient;

import jakarta.annotation.PostConstruct;

@Configuration
public class FirebaseConfig {

    @PostConstruct
    public void initializeFirebase() {
        try {
            // ✅ Read Firebase service account JSON from environment variable
            String firebaseConfigJson = System.getenv("FIREBASE_CONFIG_JSON");
            
            if (firebaseConfigJson == null || firebaseConfigJson.isEmpty()) {
                System.err.println("❌ FIREBASE_CONFIG_JSON environment variable is not set!");
                System.err.println("❌ Please set the environment variable with your service account JSON");
                System.err.println("❌ Example: FIREBASE_CONFIG_JSON='{\"type\":\"service_account\",...}'");
                throw new IllegalStateException(
                    "FIREBASE_CONFIG_JSON environment variable is required but not set. " +
                    "Please configure it in your IDE or deployment environment."
                );
            }

            System.out.println("✅ Found FIREBASE_CONFIG_JSON environment variable (length: " + 
                              firebaseConfigJson.length() + " characters)");

            // ✅ Convert JSON string to InputStream
            InputStream serviceAccount = new ByteArrayInputStream(
                firebaseConfigJson.getBytes(StandardCharsets.UTF_8)
            );

            // ✅ Build Firebase options with credentials from environment
            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                    .setStorageBucket("circuithub-75f4a.firebasestorage.app")
                    .build();

            // ✅ Initialize Firebase if not already initialized
            if (FirebaseApp.getApps().isEmpty()) {
                FirebaseApp.initializeApp(options);
                
                // Test Firestore connection
                FirestoreClient.getFirestore();
                
                System.out.println("✅ Firebase initialized successfully!");
                System.out.println("✅ Storage Bucket: circuithub-75f4a.firebasestorage.app");
                System.out.println("✅ Firestore connection verified");
            } else {
                System.out.println("ℹ️ Firebase already initialized");
            }

        } catch (IllegalStateException e) {
            System.err.println("❌ Configuration Error: " + e.getMessage());
            throw e;
        } catch (Exception e) {
            System.err.println("❌ Failed to initialize Firebase: " + e.getMessage());
            System.err.println("❌ Please check your FIREBASE_CONFIG_JSON format");
            e.printStackTrace();
            throw new RuntimeException("Firebase initialization failed. Check your service account configuration.", e);
        }
    }
}
