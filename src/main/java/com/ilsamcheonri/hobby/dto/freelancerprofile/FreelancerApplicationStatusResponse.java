package com.ilsamcheonri.hobby.dto.freelancerprofile;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class FreelancerApplicationStatusResponse {
    private boolean hasProfile;
    private String approvalStatusCode;
    private String approvalStatusName;
}
