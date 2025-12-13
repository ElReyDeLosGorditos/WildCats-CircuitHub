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
        config.setAllowedOrigins(List.of(
                "https://ccs-gadgethubb.onrender.com",
                "https://ccs-gadgethubb-frontend.onrender.com",
                "https://wildcats-circuithub.onrender.com",
                "https://wildcats-circuit-hub.vercel.app",
                "https://wildcats-circuit-f555ebwg5-elreys-projects-7a62edbb.vercel.app", // Preview deployment
                "http://localhost:3000",
                "http://localhost:5173",
                "http://localhost:5174"
        ));
        config.addAllowedHeader("*");
        config.addAllowedMethod("*");
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);

        return new CorsFilter(source);
    }
}
