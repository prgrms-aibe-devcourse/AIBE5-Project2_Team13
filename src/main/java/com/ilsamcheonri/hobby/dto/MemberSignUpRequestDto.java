package com.ilsamcheonri.hobby.dto;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MemberSignUpRequestDto {

    @NotBlank(message = "이름은 필수 입력 값입니다.")
    private String name;

    @NotBlank(message = "이메일은 필수 입력 값입니다.")
    @Email(message = "이메일 형식이 올바르지 않습니다.")
    private String email;

    @NotBlank(message = "비밀번호는 필수 입력 값입니다.")
    private String password;

    @NotBlank(message = "비밀번호 확인은 필수 입력 값입니다.")
    private String passwordConfirm;

    @NotNull(message = "생년월일은 필수 입력 값입니다.")
    private LocalDate birth;

    @NotBlank(message = "전화번호는 필수 입력 값입니다.")
    private String phone;

    @NotBlank(message = "활동 지역은 필수 입력 값입니다.")
    private String addr;

    @NotBlank
    private String addr2;

    @AssertTrue(message = "비밀번호와 비밀번호 확인이 일치하지 않습니다.")
    public boolean isPasswordMatching() {
        return password != null && password.equals(passwordConfirm);
    }
}