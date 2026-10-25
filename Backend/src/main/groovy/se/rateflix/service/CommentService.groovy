package se.rateflix.service

import groovy.transform.CompileStatic
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import se.rateflix.dto.CommentRequest
import se.rateflix.dto.CommentResponse
import se.rateflix.dto.UserCommentResponse
import se.rateflix.exception.ConflictException
import se.rateflix.exception.NotFoundException
import se.rateflix.model.Comment
import se.rateflix.model.Movie
import se.rateflix.repository.CommentRepository
import se.rateflix.repository.LibraryEntryRepository
import se.rateflix.repository.UserRepository

import java.time.Instant

@CompileStatic
@Service
class CommentService {

	private final CommentRepository commentRepository
	private final LibraryEntryRepository libraryEntryRepository
	private final UserRepository userRepository
	private final MovieService movieService

	CommentService(
		CommentRepository commentRepository,
		LibraryEntryRepository libraryEntryRepository,
		UserRepository userRepository,
		MovieService movieService
	) {
		this.commentRepository = commentRepository
		this.libraryEntryRepository = libraryEntryRepository
		this.userRepository = userRepository
		this.movieService = movieService
	}

	@Transactional(readOnly = true)
	List<CommentResponse> getComments(Long userId, Long tmdbId) {
		commentRepository.findByUserIdAndMovieTmdbIdOrderByCreatedAtDesc(userId, tmdbId).collect { toResponse(it) }
	}

	@Transactional(readOnly = true)
	List<UserCommentResponse> getUserComments(Long userId) {
		commentRepository.findByUserIdOrderByCreatedAtDesc(userId).collect { toUserResponse(it) }
	}

	@Transactional
	CommentResponse addComment(Long userId, Long tmdbId, CommentRequest request) {
		boolean watched = libraryEntryRepository.findByUserIdAndMovieTmdbId(userId, tmdbId)
			.map { it.watched }
			.orElse(false)
		if (!watched) throw new ConflictException('You can only comment on movies you have watched')
		if (request.movie == null) throw new ConflictException('Movie is required for a new comment')

		Movie movie = movieService.upsert(tmdbId, request.movie)
		Comment comment = new Comment(
			user: userRepository.getReferenceById(userId),
			movie: movie,
			text: request.text.trim()
		)
		toResponse(commentRepository.save(comment))
	}

	@Transactional
	CommentResponse updateComment(Long userId, Long commentId, CommentRequest request) {
		Comment comment = findOwnComment(userId, commentId)
		comment.text = request.text.trim()
		comment.updatedAt = Instant.now()
		toResponse(commentRepository.save(comment))
	}

	@Transactional
	void deleteComment(Long userId, Long commentId) {
		commentRepository.delete(findOwnComment(userId, commentId))
	}

	// En annan användares kommentar ger 404, så att man inte kan se att den finns
	private Comment findOwnComment(Long userId, Long commentId) {
		commentRepository.findByIdAndUserId(commentId, userId)
			.orElseThrow(() -> new NotFoundException('Comment not found'))
	}

	private static CommentResponse toResponse(Comment comment) {
		new CommentResponse(comment.id, comment.movie.tmdbId, comment.text, comment.createdAt, comment.updatedAt)
	}

	private static UserCommentResponse toUserResponse(Comment comment) {
		new UserCommentResponse(comment.id, MovieService.toDto(comment.movie), comment.text, comment.createdAt, comment.updatedAt)
	}
}
