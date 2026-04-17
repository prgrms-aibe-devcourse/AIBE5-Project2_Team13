package com.ilsamcheonri.hobby.dto.freelancerprofile;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class FreelancerProfileApplyRequest {

    @NotBlank(message = "활동명은 필수입니다.")
    private String memberName;

    @NotNull(message = "전문 분야는 필수입니다.")
    private Long specialtyCategoryId;

    @NotBlank(message = "SNS 링크는 필수입니다.")
    private String snsLink;

    private String bio;

    private String career;

    private String bankAccount;
}
