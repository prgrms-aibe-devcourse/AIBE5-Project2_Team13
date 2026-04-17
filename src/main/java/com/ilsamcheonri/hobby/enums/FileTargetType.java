package com.ilsamcheonri.hobby.enums;

/**
 * 첨부파일 대상 타입
 *
 * CLASS      → CLASS_ATTACHMENT 테이블
 * MEMBER     → MEMBER_ATTACHMENT 테이블
 * FREELANCER → FREELANCER_PROFILE_ATTACHMENT 테이블
 *
 * FileController에서 targetType 파라미터로 받아서
 * 어느 테이블에 저장/수정/삭제할지 분기합니다.
 */
public enum FileTargetType {
    CLASS,
    MEMBER,
    FREELANCER
}
