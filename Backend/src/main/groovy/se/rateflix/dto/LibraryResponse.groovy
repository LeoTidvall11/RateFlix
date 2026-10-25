package se.rateflix.dto

record LibraryResponse(
	List<LibraryEntryResponse> watchlist,
	List<LibraryEntryResponse> favorites,
	List<LibraryEntryResponse> watched
) {}
