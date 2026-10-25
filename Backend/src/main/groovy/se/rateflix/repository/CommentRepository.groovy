package se.rateflix.repository

import org.springframework.data.jpa.repository.EntityGraph
import org.springframework.data.jpa.repository.JpaRepository
import se.rateflix.model.Comment

interface CommentRepository extends JpaRepository<Comment, Long> {

	List<Comment> findByUserIdAndMovieTmdbIdOrderByCreatedAtDesc(Long userId, Long tmdbId)

	@EntityGraph(attributePaths = ['movie'])
	List<Comment> findByUserIdOrderByCreatedAtDesc(Long userId)

	// Med userId i frågan hittas bara kommentarer som tillhör den inloggade användaren
	Optional<Comment> findByIdAndUserId(Long id, Long userId)
}
