package dev.dhkim.swish.enums;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public enum VerifyEmailResult {
    SUCCESS,
    FAILURE,
    FAILURE_EXPIRED
}
