package se.rateflix.repository

import org.springframework.data.jpa.repository.JpaRepository
import se.rateflix.model.User

interface UserRepository extends JpaRepository<User, Long> {

	Optional<User> findByEmail(String email)

	boolean existsByEmail(String email)
}
