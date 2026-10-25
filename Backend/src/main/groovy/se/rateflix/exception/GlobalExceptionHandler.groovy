package se.rateflix.exception

import groovy.transform.CompileStatic
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.authentication.BadCredentialsException
import org.springframework.web.bind.MethodArgumentNotValidException
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice
import se.rateflix.dto.ApiError

@CompileStatic
@RestControllerAdvice
class GlobalExceptionHandler {

	@ExceptionHandler(MethodArgumentNotValidException)
	ResponseEntity<ApiError> handleValidation(MethodArgumentNotValidException ex) {
		Map<String, String> errors = ex.bindingResult.fieldErrors.collectEntries {
			[(it.field): it.defaultMessage]
		}
		error(HttpStatus.BAD_REQUEST, 'Validation failed', errors)
	}

	@ExceptionHandler(BadCredentialsException)
	ResponseEntity<ApiError> handleBadCredentials(BadCredentialsException ex) {
		error(HttpStatus.UNAUTHORIZED, ex.message)
	}

	@ExceptionHandler(NotFoundException)
	ResponseEntity<ApiError> handleNotFound(NotFoundException ex) {
		error(HttpStatus.NOT_FOUND, ex.message)
	}

	@ExceptionHandler(ConflictException)
	ResponseEntity<ApiError> handleConflict(ConflictException ex) {
		error(HttpStatus.CONFLICT, ex.message)
	}

	private static ResponseEntity<ApiError> error(HttpStatus status, String message, Map<String, String> errors = null) {
		ResponseEntity.status(status).body(new ApiError(status.value(), message, errors))
	}
}
