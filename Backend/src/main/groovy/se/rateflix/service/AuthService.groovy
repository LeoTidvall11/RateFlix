package se.rateflix.service

import groovy.transform.CompileStatic
import org.springframework.security.authentication.BadCredentialsException
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import se.rateflix.dto.AuthResponse
import se.rateflix.dto.LoginRequest
import se.rateflix.dto.RegisterRequest
import se.rateflix.dto.UserResponse
import se.rateflix.exception.ConflictException
import se.rateflix.model.User
import se.rateflix.repository.UserRepository

@CompileStatic
@Service
class AuthService {

	private final UserRepository userRepository
	private final PasswordEncoder passwordEncoder
	private final TokenService tokenService

	AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, TokenService tokenService) {
		this.userRepository = userRepository
		this.passwordEncoder = passwordEncoder
		this.tokenService = tokenService
	}

	@Transactional
	AuthResponse register(RegisterRequest request) {
		String email = normalizeEmail(request.email)
		if (userRepository.existsByEmail(email)) {
			throw new ConflictException('Email is already registered')
		}

		User user = userRepository.save(new User(
			name: request.name.trim(),
			email: email,
			passwordHash: passwordEncoder.encode(request.password)
		))
		authResponse(user)
	}

	@Transactional(readOnly = true)
	AuthResponse login(LoginRequest request) {
		User user = userRepository.findByEmail(normalizeEmail(request.email))
			.filter(u -> passwordEncoder.matches(request.password, u.passwordHash))
			.orElseThrow(() -> new BadCredentialsException('Invalid email or password'))
		authResponse(user)
	}

	private AuthResponse authResponse(User user) {
		new AuthResponse(tokenService.createToken(user), UserResponse.from(user))
	}

	private static String normalizeEmail(String email) {
		email.trim().toLowerCase()
	}
}
