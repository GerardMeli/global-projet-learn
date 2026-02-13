package com.example.JunitDemo

import org.junit.jupiter.api.Test
import kotlin.test.assertEquals

class CalculatorTest {

    @Test
    fun testMultiplay() {
        val cal = Calculation()
        assertEquals(40, cal.multiply(5, 8))
        assertEquals(0, cal.multiply(0, 8))
        assertEquals(20, cal.multiply(5, 4))
    }

}