package com.ilsamcheonri.hobby.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

//클래스에서 이미 신청한 클래스라고 인식하는 오류 해결 위해 추가함
@RestControllerAdvice
public class GlobalExceptionHandler {

    // 이미 신청한 클래스 같은 비즈니스 로직 에러를 400 Bad Request로 처리
    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<String> handleIllegalStateException(IllegalStateException e) {
        // 클라이언트에게 에러 메시지만 전달
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
    }
}