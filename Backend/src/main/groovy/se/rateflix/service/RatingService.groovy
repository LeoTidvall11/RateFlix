package se.rateflix.service

import groovy.transform.CompileStatic
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import se.rateflix.dto.RatingRequest
import se.rateflix.dto.RatingResponse
import se.rateflix.exception.NotFoundException
import se.rateflix.model.Movie
import se.rateflix.model.Rating
import se.rateflix.repository.RatingRepository
import se.rateflix.repository.UserRepository

import java.time.Instant

@CompileStatic
@Service
class RatingService {

	private final RatingRepository ratingRepository
	private final UserRepository userRepository
	private final MovieService movieService

	RatingService(RatingRepository ratingRepository, UserRepository userRepository, MovieService movieService) {
		this.ratingRepository = ratingRepository
		this.userRepository = userRepository
		this.movieService = movieService
	}

	@Transactional(readOnly = true)
	List<RatingResponse> getRatings(Long userId) {
		ratingRepository.findByUserIdOrderByUpdatedAtDesc(userId).collect { toResponse(it) }
	}

	@Transactional(readOnly = true)
	RatingResponse getRating(Long userId, Long tmdbId) {
		ratingRepository.findByUserIdAndMovieTmdbId(userId, tmdbId)
			.map(RatingService::toResponse)
			.orElseThrow(() -> new NotFoundException('No rating for this movie'))
	}

	@Transactional
	RatingResponse setRating(Long userId, Long tmdbId, RatingRequest request) {
		Movie movie = movieService.upsert(tmdbId, request.movie)
		Rating rating = ratingRepository.findByUserIdAndMovieTmdbId(userId, tmdbId)
			.orElseGet(() -> new Rating(user: userRepository.getReferenceById(userId), movie: movie))

		rating.score = request.score
		rating.updatedAt = Instant.now()

		toResponse(ratingRepository.save(rating))
	}

	@Transactional
	void deleteRating(Long userId, Long tmdbId) {
		ratingRepository.findByUserIdAndMovieTmdbId(userId, tmdbId).ifPresent(ratingRepository::delete)
	}

	private static RatingResponse toResponse(Rating rating) {
		new RatingResponse(MovieService.toDto(rating.movie), rating.score, rating.updatedAt)
	}
}
