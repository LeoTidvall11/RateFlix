package se.rateflix.model

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Table

import java.time.Instant

@Entity
@Table(name = 'users')
class User {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	Long id

	@Column(nullable = false, length = 100)
	String name

	@Column(nullable = false, unique = true)
	String email

	@Column(nullable = false)
	String passwordHash

	@Column(nullable = false)
	Instant createdAt = Instant.now()
}
