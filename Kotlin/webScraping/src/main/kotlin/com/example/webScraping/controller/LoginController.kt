package com.example.webScraping.controller

import com.example.webScraping.form.LoginForm
import com.example.webScraping.repository.UserRepository
import jakarta.servlet.http.Cookie
import jakarta.servlet.http.HttpServletResponse
import org.springframework.stereotype.Controller
import org.springframework.ui.Model
import org.springframework.web.bind.annotation.ModelAttribute
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestMethod


@Controller
class LoginController(
    val userRepository: UserRepository
) {

    /**
     * The User repository.
     */


    /**
     * Gets login form.
     *
     * @return the login form
     */
    @RequestMapping(value = ["/login"], method = [RequestMethod.GET])
    fun getLoginForm(): String {
        return "login"
    }

    /**
     * Login.
     *
     * @param loginForm the login form
     * @param model     the model
     * @param response  the response
     * @return the String
     */
    @RequestMapping(value = ["/login"], method = [RequestMethod.POST])
    fun login(
        @ModelAttribute(name = "loginForm") loginForm: LoginForm,
        model: Model, response: HttpServletResponse
    ): String {
        val cookie: Cookie
        if (null != userRepository.findByUsernameAndPassword(
                loginForm.userName, loginForm.password
            )
        ) {
            cookie = Cookie("login", "true")
            cookie.setMaxAge(7 * 24 * 60 * 60)
            response.addCookie(cookie)
            return "home"
        }
        cookie = Cookie("login", "false")
        cookie.setMaxAge(7 * 24 * 60 * 60)
        response.addCookie(cookie)
        model.addAttribute("invalidCredentials", true)
        return "login"
    }

}