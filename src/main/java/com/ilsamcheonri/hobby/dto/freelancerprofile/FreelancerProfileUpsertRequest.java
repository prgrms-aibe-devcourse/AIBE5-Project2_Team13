package com.ilsamcheonri.hobby.dto.freelancerprofile;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class FreelancerProfileUpsertRequest {

    @NotNull(message = "전문 분야는 필수입니다.")
    private Long specialtyCategoryId;

    // 프로필 수정도 링크 없이 저장 가능해야 하므로 nullable/optional 입니다.
    private String snsLink;

    private String bio;

    private String career;

    private String bankAccount;
}
