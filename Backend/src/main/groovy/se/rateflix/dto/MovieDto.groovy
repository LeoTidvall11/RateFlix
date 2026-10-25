package se.rateflix.dto

import com.fasterxml.jackson.annotation.JsonProperty
import jakarta.validation.constraints.NotBlank

// Samma fältnamn som TMDB använder, så frontend kan skicka filmobjektet direkt
class MovieDto {

	Long id

	@NotBlank
	String title

	@JsonProperty('poster_path')
	String posterPath

	@JsonProperty('backdrop_path')
	String backdropPath

	@JsonProperty('release_date')
	String releaseDate

	@JsonProperty('vote_average')
	Double voteAverage

	Integer runtime

	List<Map<String, Object>> genres
}
