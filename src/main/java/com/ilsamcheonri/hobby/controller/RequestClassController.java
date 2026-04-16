package com.ilsamcheonri.hobby.controller;

import com.ilsamcheonri.hobby.dto.requestclass.RequestClassCreateRequest;
import com.ilsamcheonri.hobby.dto.requestclass.RequestClassResponse;
import com.ilsamcheonri.hobby.service.RequestClassService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 📡 요청 클래스(REQUEST 타입) API 엔드포인트를 담당하는 Controller
 *
 * Controller의 역할:
 * - 프론트엔드의 HTTP 요청을 받아서 적절한 Service 메서드를 호출합니다.
 * - 비즈니스 로직은 절대 여기에 쓰지 않습니다. (그건 Service의 역할)
 * - 처리 결과를 HTTP 응답(ResponseEntity)으로 프론트엔드에 돌려줍니다.
 *
 * API URL 설계 원칙 (REST):
 * - 명사를 사용합니다: /request-classes (O) / getRequestClassList (X)
 * - OFFER 클래스와 구분: /api/request-classes (요청 클래스 전용 URL)
 */
@RestController
@RequestMapping("/api/request-classes") // 이 Controller의 모든 URL은 /api/request-classes 로 시작
@RequiredArgsConstructor
public class RequestClassController {

    private final RequestClassService requestClassService;

    // =========================================================
    // ✅ POST /api/request-classes → 요청 클래스 생성
    // =========================================================

    /**
     * 새로운 요청 클래스를 생성합니다.
     *
     * @AuthenticationPrincipal String email
     * - JwtFilter가 토큰을 검증한 뒤 SecurityContext에 저장해 둔 이메일을 꺼냅니다.
     * - 덕분에 Controller에서 별도로 토큰을 파싱하지 않아도 됩니다.
     *
     * @Valid
     * - RequestClassCreateRequest의 @NotBlank, @Future 등 유효성 검사를 실행합니다.
     * - 유효성 검사 실패 시 400 Bad Request를 자동으로 반환합니다.
     *
     * 응답: 201 Created + 생성된 클래스 ID
     */
    @PostMapping
    public ResponseEntity<Long> createRequestClass(
            @AuthenticationPrincipal String email,
            @Valid @RequestBody RequestClassCreateRequest request) {
        Long createdId = requestClassService.createRequestClass(email, request);
        // 201 Created: 새 리소스가 생성되었을 때의 표준 HTTP 상태코드
        return ResponseEntity.status(201).body(createdId);
    }

    // =========================================================
    // ✅ GET /api/request-classes → 요청 클래스 전체 목록 조회
    // =========================================================

    /**
     * 모든 요청 클래스 목록을 반환합니다.
     * 로그인 여부와 관계없이 누구나 조회할 수 있습니다. (SecurityConfig에서 permitAll 설정 필요)
     *
     * 응답: 200 OK + 요청 클래스 목록
     */
    @GetMapping
    public ResponseEntity<List<RequestClassResponse>> getRequestClassList() {
        List<RequestClassResponse> list = requestClassService.getRequestClassList();
        return ResponseEntity.ok(list);
    }

    // =========================================================
    // ✅ GET /api/request-classes/{id} → 요청 클래스 단건 조회
    // =========================================================

    /**
     * 특정 요청 클래스의 상세 정보를 반환합니다.
     *
     * @PathVariable Long id
     * - URL 경로의 {id} 부분을 파라미터로 받습니다.
     * - 예) GET /api/request-classes/5 → id = 5
     *
     * 응답: 200 OK + 요청 클래스 상세 정보
     */
    @GetMapping("/{id}")
    public ResponseEntity<RequestClassResponse> getRequestClass(
            @PathVariable Long id ) {
        RequestClassResponse response = requestClassService.getRequestClass(id);
        return ResponseEntity.ok(response);
    }

    // =========================================================
    // ✅ DELETE /api/request-classes/{id} → 요청 클래스 삭제
    // =========================================================

    /**
     * 요청 클래스를 삭제합니다. (소프트 삭제 = is_deleted = true)
     * 본인이 작성한 글만 삭제할 수 있습니다.
     *
     * 응답: 204 No Content (삭제 성공 시 반환할 Body가 없음)
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRequestClass(
            @PathVariable Long id,
            @AuthenticationPrincipal String email) {
        requestClassService.deleteRequestClass(id, email);
        // 204 No Content: 성공했지만 반환할 데이터가 없을 때의 표준 HTTP 상태코드
        return ResponseEntity.noContent().build();
    }
}
