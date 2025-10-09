package com.example.CircuitHub;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration; // 👈 Add this import

@SpringBootApplication(exclude = { DataSourceAutoConfiguration.class }) // 👈 Exclude DataSource auto config
public class CircuitHubApplication {

	public static void main(String[] args) {
		SpringApplication.run(CircuitHubApplication.class, args);
	}
}

