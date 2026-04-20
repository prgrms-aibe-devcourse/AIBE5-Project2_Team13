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

            alignFreelancerProfileSchema(jdbcTemplate);
            initializeIsDeletedColumn(jdbcTemplate);
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

    private void alignFreelancerProfileSchema(JdbcTemplate jdbcTemplate) {
        try {
            // 운영/로컬 DB마다 테이블 대소문자 차이가 있을 수 있어 information_schema로 실제 이름을 먼저 찾습니다.
            String tableName = jdbcTemplate.query(
                    """
                    SELECT table_name
                    FROM information_schema.tables
                    WHERE table_schema = DATABASE()
                      AND LOWER(table_name) = 'freelancer_profile'
                    LIMIT 1
                    """,
                    rs -> rs.next() ? rs.getString("table_name") : null
            );

            if (tableName == null) {
                return;
            }

            // 기존 로컬 DB가 sns_link NOT NULL 제약을 갖고 있으면 선택 입력 전환과 충돌하므로 서버 시작 시 한 번 맞춰줍니다.
            String isNullable = jdbcTemplate.query(
                    """
                    SELECT is_nullable
                    FROM information_schema.columns
                    WHERE table_schema = DATABASE()
                      AND LOWER(table_name) = 'freelancer_profile'
                      AND LOWER(column_name) = 'sns_link'
                    LIMIT 1
                    """,
                    rs -> rs.next() ? rs.getString("is_nullable") : null
            );

            if ("NO".equalsIgnoreCase(isNullable)) {
                jdbcTemplate.execute("ALTER TABLE `" + tableName + "` MODIFY COLUMN sns_link VARCHAR(255) NULL");
            }
        } catch (Exception exception) {
            System.out.println("⚠️ [DataInitConfig] sns_link nullable 스키마 보정 생략: " + exception.getMessage());
        }
    }
}
