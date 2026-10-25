package se.rateflix.service

import groovy.transform.CompileStatic
import org.springframework.stereotype.Service
import se.rateflix.dto.MovieDto
import se.rateflix.model.Movie
import se.rateflix.repository.MovieRepository

import java.time.Instant
import java.time.LocalDate
import java.time.format.DateTimeParseException

@CompileStatic
@Service
class MovieService {

	private final MovieRepository movieRepository

	MovieService(MovieRepository movieRepository) {
		this.movieRepository = movieRepository
	}

	Movie upsert(Long tmdbId, MovieDto dto) {
		Movie movie = movieRepository.findById(tmdbId).orElseGet(() -> new Movie(tmdbId: tmdbId))

		if (dto.title != null) movie.title = dto.title
		if (dto.posterPath != null) movie.posterPath = dto.posterPath
		if (dto.backdropPath != null) movie.backdropPath = dto.backdropPath
		if (dto.releaseDate != null) movie.releaseDate = parseDate(dto.releaseDate)
		if (dto.voteAverage != null) movie.voteAverage = dto.voteAverage
		if (dto.runtime != null) movie.runtime = dto.runtime
		if (dto.genres != null) movie.genres = dto.genres
		movie.updatedAt = Instant.now()

		movieRepository.save(movie)
	}

	static MovieDto toDto(Movie movie) {
		new MovieDto(
			id: movie.tmdbId,
			title: movie.title,
			posterPath: movie.posterPath,
			backdropPath: movie.backdropPath,
			releaseDate: movie.releaseDate?.toString(),
			voteAverage: movie.voteAverage,
			runtime: movie.runtime,
			genres: movie.genres
		)
	}

	private static LocalDate parseDate(String value) {
		try {
			value ? LocalDate.parse(value) : null
		} catch (DateTimeParseException ignored) {
			null
		}
	}
}
