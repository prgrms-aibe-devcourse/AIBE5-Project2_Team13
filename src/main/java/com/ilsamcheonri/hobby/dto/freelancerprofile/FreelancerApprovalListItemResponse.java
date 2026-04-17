package com.ilsamcheonri.hobby.dto.freelancerprofile;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class FreelancerApprovalListItemResponse {
    private Long profileId;
    private String memberName;
    private String memberEmail;
    private String specialtyCategoryName;
    private String career;
    private String snsLink;
    private String approvalStatusCode;
    private String approvalStatusName;
    private LocalDateTime appliedAt;
}
