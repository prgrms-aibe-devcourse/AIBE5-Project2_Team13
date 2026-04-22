package com.ilsamcheonri.hobby.dto.review;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class ReviewRequest {
    @NotNull
    @Min(1)
    @Max(5)
    private Integer rating;

    @NotBlank
    private String content;
}
