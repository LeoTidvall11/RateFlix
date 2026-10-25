package se.rateflix.controller

import groovy.transform.CompileStatic
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestController
import se.rateflix.dto.RatingRequest
import se.rateflix.dto.RatingResponse
import se.rateflix.service.RatingService

@CompileStatic
@RestController
@RequestMapping('/api/ratings')
class RatingController {

	private final RatingService ratingService

	RatingController(RatingService ratingService) {
		this.ratingService = ratingService
	}

	@GetMapping
	List<RatingResponse> getRatings(@AuthenticationPrincipal Jwt jwt) {
		ratingService.getRatings(Long.valueOf(jwt.subject))
	}

	@GetMapping('/{tmdbId}')
	RatingResponse getRating(@AuthenticationPrincipal Jwt jwt, @PathVariable Long tmdbId) {
		ratingService.getRating(Long.valueOf(jwt.subject), tmdbId)
	}

	@PutMapping('/{tmdbId}')
	RatingResponse setRating(@AuthenticationPrincipal Jwt jwt, @PathVariable Long tmdbId, @Valid @RequestBody RatingRequest request) {
		ratingService.setRating(Long.valueOf(jwt.subject), tmdbId, request)
	}

	@DeleteMapping('/{tmdbId}')
	@ResponseStatus(HttpStatus.NO_CONTENT)
	void deleteRating(@AuthenticationPrincipal Jwt jwt, @PathVariable Long tmdbId) {
		ratingService.deleteRating(Long.valueOf(jwt.subject), tmdbId)
	}
}
