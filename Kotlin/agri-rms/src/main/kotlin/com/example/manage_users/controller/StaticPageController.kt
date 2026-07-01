package com.example.manage_users.controller

import org.springframework.core.io.ClassPathResource
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RestController

/*
─────────────────────────────────────────────────────────────────────────────
StaticPageController

Sert les pages HTML statiques (setup-password.html, reset-password.html)
en lisant directement le fichier depuis classpath:/static/ et en retournant
le contenu brut comme ResponseEntity<ByteArray>.

POURQUOI ce controller plutôt que ResourceHandler ou WebMvcConfigurer ?

Thymeleaf est activé dans ce projet (pour les emails).
Avec Thymeleaf actif, tout GET sur une URL *.html est intercepté par le
ThymeleafViewResolver qui cherche un template dans /templates/ → 500 si absent.
Les ResourceHandlers normaux ne prennent pas la priorité sur Thymeleaf.

Ce controller retourne le HTML comme ResponseEntity<ByteArray> avec
ContentType text/html — Spring n'invoque pas de ViewResolver → aucune
interférence Thymeleaf.

IMPORTANT : ces routes sont dans SecurityConfig.permitAll() :
"/setup-password.html", "/reset-password.html"
─────────────────────────────────────────────────────────────────────────────
*/

@RestController
class StaticPageController {

    @GetMapping("/setup-password.html", produces = [MediaType.TEXT_HTML_VALUE])
    fun setupPasswordPage(): ResponseEntity<ByteArray> =
        serveStaticHtml("static/setup-password.html")

    @GetMapping("/reset-password.html", produces = [MediaType.TEXT_HTML_VALUE])
    fun resetPasswordPage(): ResponseEntity<ByteArray> =
        serveStaticHtml("static/reset-password.html")

    private fun serveStaticHtml(classpath: String): ResponseEntity<ByteArray> {
        val resource = ClassPathResource(classpath)
        if (!resource.exists()) {
            return ResponseEntity.notFound().build()
        }
        val bytes = resource.inputStream.readBytes()
        return ResponseEntity.ok()
            .contentType(MediaType.TEXT_HTML)
            .contentLength(bytes.size.toLong())
            .body(bytes)
    }
}