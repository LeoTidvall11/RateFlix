package se.rateflix.config

import groovy.transform.CompileStatic
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.config.Customizer
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.http.SessionCreationPolicy
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.security.web.SecurityFilterChain
import org.springframework.web.cors.CorsConfiguration
import org.springframework.web.cors.CorsConfigurationSource
import org.springframework.web.cors.UrlBasedCorsConfigurationSource

@CompileStatic
@Configuration
class SecurityConfig {

	@Bean
	SecurityFilterChain securityFilterChain(HttpSecurity http) {
		http
			.csrf { it.disable() }
			.cors(Customizer.withDefaults())
			.sessionManagement { it.sessionCreationPolicy(SessionCreationPolicy.STATELESS) }
			.httpBasic { it.disable() }
			.formLogin { it.disable() }
			.authorizeHttpRequests {
				it.requestMatchers('/api/auth/**', '/error').permitAll()
				it.anyRequest().authenticated()
			}
			.oauth2ResourceServer { it.jwt(Customizer.withDefaults()) }
		http.build()
	}

	@Bean
	PasswordEncoder passwordEncoder() {
		new BCryptPasswordEncoder()
	}

	@Bean
	CorsConfigurationSource corsConfigurationSource(@Value('${rateflix.cors.allowed-origins}') List<String> allowedOrigins) {
		def config = new CorsConfiguration(
			allowedOrigins: allowedOrigins,
			allowedMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
			allowedHeaders: ['Authorization', 'Content-Type']
		)
		def source = new UrlBasedCorsConfigurationSource()
		source.registerCorsConfiguration('/api/**', config)
		source
	}
}
