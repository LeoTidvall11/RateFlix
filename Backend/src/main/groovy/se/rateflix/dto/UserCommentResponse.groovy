package se.rateflix.dto

import java.time.Instant

// Används på profilsidan, där filmen behövs för att visa vilken film kommentaren gäller
record UserCommentResponse(Long id, MovieDto movie, String text, Instant createdAt, Instant updatedAt) {}
