package com.example.JunitDemo

import org.junit.jupiter.api.Test
import org.springframework.boot.test.context.SpringBootTest
import kotlin.test.assertTrue

@SpringBootTest
class JunitDemoApplicationTests {

	@Test
	fun contextLoads() {
		assertTrue { true }
	}

}
