package se.rateflix.repository

import org.springframework.data.jpa.repository.EntityGraph
import org.springframework.data.jpa.repository.JpaRepository
import se.rateflix.model.LibraryEntry

interface LibraryEntryRepository extends JpaRepository<LibraryEntry, Long> {

	@EntityGraph(attributePaths = ['movie'])
	List<LibraryEntry> findByUserId(Long userId)

	@EntityGraph(attributePaths = ['movie'])
	Optional<LibraryEntry> findByUserIdAndMovieTmdbId(Long userId, Long tmdbId)
}
