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
    private Long freelancerId;
    private Integer price;
    private boolean isOnline;
    private String startAt;
    private String endAt;
    private Integer maxCapacity;
    private String status;
    private String createdAt;

    public static ClassBoardResponse from(ClassBoard classBoard) {
        return ClassBoardResponse.builder()
                .id(classBoard.getId())
                .title(classBoard.getTitle())
                .description(classBoard.getDescription())
                .categoryName(classBoard.getCategory().getName())
                .freelancerName(classBoard.getFreelancer().getName())
                .freelancerId(classBoard.getFreelancer().getId())
                .price(classBoard.getPrice())
                .isOnline(classBoard.isOnline())
                .startAt(classBoard.getStartAt() != null ? classBoard.getStartAt().toString() : null)
                .endAt(classBoard.getEndAt() != null ? classBoard.getEndAt().toString() : null)
                .maxCapacity(classBoard.getMaxCapacity())
                .status(classBoard.getStatus())
                .createdAt(classBoard.getCreatedAt() != null ? classBoard.getCreatedAt().toString() : null)
                .build();
    }
}
