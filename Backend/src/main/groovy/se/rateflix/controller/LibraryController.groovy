package se.rateflix.controller

import groovy.transform.CompileStatic
import jakarta.validation.Valid
import org.springframework.http.ResponseEntity
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PatchMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import se.rateflix.dto.LibraryEntryResponse
import se.rateflix.dto.LibraryResponse
import se.rateflix.dto.LibraryUpdateRequest
import se.rateflix.service.LibraryService

@CompileStatic
@RestController
@RequestMapping('/api/library')
class LibraryController {

	private final LibraryService libraryService

	LibraryController(LibraryService libraryService) {
		this.libraryService = libraryService
	}

	@GetMapping
	LibraryResponse getLibrary(@AuthenticationPrincipal Jwt jwt) {
		libraryService.getLibrary(Long.valueOf(jwt.subject))
	}

	@PatchMapping('/{tmdbId}')
	ResponseEntity<LibraryEntryResponse> update(
		@AuthenticationPrincipal Jwt jwt,
		@PathVariable Long tmdbId,
		@Valid @RequestBody LibraryUpdateRequest request
	) {
		Optional<LibraryEntryResponse> entry = libraryService.update(Long.valueOf(jwt.subject), tmdbId, request)
		entry.isPresent() ? ResponseEntity.ok(entry.get()) : ResponseEntity.noContent().build()
	}
}
