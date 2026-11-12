package com.verse.backend;

import com.verse.backend.config.DotenvLoader;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class BackendApplication {

	public static void main(String[] args) {
		// Automatically load local .env before Spring context initializes
		DotenvLoader.load();
		SpringApplication.run(BackendApplication.class, args);
	}

}
