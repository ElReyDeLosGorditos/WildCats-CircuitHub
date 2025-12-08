package com.example.CircuitHub.security;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.List;

@Component
public class FirebaseAuthenticationFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);

            try {
                FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(token);
                String uid = decodedToken.getUid();
                String email = decodedToken.getEmail();

                // Get custom claims for role
                String role = (String) decodedToken.getClaims().get("role");
                
                // If role is null in token, try to get from Firestore
                if (role == null || role.trim().isEmpty()) {
                    System.out.println("[ROLE WARNING] No role in token, fetching from Firestore for user: " + uid);
                    try {
                        com.google.cloud.firestore.DocumentSnapshot userDoc = 
                            com.google.firebase.cloud.FirestoreClient.getFirestore()
                                .collection("users")
                                .document(uid)
                                .get()
                                .get();
                        
                        if (userDoc.exists()) {
                            role = userDoc.getString("role");
                            System.out.println("[ROLE FETCH] Got role from Firestore: " + role);
                        }
                    } catch (Exception fsError) {
                        System.err.println("[ROLE ERROR] Failed to fetch from Firestore: " + fsError.getMessage());
                    }
                }
                
                // Default to student if still null
                if (role == null || role.trim().isEmpty()) {
                    role = "student";
                    System.out.println("[ROLE DEFAULT] Using default role: student");
                }
//                if (role == null) {
//                    role = "student"; // default role
//                }

                System.out.println("[ROLE CHECK] Token role: " + role);
                System.out.println("[AUTH CHECK] Requesting: " + request.getRequestURI());

                // Create authority based on role
                List<SimpleGrantedAuthority> authorities = Collections.singletonList(
                        new SimpleGrantedAuthority("ROLE_" + role.toUpperCase().replace("-", "_"))
                );

                System.out.println("[AUTHORITY CREATED] " + authorities.get(0).getAuthority());

                // Create authentication object
                UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(uid, null, authorities);

                // Set additional details
                authentication.setDetails(new FirebaseUserDetails(uid, email, role));

                // Set authentication in security context
                SecurityContextHolder.getContext().setAuthentication(authentication);

                System.out.println("✅ Authenticated user: " + email + " with role: " + role);

            } catch (Exception e) {
                System.err.println("❌ Token verification failed: " + e.getMessage());
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.getWriter().write("{\"error\": \"Invalid or expired token\"}");
                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        // Don't filter public endpoints
        return path.startsWith("/api/sync/user") ||
               path.startsWith("/api/sync/test-firestore") ||
               path.startsWith("/api/sync/get-by-uid") ||
               path.startsWith("/uploads/");
    }
}
