package com.ilsamcheonri.hobby.dto;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.security.oauth2.core.oidc.OidcUserInfo;

import java.time.LocalDate;

@Getter
@NoArgsConstructor
@AllArgsConstructor // 모든 필드를 인자로 받는 생성자 추가
@Builder // builder() 메서드를 자동으로 생성
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

    /**
     * [커스텀 검증 로직]
     * @AssertTrue는 이 메서드의 결과가 'true'일 때만 통과시킵니다.
     */
    @AssertTrue(message = "비밀번호와 비밀번호 확인이 일치하지 않습니다.")
    public boolean isPasswordMatching() {
        // 값이 입력되었다면, 반드시 원본 비밀번호와 일치해야 함
        return password != null && password.equals(passwordConfirm);
    }
}