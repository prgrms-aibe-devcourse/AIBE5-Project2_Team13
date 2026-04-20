package com.ilsamcheonri.hobby.dto.classboard;

import com.ilsamcheonri.hobby.entity.ClassBoard;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 클래스 상세 정보를 반환하기 위한 DTO (이미지 리스트 포함)
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClassDetailResponse {
    private Long id;
    private String title;
    private String description;
    private String categoryName;
    private String freelancerName;
    private String freelancerEmail;
    private Long freelancerId;
    private Integer price;
    private Boolean isOnline;
    private String startAt;
    private String endAt;
    private Integer maxCapacity;
    private String status;
    private String curriculum;
    private String location;
    private String createdAt;
    private String updatedAt;

    // 첨부 이미지 리스트
    private List<ClassAttachmentResponse> images;

    // 대표 이미지 URL
    private String representativeImageUrl;

    public static ClassDetailResponse from(ClassBoard classBoard, List<ClassAttachmentResponse> images) {
        return ClassDetailResponse.builder()
                .id(classBoard.getId())
                .title(classBoard.getTitle())
                .description(classBoard.getDescription())
                .categoryName(classBoard.getCategory().getName())
                .freelancerName(classBoard.getFreelancer().getName())
                .freelancerEmail(classBoard.getFreelancer().getEmail())
                .freelancerId(classBoard.getFreelancer().getId())
                .price(classBoard.getPrice())
                .isOnline(classBoard.isOnline())
                .startAt(classBoard.getStartAt() != null ? classBoard.getStartAt().toString() : null)
                .endAt(classBoard.getEndAt() != null ? classBoard.getEndAt().toString() : null)
                .maxCapacity(classBoard.getMaxCapacity())
                .status(classBoard.getStatus())
                .curriculum(classBoard.getCurriculum())
                .location(classBoard.getLocation())
                .createdAt(classBoard.getCreatedAt() != null ? classBoard.getCreatedAt().toString() : null)
                .updatedAt(classBoard.getUpdatedAt() != null ? classBoard.getUpdatedAt().toString() : null)
                .images(images)
                .representativeImageUrl(images.stream()
                        .filter(ClassAttachmentResponse::getIsRepresentative)
                        .findFirst()
                        .map(ClassAttachmentResponse::getFileUrl)
                        .orElse(null))
                .build();
    }
}