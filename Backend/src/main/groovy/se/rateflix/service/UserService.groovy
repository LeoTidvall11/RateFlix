package se.rateflix.service

import groovy.transform.CompileStatic
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import se.rateflix.dto.UserResponse
import se.rateflix.exception.NotFoundException
import se.rateflix.repository.UserRepository

@CompileStatic
@Service
class UserService {

	private final UserRepository userRepository

	UserService(UserRepository userRepository) {
		this.userRepository = userRepository
	}

	@Transactional(readOnly = true)
	UserResponse getUser(Long id) {
		userRepository.findById(id)
			.map(UserResponse::from)
			.orElseThrow(() -> new NotFoundException('User not found'))
	}
}
