package se.rateflix.service

import groovy.transform.CompileStatic
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import se.rateflix.dto.LibraryEntryResponse
import se.rateflix.dto.LibraryResponse
import se.rateflix.dto.LibraryUpdateRequest
import se.rateflix.model.LibraryEntry
import se.rateflix.model.Movie
import se.rateflix.repository.LibraryEntryRepository
import se.rateflix.repository.UserRepository

import java.time.Instant
import java.util.function.Function

@CompileStatic
@Service
class LibraryService {

	private final LibraryEntryRepository libraryEntryRepository
	private final UserRepository userRepository
	private final MovieService movieService

	LibraryService(LibraryEntryRepository libraryEntryRepository, UserRepository userRepository, MovieService movieService) {
		this.libraryEntryRepository = libraryEntryRepository
		this.userRepository = userRepository
		this.movieService = movieService
	}

	@Transactional(readOnly = true)
	LibraryResponse getLibrary(Long userId) {
		List<LibraryEntry> entries = libraryEntryRepository.findByUserId(userId)

		new LibraryResponse(
			newestFirst(entries.findAll { it.inWatchlist }, LibraryEntry::getWatchlistAt),
			newestFirst(entries.findAll { it.favorite }, LibraryEntry::getFavoriteAt),
			newestFirst(entries.findAll { it.watched }, LibraryEntry::getWatchedAt)
		)
	}

	// Returnerar tom Optional om filmen inte har någon flagga kvar och därför togs bort
	@Transactional
	Optional<LibraryEntryResponse> update(Long userId, Long tmdbId, LibraryUpdateRequest request) {
		Movie movie = movieService.upsert(tmdbId, request.movie)
		LibraryEntry entry = libraryEntryRepository.findByUserIdAndMovieTmdbId(userId, tmdbId)
			.orElseGet(() -> new LibraryEntry(user: userRepository.getReferenceById(userId), movie: movie))
		Instant now = Instant.now()

		if (request.inWatchlist != null && request.inWatchlist != entry.inWatchlist) {
			entry.inWatchlist = request.inWatchlist
			entry.watchlistAt = entry.inWatchlist ? now : null
		}

		if (request.favorite != null && request.favorite != entry.favorite) {
			entry.favorite = request.favorite
			entry.favoriteAt = entry.favorite ? now : null
		}

		if (request.watched != null && request.watched != entry.watched) {
			entry.watched = request.watched
			entry.watchedAt = entry.watched ? now : null
			if (entry.watched) {
				entry.inWatchlist = false
				entry.watchlistAt = null
			}
		}

		if (!entry.hasAnyStatus()) {
			if (entry.id != null) libraryEntryRepository.delete(entry)
			return Optional.empty()
		}

		Optional.of(toResponse(libraryEntryRepository.save(entry)))
	}

	private static List<LibraryEntryResponse> newestFirst(List<LibraryEntry> entries, Function<LibraryEntry, Instant> dateOf) {
		entries.stream()
			.sorted(Comparator.comparing(dateOf, Comparator.nullsLast(Comparator.<Instant> reverseOrder())))
			.map(LibraryService::toResponse)
			.toList()
	}

	private static LibraryEntryResponse toResponse(LibraryEntry entry) {
		new LibraryEntryResponse(
			MovieService.toDto(entry.movie),
			entry.inWatchlist,
			entry.watchlistAt,
			entry.favorite,
			entry.favoriteAt,
			entry.watched,
			entry.watchedAt
		)
	}
}
