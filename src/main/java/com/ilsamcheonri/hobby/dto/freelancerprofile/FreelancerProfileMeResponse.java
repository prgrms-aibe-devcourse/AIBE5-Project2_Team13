package com.ilsamcheonri.hobby.dto.freelancerprofile;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class FreelancerProfileMeResponse {
    private Long profileId;
    private String memberName;
    private String memberEmail;
    private String memberPhone;
    private String memberAddress;
    private Long specialtyCategoryId;
    private String specialtyCategoryName;
    private String snsLink;
    private String bio;
    private String career;
    private String bankAccount;
    private String approvalStatusCode;
    private String approvalStatusName;
    private List<FreelancerProfileAttachmentDto> attachments;
}
