package com.ilsamcheonri.hobby.service;

import com.ilsamcheonri.hobby.dto.requestclass.RequestClassCreateRequest;
import com.ilsamcheonri.hobby.dto.requestclass.RequestClassResponse;
import com.ilsamcheonri.hobby.entity.Category;
import com.ilsamcheonri.hobby.entity.ClassBoard;
import com.ilsamcheonri.hobby.entity.Member;
import com.ilsamcheonri.hobby.repository.CategoryRepository;
import com.ilsamcheonri.hobby.repository.ClassBoardRepository;
import com.ilsamcheonri.hobby.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 📋 요청 클래스(REQUEST 타입) 비즈니스 로직을 담당하는 Service
 *
 * Service 계층의 역할:
 * - Controller는 "요청을 받고 응답을 돌려주는" 역할만 합니다.
 * - 실제 비즈니스 로직(DB 조회, 유효성 검사, 데이터 가공)은 모두 Service에서 처리합니다.
 * - 이렇게 분리하면 Controller가 단순해지고, 로직 재사용도 쉬워집니다.
 *
 * @Transactional(readOnly = true)
 * - 클래스 전체에 "읽기 전용 트랜잭션"을 적용합니다.
 * - 읽기 전용이면 DB가 불필요한 변경 감지를 하지 않아 성능이 좋아집니다.
 * - 데이터를 변경하는 메서드에는 @Transactional을 별도로 붙여서 쓰기 트랜잭션을 허용합니다.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RequestClassService {

    // Spring이 자동으로 Repository 구현체를 주입해 줍니다 (@RequiredArgsConstructor 덕분)
    private final ClassBoardRepository classBoardRepository;
    private final MemberRepository memberRepository;
    private final CategoryRepository categoryRepository;

    // =========================================================
    // ✅ 1. 요청 클래스 생성
    // =========================================================

    /**
     * 요청 클래스를 새로 생성하고 저장합니다.
     *
     * 처리 순서:
     * 1. JWT에서 추출된 이메일로 회원 정보 조회
     * 2. 프론트에서 받은 카테고리 ID로 카테고리 정보 조회
     * 3. ClassBoard 엔티티를 생성 (boardType = "REQUEST" 고정)
     * 4. DB에 저장 후 저장된 ID 반환
     *
     * @param email   JwtFilter가 토큰에서 꺼낸 현재 로그인 사용자 이메일
     * @param request 프론트엔드에서 받은 요청 클래스 생성 데이터
     * @return 새로 생성된 요청 클래스의 ID
     */
    @Transactional // 데이터를 저장(변경)하므로 쓰기 트랜잭션 적용
    public Long createRequestClass(String email, RequestClassCreateRequest request) {

        // 1단계: 이메일로 회원 정보 조회 (없으면 예외 발생)
        Member member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));

        // 2단계: 카테고리 ID로 카테고리 정보 조회 (없으면 예외 발생)
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 카테고리입니다."));

        // 3단계: 종료 일시가 시작 일시보다 이전이면 예외 처리
        if (request.getEndAt().isBefore(request.getStartAt())) {
            throw new IllegalArgumentException("종료 일시는 시작 일시보다 이후여야 합니다.");
        }

        // 4단계: ClassBoard 엔티티 생성
        // Builder 패턴으로 가독성 있게 필드를 채워줍니다.
        // boardType을 "REQUEST"로 고정하는 것이 핵심입니다!
        ClassBoard requestClass = ClassBoard.builder()
                .freelancer(member)           // 요청자 = 현재 로그인한 회원
                .category(category)           // 선택한 카테고리
                .boardType("REQUEST")         // ⭐ OFFER가 아닌 REQUEST 타입으로 고정
                .title(request.getTitle())
                .description(request.getDescription())
                .price(request.getPrice() != null ? request.getPrice() : 0) // null이면 0원 처리
                .isOnline(request.getIsOnline())
                .startAt(request.getStartAt())
                .endAt(request.getEndAt())
                .maxCapacity(request.getMaxCapacity() != null ? request.getMaxCapacity() : 1) // null이면 1명 처리
                .status("OPEN")
                .curriculum("")
                .build();

        // 5단계: DB에 저장 후 생성된 ID 반환
        return classBoardRepository.save(requestClass).getId();
    }

    // =========================================================
    // ✅ 2. 요청 클래스 전체 목록 조회
    // =========================================================

    /**
     * 삭제되지 않은 모든 요청 클래스 목록을 반환합니다.
     *
     * stream().map().collect() 패턴:
     * - DB에서 가져온 Entity 리스트를 Response DTO 리스트로 변환합니다.
     * - "entity 하나 → DTO 하나" 변환을 리스트 전체에 적용하는 Java의 함수형 처리 방식입니다.
     *
     * @return 요청 클래스 응답 DTO 목록
     */
    public List<RequestClassResponse> getRequestClassList() {

        // boardType이 "REQUEST"이고 삭제되지 않은 게시글만 조회
        List<ClassBoard> requestClasses =
                classBoardRepository.findByBoardTypeAndIsDeletedFalse("REQUEST");

        // Entity 리스트 → DTO 리스트 변환
        return requestClasses.stream()
                .map(RequestClassResponse::from) // 각 Entity를 DTO로 변환 (from 메서드 사용)
                .collect(Collectors.toList());
    }

    // =========================================================
    // ✅ 3. 요청 클래스 단건 조회
    // =========================================================

    /**
     * 특정 ID의 요청 클래스 상세 정보를 반환합니다.
     *
     * @param id 조회할 요청 클래스 ID
     * @return 요청 클래스 응답 DTO
     */
    public RequestClassResponse getRequestClass(Long id) {

        // ID로 조회하되, REQUEST 타입이고 삭제되지 않은 것만 허용
        ClassBoard requestClass = classBoardRepository
                .findByIdAndBoardTypeAndIsDeletedFalse(id, "REQUEST")
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 요청 클래스입니다."));

        return RequestClassResponse.from(requestClass);
    }

    // =========================================================
    // ✅ 4. 요청 클래스 삭제 (소프트 삭제)
    // =========================================================

    /**
     * 요청 클래스를 삭제합니다. (실제 DB 삭제가 아닌 is_deleted = true 처리)
     *
     * 소프트 삭제(Soft Delete)란?
     * - DB에서 실제로 row를 지우지 않고, is_deleted 플래그만 true로 바꾸는 방식입니다.
     * - 나중에 복구가 가능하고, 데이터 추적(로그)에도 유리합니다.
     * - 이 프로젝트의 모든 테이블이 is_deleted 컬럼을 가지고 있으므로 이 방식을 사용합니다.
     *
     * @param id    삭제할 요청 클래스 ID
     * @param email 현재 로그인한 사용자 이메일 (본인 확인용)
     */
    @Transactional
    public void deleteRequestClass(Long id, String email) {

        // 1단계: 삭제 대상 게시글 조회
        ClassBoard requestClass = classBoardRepository
                .findByIdAndBoardTypeAndIsDeletedFalse(id, "REQUEST")
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 요청 클래스입니다."));

        // 2단계: 본인이 작성한 글인지 확인 (다른 사람의 글은 삭제 불가)
        if (!requestClass.getFreelancer().getEmail().equals(email)) {
            throw new IllegalArgumentException("본인이 작성한 요청 클래스만 삭제할 수 있습니다.");
        }

        // 3단계: 소프트 삭제 처리
        // ClassBoard 엔티티에 softDelete() 메서드를 추가해야 합니다. (아래 주석 참고)
        requestClass.softDelete();
    }
}
