package com.example.webScraping.controller

import com.example.webScraping.form.RegisterForm
import com.example.webScraping.model.Users
import com.example.webScraping.repository.UserRepository
import org.springframework.stereotype.Controller
import org.springframework.ui.Model
import org.springframework.web.bind.annotation.ModelAttribute
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestMethod

@Controller
class RegisterController(
    val userRepository: UserRepository
) {

    /**
     * Register.
     *
     * @return the [String]
     */
    @RequestMapping(value = ["/register"], method = [RequestMethod.POST])
//    @PostMapping("/register")
    fun register(
        @ModelAttribute("registerForm") registerForm: RegisterForm,
        model: Model
    ): String {

        if (registerForm.password != registerForm.confirmPassword) {
            return "register"
        }

        userRepository.save(
            Users(
                id = 0,
                username = registerForm.userName,
                password = registerForm.password
            )
        )

        return "login"
    }



    @RequestMapping(value = ["/register"], method = [RequestMethod.GET])
    fun getLoginForm(): String {
        return "register"
    }

}