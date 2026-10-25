package se.rateflix.controller

import groovy.transform.CompileStatic
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestController
import se.rateflix.dto.CommentRequest
import se.rateflix.dto.CommentResponse
import se.rateflix.dto.UserCommentResponse
import se.rateflix.service.CommentService

@CompileStatic
@RestController
@RequestMapping('/api/comments')
class CommentController {

	private final CommentService commentService

	CommentController(CommentService commentService) {
		this.commentService = commentService
	}

	@GetMapping('/me')
	List<UserCommentResponse> getUserComments(@AuthenticationPrincipal Jwt jwt) {
		commentService.getUserComments(Long.valueOf(jwt.subject))
	}

	@GetMapping('/movie/{tmdbId}')
	List<CommentResponse> getComments(@AuthenticationPrincipal Jwt jwt, @PathVariable Long tmdbId) {
		commentService.getComments(Long.valueOf(jwt.subject), tmdbId)
	}

	@PostMapping('/movie/{tmdbId}')
	@ResponseStatus(HttpStatus.CREATED)
	CommentResponse addComment(@AuthenticationPrincipal Jwt jwt, @PathVariable Long tmdbId, @Valid @RequestBody CommentRequest request) {
		commentService.addComment(Long.valueOf(jwt.subject), tmdbId, request)
	}

	@PutMapping('/{commentId}')
	CommentResponse updateComment(@AuthenticationPrincipal Jwt jwt, @PathVariable Long commentId, @Valid @RequestBody CommentRequest request) {
		commentService.updateComment(Long.valueOf(jwt.subject), commentId, request)
	}

	@DeleteMapping('/{commentId}')
	@ResponseStatus(HttpStatus.NO_CONTENT)
	void deleteComment(@AuthenticationPrincipal Jwt jwt, @PathVariable Long commentId) {
		commentService.deleteComment(Long.valueOf(jwt.subject), commentId)
	}
}
