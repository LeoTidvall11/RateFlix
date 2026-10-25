package se.rateflix.repository

import org.springframework.data.jpa.repository.JpaRepository
import se.rateflix.model.Movie

interface MovieRepository extends JpaRepository<Movie, Long> {
}
