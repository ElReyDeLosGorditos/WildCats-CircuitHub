package com.example.CircuitHub.config;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

@Configuration
public class CorsConfig {

    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();

        config.setAllowCredentials(true);
        
        // Allow specific origins including Vercel domains
        config.setAllowedOriginPatterns(List.of(
                "https://ccs-gadgethubb.onrender.com",
                "https://ccs-gadgethubb-frontend.onrender.com",
                "https://wildcats-circuithub.onrender.com",
                "https://wildcats-circuit-hub.vercel.app",
                "https://*.vercel.app", // Allow all Vercel preview deployments
                "http://localhost:*" // Allow all localhost ports
        ));
        
        config.addAllowedHeader("*");
        config.addAllowedMethod("*");
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);

        return new CorsFilter(source);
    }
}
