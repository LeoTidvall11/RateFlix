package se.rateflix.model

import jakarta.persistence.Entity
import jakarta.persistence.FetchType
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.Table
import jakarta.persistence.UniqueConstraint

import java.time.Instant

@Entity
@Table(name = 'library_entries', uniqueConstraints = @UniqueConstraint(columnNames = ['user_id', 'tmdb_id']))
class LibraryEntry {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	Long id

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = 'user_id')
	User user

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = 'tmdb_id')
	Movie movie

	boolean inWatchlist
	Instant watchlistAt

	boolean favorite
	Instant favoriteAt

	boolean watched
	Instant watchedAt

	boolean hasAnyStatus() {
		inWatchlist || favorite || watched
	}
}
