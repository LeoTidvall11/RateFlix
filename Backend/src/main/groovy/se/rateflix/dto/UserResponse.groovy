package se.rateflix.dto

import se.rateflix.model.User

record UserResponse(Long id, String name, String email) {

	static UserResponse from(User user) {
		new UserResponse(user.id, user.name, user.email)
	}
}
