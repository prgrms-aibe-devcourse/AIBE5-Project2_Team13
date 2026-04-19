package com.ilsamcheonri.hobby.dto.classboard;

import com.ilsamcheonri.hobby.entity.ClassBoard;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClassBoardResponse {

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

    public static ClassBoardResponse from(ClassBoard classBoard) {
        return ClassBoardResponse.builder()
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
                .build();
    }
}
