package se.rateflix.dto

import com.fasterxml.jackson.annotation.JsonProperty
import jakarta.validation.Valid
import jakarta.validation.constraints.NotNull

// Bara flaggorna som skickas med ändras, null betyder "rör inte"
class LibraryUpdateRequest {

	@NotNull @Valid
	MovieDto movie

	Boolean inWatchlist

	@JsonProperty('isFavorite')
	Boolean favorite

	Boolean watched
}
