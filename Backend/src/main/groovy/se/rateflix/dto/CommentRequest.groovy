package se.rateflix.dto

import jakarta.validation.Valid
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size

class CommentRequest {

	@NotBlank @Size(max = 1000)
	String text

	// Behövs bara när en ny kommentar skapas, så att filmen finns i databasen
	@Valid
	MovieDto movie
}
