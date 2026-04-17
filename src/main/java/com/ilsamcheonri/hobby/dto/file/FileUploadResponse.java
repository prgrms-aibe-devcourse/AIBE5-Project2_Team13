package com.ilsamcheonri.hobby.dto.file;

import lombok.Builder;
import lombok.Getter;

/**
 * 파일 업로드/수정 후 클라이언트에 반환하는 응답 DTO
 *
 * fileId          : 저장된 첨부파일 고유번호 (수정/삭제 시 사용)
 * originalFileName: 사용자가 올린 원본 파일명
 * fileUrl         : 파일 접근 경로 (프론트에서 이미지 표시에 사용)
 * fileSize        : 파일 용량 (Byte)
 */
@Getter
@Builder
public class FileUploadResponse {
    private Long   fileId;
    private String originalFileName;
    private String fileUrl;
    private Long   fileSize;
}
