package com.ilsamcheonri.hobby.dto.freelancerprofile;

import com.ilsamcheonri.hobby.entity.FreelancerProfileAttachment;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class FreelancerProfileAttachmentDto {
    private Long id;
    private String originalFileName;
    private String fileUrl;

    public static FreelancerProfileAttachmentDto from(FreelancerProfileAttachment attachment) {
        return FreelancerProfileAttachmentDto.builder()
                .id(attachment.getId())
                .originalFileName(attachment.getOriginalFileName())
                .fileUrl(attachment.getFileUrl())
                .build();
    }
}
