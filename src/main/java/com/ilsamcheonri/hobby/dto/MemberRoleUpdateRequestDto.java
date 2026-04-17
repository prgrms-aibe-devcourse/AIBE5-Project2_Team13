package com.ilsamcheonri.hobby.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MemberRoleUpdateRequestDto {
    @NotBlank(message = "권한은 필수입니다.")
    private String role;
}
