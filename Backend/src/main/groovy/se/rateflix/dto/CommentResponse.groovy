package se.rateflix.dto

import java.time.Instant

record CommentResponse(Long id, Long movieId, String text, Instant createdAt, Instant updatedAt) {}
