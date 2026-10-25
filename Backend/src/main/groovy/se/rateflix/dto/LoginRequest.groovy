package se.rateflix.dto

import jakarta.validation.constraints.Email
import jakarta.validation.constraints.NotBlank

class LoginRequest {

	@NotBlank @Email
	String email

	@NotBlank
	String password
}
