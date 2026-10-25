package se.rateflix.dto

import java.time.Instant

record RatingResponse(MovieDto movie, Integer score, Instant updatedAt) {}
