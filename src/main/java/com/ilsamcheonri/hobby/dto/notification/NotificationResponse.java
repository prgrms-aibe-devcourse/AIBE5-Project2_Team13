package com.ilsamcheonri.hobby.dto.notification;

import com.ilsamcheonri.hobby.entity.Notification;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

/**
 * 📤 알림 목록 응답 DTO
 *
 * 프론트에서 알림 드롭다운에 표시하는 데 필요한 정보를 담습니다.
 *
 * relatedLink : 알림 클릭 시 이동할 경로 (예: /class/1, /profile)
 * type        : 알림 종류 (프론트에서 아이콘 구분에 사용 가능)
 * @author 최준열
 * @since 2026.04.23
 * @version 1.0
 * @see Notification
 */
@Getter
@Builder
public class NotificationResponse {

    private Long id;
    private String type;
    private String content;
    private String relatedLink;
    private Boolean isRead;     // boolean → Boolean : Jackson이 "isRead"로 직렬화
    private LocalDateTime createdAt;

    /** Entity → DTO 변환 */
    public static NotificationResponse from(Notification n) {
        return NotificationResponse.builder()
                .id(n.getId())
                .type(n.getType())
                .content(n.getContent())
                .relatedLink(n.getRelatedLink())
                .isRead(n.isRead())
                .createdAt(n.getCreatedAt())
                .build();
    }
}
