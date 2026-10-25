package se.rateflix.service

import groovy.transform.CompileStatic
import org.springframework.beans.factory.annotation.Value
import org.springframework.security.oauth2.jose.jws.MacAlgorithm
import org.springframework.security.oauth2.jwt.JwsHeader
import org.springframework.security.oauth2.jwt.JwtClaimsSet
import org.springframework.security.oauth2.jwt.JwtEncoder
import org.springframework.security.oauth2.jwt.JwtEncoderParameters
import org.springframework.stereotype.Service
import se.rateflix.model.User

import java.time.Duration
import java.time.Instant

@CompileStatic
@Service
class TokenService {

	private final JwtEncoder jwtEncoder
	private final Duration expiration

	TokenService(JwtEncoder jwtEncoder, @Value('${rateflix.jwt.expiration}') Duration expiration) {
		this.jwtEncoder = jwtEncoder
		this.expiration = expiration
	}

	String createToken(User user) {
		Instant now = Instant.now()
		JwtClaimsSet claims = JwtClaimsSet.builder()
			.issuer('rateflix')
			.subject(user.id.toString())
			.issuedAt(now)
			.expiresAt(now.plus(expiration))
			.build()
		JwsHeader header = JwsHeader.with(MacAlgorithm.HS256).build()

		jwtEncoder.encode(JwtEncoderParameters.from(header, claims)).tokenValue
	}
}
