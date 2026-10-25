package se.rateflix.dto

import com.fasterxml.jackson.annotation.JsonProperty

import java.time.Instant

record LibraryEntryResponse(
	MovieDto movie,
	boolean inWatchlist,
	Instant watchlistAt,
	@JsonProperty('isFavorite') boolean favorite,
	Instant favoriteAt,
	boolean watched,
	Instant watchedAt
) {}
