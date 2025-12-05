package com.example.CircuitHub;

import com.example.CircuitHub.security.FirebaseAuthenticationFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true) // Enable @PreAuthorize annotations
public class SecurityConfig {

    @Autowired
    private FirebaseAuthenticationFilter firebaseAuthenticationFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .authorizeHttpRequests(auth -> auth
                // Public endpoints
                .requestMatchers("/api/sync/user").permitAll()
                .requestMatchers("/api/sync/get-by-uid").permitAll()
                .requestMatchers("/api/sync/test-firestore").permitAll()
                .requestMatchers("/uploads/**").permitAll()

                // Admin only endpoints
                .requestMatchers("/api/sync/set-admin").hasRole("ADMIN")
                .requestMatchers("/api/items/**").hasAnyRole("ADMIN", "LAB_ASSISTANT")

                // Teacher approval endpoints
                .requestMatchers("/api/requests/*/teacher-approve").hasAnyRole("ADMIN", "TEACHER")
                .requestMatchers("/api/requests/pending-teacher").hasAnyRole("ADMIN", "TEACHER")

                // Lab assistant approval endpoints
                .requestMatchers("/api/requests/*/lab-approve").hasAnyRole("ADMIN", "LAB_ASSISTANT")
                .requestMatchers("/api/requests/pending-lab").hasAnyRole("ADMIN", "LAB_ASSISTANT")

                // Authenticated users
                .requestMatchers("/api/requests/**").authenticated()
                .requestMatchers("/api/users/**").authenticated()
                // Let @PreAuthorize handle maintenance authorization
                .requestMatchers("/api/maintenance/**").authenticated()

                // All other requests require authentication
                .anyRequest().authenticated()
            )
            .addFilterBefore(firebaseAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        configuration.setAllowedOrigins(Arrays.asList(
            "http://localhost:3000",
            "http://localhost:5173",
            "http://localhost:5174",
            "https://ccs-gadgethubb-frontend.onrender.com",
            "https://ccs-gadgethubb.onrender.com"
        ));

        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
