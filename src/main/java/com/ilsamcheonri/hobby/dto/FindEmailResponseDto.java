package com.ilsamcheonri.hobby.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@AllArgsConstructor
@Builder
public class FindEmailResponseDto {
    private String email;
}
