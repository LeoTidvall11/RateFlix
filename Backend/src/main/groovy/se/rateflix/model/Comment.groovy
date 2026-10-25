package se.rateflix.model

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.FetchType
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.Table

import java.time.Instant

@Entity
@Table(name = 'comments')
class Comment {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	Long id

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = 'user_id')
	User user

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = 'tmdb_id')
	Movie movie

	@Column(nullable = false, length = 1000)
	String text

	@Column(nullable = false)
	Instant createdAt = Instant.now()

	@Column(nullable = false)
	Instant updatedAt = Instant.now()
}
