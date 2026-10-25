package se.rateflix.controller

import groovy.transform.CompileStatic
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestController
import se.rateflix.dto.AuthResponse
import se.rateflix.dto.LoginRequest
import se.rateflix.dto.RegisterRequest
import se.rateflix.service.AuthService

@CompileStatic
@RestController
@RequestMapping('/api/auth')
class AuthController {

	private final AuthService authService

	AuthController(AuthService authService) {
		this.authService = authService
	}

	@PostMapping('/register')
	@ResponseStatus(HttpStatus.CREATED)
	AuthResponse register(@Valid @RequestBody RegisterRequest request) {
		authService.register(request)
	}

	@PostMapping('/login')
	AuthResponse login(@Valid @RequestBody LoginRequest request) {
		authService.login(request)
	}
}
