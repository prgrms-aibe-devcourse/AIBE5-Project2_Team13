package com.ilsamcheonri.hobby.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * @author 김한비
 * @since 2026.04.24
 *
 * 전역 예외 처리 핸들러입니다.
 * - 컨트롤러 전반에서 발생하는 예외를 공통 처리
 * - 비즈니스 로직 예외를 400 Bad Request로 변환
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * IllegalStateException 처리
     * - 비즈니스 로직 오류를 400 응답으로 반환
     *
     * @param e 예외 객체
     * @return 에러 메시지
     */
    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<String> handleIllegalStateException(IllegalStateException e) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
    }

    /**
     * IllegalArgumentException 처리
     * - 잘못된 요청 값에 대해 400 응답 반환
     *
     * @param e 예외 객체
     * @return 에러 메시지
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> handleIllegalArgumentException(IllegalArgumentException e) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
    }
}