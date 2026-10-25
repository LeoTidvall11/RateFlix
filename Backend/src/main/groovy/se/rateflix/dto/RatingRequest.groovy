package se.rateflix.dto

import jakarta.validation.Valid
import jakarta.validation.constraints.Max
import jakarta.validation.constraints.Min
import jakarta.validation.constraints.NotNull

class RatingRequest {

	@NotNull @Min(1L) @Max(5L)
	Integer score

	@NotNull @Valid
	MovieDto movie
}
