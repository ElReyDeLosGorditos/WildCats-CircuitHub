package com.example.CircuitHub.config;

import java.io.ByteArrayInputStream;
import java.io.FileInputStream;
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
            String firebaseConfigJson = System.getenv("FIREBASE_CONFIG_JSON");
        if (firebaseConfigJson == null) {
            System.err.println("❌ Environment variable FIREBASE_CONFIG_JSON is not set");
        } else {
            System.out.println("✅ Environment variable length: " + firebaseConfigJson.length());
        }

        //InputStream serviceAccount = new ByteArrayInputStream(firebaseConfigJson.getBytes(StandardCharsets.UTF_8));

            // Deprecated method (commented out)
            /*
            FirebaseOptions options = new FirebaseOptions.Builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                    .setStorageBucket("ccs-gadgethub.appspot.com")
                    .build();
            */

            // ✅ Updated recommended builder usage
            FileInputStream serviceAccount = new FileInputStream("backend/src/main/resources/firebase-service-account.json");
            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                    .build();

            if (FirebaseApp.getApps().isEmpty()) {
                FirebaseApp.initializeApp(options);
                FirestoreClient.getFirestore(); // test connection
                System.out.println("✅ Firebase initialized via environment variable");
            }

        } catch (Exception e) {
            System.err.println("❌ Failed to initialize Firebase from env variable: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
