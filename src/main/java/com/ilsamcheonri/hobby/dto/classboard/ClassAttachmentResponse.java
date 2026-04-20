package com.ilsamcheonri.hobby.dto.classboard;

import com.ilsamcheonri.hobby.entity.ClassAttachment;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 클래스 첨부파일(이미지) 정보를 반환하기 위한 DTO
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClassAttachmentResponse {
    private Long id;
    private String originalFileName;
    private String fileUrl;
    private Long fileSize;
    private Boolean isRepresentative; // 대표 이미지 여부

    public static ClassAttachmentResponse from(ClassAttachment attachment) {
        return ClassAttachmentResponse.builder()
                .id(attachment.getId())
                .originalFileName(attachment.getOriginalFileName())
                .fileUrl(attachment.getFileUrl())
                .fileSize(attachment.getFileSize())
                .isRepresentative(attachment.isRepresentative())
                .build();
    }
}
