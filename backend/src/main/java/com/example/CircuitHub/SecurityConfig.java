package com.example.CircuitHub;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.Arrays;
import java.util.List;

@Configuration
public class SecurityConfig {

    /* @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // .cors().and() // ❌ Deprecated in Spring Security 6 — replaced below
                .cors(cors -> cors.configurationSource(corsConfigurationSource())) // ✅ Recommended way
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/uploads/**").permitAll()
                        .requestMatchers("/api/**").permitAll()
                        .anyRequest().permitAll()
                );
        return http.build();
    }
*/

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
    
        configuration.setAllowedOrigins(Arrays.asList(
            "http://localhost:3000",                      // for local dev
            "http://localhost:5173",                      // for Vite dev
            "https://ccs-gadgethubb-frontend.onrender.com", // your deployed frontend
            "https://ccs-gadgethubb.onrender.com"         // if needed (in case backend calls itself)
        ));
    
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
    
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(request -> {
                    CorsConfiguration config = new CorsConfiguration();
                    config.setAllowCredentials(true);
                    config.setAllowedOrigins(List.of(
                            "https://ccs-gadgethubb.onrender.com",
                            "https://ccs-gadgethubb-frontend.onrender.com",
                            "http://localhost:3000",
                            "http://localhost:5173",
                            "http://localhost:5174"
                    ));
                    config.addAllowedHeader("*");
                    config.addAllowedMethod("*");
                    return config;
                }))
                .authorizeHttpRequests(auth -> auth
                        .anyRequest().permitAll()
                );

        return http.build();
    }

}    