package se.rateflix.controller

import groovy.transform.CompileStatic
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import se.rateflix.dto.UserResponse
import se.rateflix.service.UserService

@CompileStatic
@RestController
@RequestMapping('/api/users')
class UserController {

	private final UserService userService

	UserController(UserService userService) {
		this.userService = userService
	}

	@GetMapping('/me')
	UserResponse me(@AuthenticationPrincipal Jwt jwt) {
		userService.getUser(Long.valueOf(jwt.subject))
	}
}
