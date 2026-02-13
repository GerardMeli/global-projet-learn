package com.example.recipeapi.configuration

import org.apache.catalina.Context
import org.apache.catalina.connector.Connector
import org.apache.tomcat.util.descriptor.web.SecurityCollection
import org.apache.tomcat.util.descriptor.web.SecurityConstraint
import org.springframework.boot.web.embedded.tomcat.TomcatServletWebServerFactory
import org.springframework.boot.web.servlet.server.ServletWebServerFactory
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration


@Configuration
class HttpToHttpsRedirectConfig {

    @Bean
    fun servletContainer(): ServletWebServerFactory {
        val tomcat: TomcatServletWebServerFactory? = object : TomcatServletWebServerFactory() {
            override fun postProcessContext(context: Context) {
                val constraint = SecurityConstraint()
                constraint.userConstraint = "CONFIDENTIAL"
                val collection = SecurityCollection()
                collection.addPattern("/*")
                constraint.addCollection(collection)
                context.addConstraint(constraint)
            }
        }
        tomcat!!.addAdditionalTomcatConnectors(httpConnector())

        return tomcat
    }

    private fun httpConnector(): Connector {
        val connector = Connector(TomcatServletWebServerFactory.DEFAULT_PROTOCOL)
        connector.scheme = "http"
        connector.port = 8080
        connector.secure = false
        connector.redirectPort = 8750
        return connector
    }
}