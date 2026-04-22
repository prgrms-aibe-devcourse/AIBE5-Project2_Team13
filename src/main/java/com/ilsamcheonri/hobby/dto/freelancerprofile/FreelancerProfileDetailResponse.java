package com.ilsamcheonri.hobby.dto.freelancerprofile;

import com.ilsamcheonri.hobby.dto.classboard.ClassBoardResponse;
import com.ilsamcheonri.hobby.dto.review.ReviewResponse;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class FreelancerProfileDetailResponse {
    private Long freelancerId;
    private Long profileId;
    private String memberName;
    // 프론트에서 본인 여부 판단에 사용 (팔로우 버튼 숨김) - 최준열 추가
    private String memberEmail;
    private String memberImageUrl;
    private String memberAddress;
    private Long specialtyCategoryId;
    private String specialtyCategoryName;
    private String snsLink;
    private String bio;
    private String career;
    private String approvalStatusCode;
    private String approvalStatusName;
    private List<FreelancerProfileAttachmentDto> attachments;
    private List<ClassBoardResponse> activeClasses;
    private List<ClassBoardResponse> allClasses;
    private List<ReviewResponse> reviews;
}
