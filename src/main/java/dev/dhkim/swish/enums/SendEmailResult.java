package dev.dhkim.swish.enums;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public enum SendEmailResult {
    SUCCESS,
    FAILURE,
    FAILURE_EMAIL_DUPLICATE
}
