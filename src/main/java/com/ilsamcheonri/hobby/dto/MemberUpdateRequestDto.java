package com.ilsamcheonri.hobby.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MemberUpdateRequestDto {
    @NotBlank(message = "이름은 필수입니다.")
    private String name;

    private String phone;

    private String addr;

    private String addr2;
}
