package com.ilsamcheonri.hobby.dto.freelancerprofile;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class FreelancerProfileApplyRequest {

    // 활동명은 Member.name도 같이 갱신하므로 등록 시점에 필수로 유지합니다.
    @NotBlank(message = "활동명은 필수입니다.")
    private String memberName;

    @NotNull(message = "전문 분야는 필수입니다.")
    private Long specialtyCategoryId;

    // 포트폴리오 링크는 이제 이미지 업로드만으로도 등록 가능하므로 nullable/optional 입니다.
    private String snsLink;

    private String bio;

    private String career;

    private String bankAccount;
}
