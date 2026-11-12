package com.verse.backend;

import com.verse.backend.config.DotenvEnvironmentPostProcessor;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.Map;

@SpringBootTest
class BackendApplicationTests {

	@BeforeAll
	static void setUpEnv() {
		Map<String, Object> props = DotenvEnvironmentPostProcessor.loadDotenvProperties();
		props.forEach((k, v) -> {
			if (System.getProperty(k) == null && System.getenv(k) == null) {
				System.setProperty(k, String.valueOf(v));
			}
		});
	}

	@Test
	void contextLoads() {
	}

}
