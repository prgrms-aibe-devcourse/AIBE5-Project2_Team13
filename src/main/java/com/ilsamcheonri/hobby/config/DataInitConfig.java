package com.ilsamcheonri.hobby.config;

import com.ilsamcheonri.hobby.entity.Category;
import com.ilsamcheonri.hobby.entity.RoleCode;
import com.ilsamcheonri.hobby.repository.CategoryRepository;
import com.ilsamcheonri.hobby.repository.RoleCodeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

import java.util.List;

/**
 * 🗂️ 애플리케이션 시작 시 필수 초기 데이터를 자동으로 삽입하는 설정 클래스
 *
 * CommandLineRunner란?
 * - Spring Boot가 완전히 뜬 직후 딱 한 번 실행되는 코드 블록입니다.
 * - DB에 꼭 있어야 하는 기준 데이터(권한, 카테고리 등)를 여기서 세팅합니다.
 *
 * 중복 방지 전략:
 * - "이미 데이터가 있으면 아무것도 하지 않는다" 방식으로 처리합니다.
 * - 서버를 재시작해도 데이터가 중복 삽입되지 않습니다.
 */
@Configuration
@RequiredArgsConstructor
public class DataInitConfig {

    // 관리자 1:1 문의 채팅은 프론트/서비스 여기저기 흩어두지 않고 초기 데이터 설정 클래스에서 단일 기준값으로 관리합니다.
    // 관리자 1:1 문의 채팅은 이 이메일 계정을 고정 대상으로 사용합니다.
    public static final String ADMIN_CHAT_EMAIL = "admin@gmail.com";

    @Bean
    CommandLineRunner init(RoleCodeRepository roleCodeRepo,
                           CategoryRepository categoryRepo,
                           JdbcTemplate jdbcTemplate) {
        return args -> {

            // ──────────────────────────────────────────
            // 1. 권한(ROLE) 초기 데이터
            // ──────────────────────────────────────────
            if (roleCodeRepo.findByRoleCode("U").isEmpty()) {
                roleCodeRepo.save(RoleCode.create("U", "일반 사용자"));
            }
            if (roleCodeRepo.findByRoleCode("F").isEmpty()) {
                roleCodeRepo.save(RoleCode.create("F", "프리랜서(전문가)"));
            }
            if (roleCodeRepo.findByRoleCode("A").isEmpty()) {
                roleCodeRepo.save(RoleCode.create("A", "관리자"));
            }

            // ──────────────────────────────────────────
            // 2. 카테고리(CATEGORY) 초기 데이터 — 대분류만 삽입
            //
            // 화면에 보이는 탭 순서와 동일하게 sort_order를 지정합니다.
            // parent = null → 대분류 (최상위 카테고리)
            // is_visible = true → 화면에 노출
            //
            // 중분류는 현재 회의 결과 사용하지 않기로 했으나,
            // parent_id 컬럼은 남겨두어 나중에 추가할 수 있도록 합니다.
            // ──────────────────────────────────────────

            // 카테고리가 하나도 없을 때만 삽입 (중복 방지)
            if (categoryRepo.count() == 0) {

                // 화면 탭 순서 기준: 전체는 별도 버튼이므로 DB에는 넣지 않습니다.
                List<Category> categories = List.of(
                        buildCategory("뷰티·패션",   1),
                        buildCategory("음악·악기",   2),
                        buildCategory("미술·공예",   3),
                        buildCategory("댄스·연기",   4),
                        buildCategory("어학·교육",   5),
                        buildCategory("스포츠·레저", 6),
                        buildCategory("게임",        7),
                        buildCategory("라이프·요리", 8),
                        buildCategory("기타",        9)
                );

                categoryRepo.saveAll(categories);
                System.out.println("✅ [DataInitConfig] 카테고리 대분류 9개 초기 데이터 삽입 완료");
            }

            initializeIsDeletedColumn(jdbcTemplate);
            ensureChatParticipantLastClearedAtColumn(jdbcTemplate);
        };
    }


    private void initializeIsDeletedColumn(JdbcTemplate jdbcTemplate) {
        try {
            // CLASS_BOARD 테이블의 is_deleted 컬럼이 NULL인 경우 false(0)로 초기화
            // (새 컬럼 추가 시 기존 데이터 보정용)
            jdbcTemplate.execute("UPDATE class_board SET is_deleted = false WHERE is_deleted IS NULL");
            System.out.println("✅ [DataInitConfig] CLASS_BOARD 테이블 is_deleted 필드 초기화 완료");
        } catch (Exception exception) {
            System.out.println("⚠️ [DataInitConfig] is_deleted 필드 초기화 생략 (컬럼 부재 등): " + exception.getMessage());
        }
    }

    /** 채팅방 나가고 다시 채팅을 할 때 새로운 채팅처럼 보이게 하기 위한 쿼리 */
    private void ensureChatParticipantLastClearedAtColumn(JdbcTemplate jdbcTemplate) {
        try {
            Integer columnCount = jdbcTemplate.queryForObject(
                    """
                    SELECT COUNT(*)
                    FROM information_schema.columns
                    WHERE table_schema = DATABASE()
                      AND LOWER(table_name) = 'chat_participant'
                      AND LOWER(column_name) = 'last_cleared_at'
                    """,
                    Integer.class
            );

            if (columnCount != null && columnCount == 0) {
                // 채팅방 나가기 후 재입장한 사용자에게는 이 시점 이후 메시지만 보이게 할 새 컬럼입니다.
                jdbcTemplate.execute("ALTER TABLE CHAT_PARTICIPANT ADD COLUMN last_cleared_at DATETIME(6) NULL");
            }
        } catch (Exception exception) {
            System.out.println("⚠️ [DataInitConfig] CHAT_PARTICIPANT.last_cleared_at 컬럼 보정 생략: " + exception.getMessage());
        }
    }

    /**
     * 대분류 카테고리 엔티티를 생성하는 헬퍼 메서드
     *
     * @param name      카테고리 이름 (화면에 표시되는 탭 이름과 동일)
     * @param sortOrder 화면 노출 순서 (왼쪽부터 1, 2, 3 ...)
     * @return 저장할 Category 엔티티
     */
    private Category buildCategory(String name, int sortOrder) {
        return Category.builder()
                .parent(null)       // 대분류이므로 부모 없음
                .name(name)
                .sortOrder(sortOrder)
                .isVisible(true)    // 화면에 노출
                .isDeleted(false)
                .build();
    }

}
