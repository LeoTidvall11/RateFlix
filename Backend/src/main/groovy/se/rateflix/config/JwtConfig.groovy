package se.rateflix.config

import com.nimbusds.jose.jwk.source.ImmutableSecret
import com.nimbusds.jose.proc.SecurityContext
import groovy.transform.CompileStatic
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.oauth2.jose.jws.MacAlgorithm
import org.springframework.security.oauth2.jwt.JwtDecoder
import org.springframework.security.oauth2.jwt.JwtEncoder
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder

import javax.crypto.SecretKey
import javax.crypto.spec.SecretKeySpec
import java.nio.charset.StandardCharsets

@CompileStatic
@Configuration
class JwtConfig {

	private final SecretKey key

	JwtConfig(@Value('${rateflix.jwt.secret}') String secret) {
		key = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), 'HmacSHA256')
	}

	@Bean
	JwtEncoder jwtEncoder() {
		new NimbusJwtEncoder(new ImmutableSecret<SecurityContext>(key))
	}

	@Bean
	JwtDecoder jwtDecoder() {
		NimbusJwtDecoder.withSecretKey(key).macAlgorithm(MacAlgorithm.HS256).build()
	}
}
