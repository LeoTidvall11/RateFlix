package se.rateflix.model

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.Table
import org.hibernate.annotations.JdbcTypeCode
import org.hibernate.type.SqlTypes

import java.time.Instant
import java.time.LocalDate

@Entity
@Table(name = 'movies')
class Movie {

	@Id
	Long tmdbId

	@Column(nullable = false)
	String title

	String posterPath
	String backdropPath
	LocalDate releaseDate
	Double voteAverage
	Integer runtime

	@JdbcTypeCode(SqlTypes.JSON)
	List<Map<String, Object>> genres

	@Column(nullable = false)
	Instant updatedAt = Instant.now()
}
