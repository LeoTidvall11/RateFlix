package se.rateflix.dto

record ApiError(int status, String message, Map<String, String> errors) {}
