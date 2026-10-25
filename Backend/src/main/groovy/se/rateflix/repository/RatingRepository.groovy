package se.rateflix.repository

import org.springframework.data.jpa.repository.EntityGraph
import org.springframework.data.jpa.repository.JpaRepository
import se.rateflix.model.Rating

interface RatingRepository extends JpaRepository<Rating, Long> {

	@EntityGraph(attributePaths = ['movie'])
	List<Rating> findByUserIdOrderByUpdatedAtDesc(Long userId)

	@EntityGraph(attributePaths = ['movie'])
	Optional<Rating> findByUserIdAndMovieTmdbId(Long userId, Long tmdbId)
}
