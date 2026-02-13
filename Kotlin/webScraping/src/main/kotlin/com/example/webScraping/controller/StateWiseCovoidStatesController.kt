package com.example.webScraping.controller

import com.example.webScraping.services.EntityService
import jakarta.servlet.http.HttpServletRequest
import org.springframework.stereotype.Controller
import org.springframework.ui.Model
import org.springframework.web.bind.annotation.GetMapping

@Controller
class StateWiseCovoidStatsController(
    private val entityService: EntityService
) {

    @GetMapping("/stateWiseData")
    fun messages(
        model: Model,
        request: HttpServletRequest
    ): String {

        val cookies = request.cookies ?: return "login"

        for (cookie in cookies) {
            if (cookie.name == "login" && cookie.value == "true") {
                model.addAttribute(
                    "stateWiseData",
                    entityService.getStateWiseCoronaData()
                )
                return "home"
            }
        }

        return "login"
    }
}
