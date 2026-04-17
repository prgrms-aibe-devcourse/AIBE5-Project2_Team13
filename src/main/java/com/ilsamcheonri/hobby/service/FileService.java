package com.ilsamcheonri.hobby.service;

import com.ilsamcheonri.hobby.dto.file.FileUploadResponse;
import com.ilsamcheonri.hobby.entity.*;
import com.ilsamcheonri.hobby.enums.FileTargetType;
import com.ilsamcheonri.hobby.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * 📁 파일 업로드/수정/삭제 공통 Service
 *
 * 파일 저장 경로: D:\fileDownLoadServer\
 *
 * targetType에 따라 3개의 첨부파일 테이블을 공통으로 처리합니다.
 *   CLASS      → CLASS_ATTACHMENT
 *   MEMBER     → MEMBER_ATTACHMENT
 *   FREELANCER → FREELANCER_PROFILE_ATTACHMENT
 *
 * 다른 Service에서 FileService를 주입받아 사용할 수 있습니다.
 * 예) ClassBoardService에서 파일 업로드 시 fileService.upload() 호출
 */
@Service
@RequiredArgsConstructor
@Transactional
public class FileService {

    private final ClassAttachmentRepository             classAttachmentRepository;
    private final MemberAttachmentRepository            memberAttachmentRepository;
    private final FreelancerProfileAttachmentRepository freelancerAttachmentRepository;

    // application.properties에서 설정 (기본값: D:\fileDownLoadServer\)
    @Value("${file.upload.path:D:\\fileDownLoadServer\\}")
    private String uploadPath;

    // =========================================================
    // ✅ 1. 파일 업로드 (등록)
    // =========================================================

    /**
     * 파일을 D:\fileDownLoadServer\에 저장하고 해당 첨부파일 테이블에 기록합니다.
     *
     * @param file       업로드할 파일
     * @param targetType CLASS / MEMBER / FREELANCER
     * @param targetId   각 타입의 고유번호 (class_id, member_id, freelancer_profile_id)
     * @return 저장된 파일 정보 (fileId, fileUrl 등)
     */
    public FileUploadResponse upload(
            MultipartFile file,
            FileTargetType targetType,
            Long targetId
    ) throws IOException {

        // 1. UUID로 고유 파일명 생성 (중복 방지)
        String originalFileName = file.getOriginalFilename();
        String savedFileName    = UUID.randomUUID() + "_" + originalFileName;
        String fileUrl          = uploadPath + savedFileName;
        long   fileSize         = file.getSize();

        // 2. 디렉토리가 없으면 생성 후 파일 저장
        Path savePath = Paths.get(fileUrl);
        Files.createDirectories(savePath.getParent());
        file.transferTo(savePath.toFile());

        // 3. targetType에 따라 각 첨부파일 테이블에 저장
        Long savedId = switch (targetType) {
            case CLASS      -> uploadClassAttachment(
                    targetId, originalFileName, savedFileName, fileUrl, fileSize);
            case MEMBER     -> uploadMemberAttachment(
                    targetId, originalFileName, savedFileName, fileUrl, fileSize);
            case FREELANCER -> uploadFreelancerAttachment(
                    targetId, originalFileName, savedFileName, fileUrl, fileSize);
        };

        return FileUploadResponse.builder()
                .fileId(savedId)
                .originalFileName(originalFileName)
                .fileUrl(fileUrl)
                .fileSize(fileSize)
                .build();
    }

    // =========================================================
    // ✅ 2. 다중 파일 업로드
    // =========================================================

    /**
     * 여러 파일을 한 번에 업로드합니다.
     *
     * 일부 파일 업로드 실패 시 해당 파일은 건너뛰고
     * 나머지 파일은 계속 처리합니다.
     *
     * @param files      업로드할 파일 목록
     * @param targetType CLASS / MEMBER / FREELANCER
     * @param targetId   각 타입의 고유번호
     * @return 업로드 성공한 파일들의 정보 목록
     */
    public List<FileUploadResponse> uploadMultiple(
            List<MultipartFile> files,
            FileTargetType targetType,
            Long targetId
    ) throws IOException {
        List<FileUploadResponse> results = new ArrayList<>();

        for (MultipartFile file : files) {
            if (file.isEmpty()) continue; // 빈 파일 건너뜀

            try {
                results.add(upload(file, targetType, targetId));
            } catch (IOException e) {
                // 개별 파일 실패 시 로그만 남기고 나머지 계속 처리
                System.err.println("[FileService] 파일 업로드 실패: "
                        + file.getOriginalFilename() + " / " + e.getMessage());
            }
        }
        return results;
    }

    // =========================================================
    // ✅ 3. 파일 수정 (기존 파일 소프트 삭제 → 새 파일 등록)
    // =========================================================

    /**
     * 기존 파일을 소프트 삭제하고 새 파일로 교체합니다.
     *
     * @param fileId     교체할 기존 첨부파일 ID
     * @param file       새로 업로드할 파일
     * @param targetType CLASS / MEMBER / FREELANCER
     * @param targetId   각 타입의 고유번호
     * @return 새로 저장된 파일 정보
     */
    public FileUploadResponse update(
            Long fileId,
            MultipartFile file,
            FileTargetType targetType,
            Long targetId
    ) throws IOException {

        // 1. 기존 파일 소프트 삭제
        softDelete(fileId, targetType);

        // 2. 새 파일 업로드
        return upload(file, targetType, targetId);
    }

    // =========================================================
    // ✅ 3. 파일 삭제 (DB 소프트 삭제 + 실제 파일 삭제)
    // =========================================================

    /**
     * 첨부파일을 삭제합니다.
     *
     * 처리 순서:
     * 1. DB — is_deleted = true (소프트 삭제)
     * 2. 실제 파일 — D:\fileDownLoadServer\에서 물리적으로 삭제
     *
     * 왜 두 가지를 같이 처리하나요?
     * - DB만 삭제하면 D:\fileDownLoadServer\에 파일이 계속 쌓여 디스크 낭비
     * - 실제 파일만 삭제하면 다운로드 API 호출 시 500 에러 발생
     * - 두 가지를 동시에 처리해서 일관성을 보장합니다.
     *
     * @param fileId     삭제할 첨부파일 ID
     * @param targetType CLASS / MEMBER / FREELANCER
     */
    public void delete(Long fileId, FileTargetType targetType) {
        // 1. DB에서 savedFileName 조회 후 소프트 삭제
        String savedFileName = switch (targetType) {
            case CLASS -> {
                ClassAttachment attachment = classAttachmentRepository
                        .findByIdAndIsDeletedFalse(fileId)
                        .orElseThrow(() -> new IllegalArgumentException("파일을 찾을 수 없습니다."));
                attachment.softDelete();
                yield attachment.getSavedFileName();
            }
            case MEMBER -> {
                MemberAttachment attachment = memberAttachmentRepository
                        .findByIdAndIsDeletedFalse(fileId)
                        .orElseThrow(() -> new IllegalArgumentException("파일을 찾을 수 없습니다."));
                attachment.softDelete();
                yield attachment.getSavedFileName();
            }
            case FREELANCER -> {
                FreelancerProfileAttachment attachment = freelancerAttachmentRepository
                        .findByIdAndIsDeletedFalse(fileId)
                        .orElseThrow(() -> new IllegalArgumentException("파일을 찾을 수 없습니다."));
                attachment.softDelete();
                yield attachment.getSavedFileName();
            }
        };

        // 2. 실제 파일 삭제 (D:\fileDownLoadServer\)
        // DB 트랜잭션이 실패해도 파일이 남아있을 수 있으므로
        // 파일 삭제 실패는 에러를 던지지 않고 로그만 남깁니다.
        deletePhysicalFile(savedFileName);
    }

    /**
     * 하위 호환성 유지용 — 기존에 softDelete()를 호출하던 코드가 있다면
     * 내부적으로 delete()를 호출합니다.
     */
    public void softDelete(Long fileId, FileTargetType targetType) {
        delete(fileId, targetType);
    }

    // =========================================================
    // ✅ 6. 다중 파일 삭제
    // =========================================================

    /**
     * 여러 파일을 한 번에 삭제합니다.
     * 각 파일마다 delete()를 순차적으로 호출합니다.
     *
     * 일부 파일 삭제 실패 시 해당 파일은 건너뛰고
     * 나머지 파일은 계속 처리합니다.
     *
     * @param fileIds    삭제할 파일 ID 목록
     * @param targetType CLASS / MEMBER / FREELANCER
     */
    public void deleteMultiple(List<Long> fileIds, FileTargetType targetType) {
        for (Long fileId : fileIds) {
            try {
                delete(fileId, targetType);
            } catch (IllegalArgumentException e) {
                // 개별 파일 실패 시 로그만 남기고 나머지 계속 처리
                System.err.println("[FileService] 파일 삭제 실패: fileId="
                        + fileId + " / " + e.getMessage());
            }
        }
    }

    /**
     * 실제 파일을 디스크에서 삭제합니다.
     * 파일이 없거나 삭제 실패 시 에러를 던지지 않고 조용히 처리합니다.
     * (DB 소프트 삭제는 이미 완료된 상태이므로 파일 삭제 실패가 치명적이지 않음)
     */
    private void deletePhysicalFile(String savedFileName) {
        try {
            Path filePath = Paths.get(uploadPath + savedFileName);
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            // 파일 삭제 실패 시 로그만 출력 (트랜잭션 롤백 방지)
            System.err.println("[FileService] 실제 파일 삭제 실패: " + savedFileName + " / " + e.getMessage());
        }
    }

    // =========================================================
    // ✅ 4. 파일 다운로드
    // =========================================================

    /**
     * savedFileName으로 D:\fileDownLoadServer\에서 파일을 읽어 반환합니다.
     *
     * 파일이 존재하지 않는 경우 (직접 삭제되었거나 경로 오류):
     * - 500 에러 대신 명확한 404 의미의 예외를 던집니다.
     * - 프론트에서 이미지 로드 실패 시 기본 이미지로 대체하세요.
     *
     * @param savedFileName UUID가 붙은 저장 파일명
     * @return 파일 Resource
     */
    @Transactional(readOnly = true)
    public Resource download(String savedFileName) {
        Path filePath = Paths.get(uploadPath + savedFileName);
        Resource resource = new FileSystemResource(filePath);

        if (!resource.exists()) {
            // 파일이 없을 때 500이 아닌 명확한 메시지로 예외 처리
            throw new IllegalArgumentException(
                "파일을 찾을 수 없습니다. 이미 삭제되었거나 경로가 올바르지 않습니다: " + savedFileName
            );
        }
        return resource;
    }

    // =========================================================
    // private 저장 메서드들
    // =========================================================

    private Long uploadClassAttachment(
            Long classId, String originalFileName,
            String savedFileName, String fileUrl, Long fileSize
    ) {
        ClassAttachment attachment = ClassAttachment.builder()
                .classBoard(ClassBoard.builder().id(classId).build())
                .originalFileName(originalFileName)
                .savedFileName(savedFileName)
                .fileUrl(fileUrl)
                .fileSize(fileSize)
                .build();
        return classAttachmentRepository.save(attachment).getId();
    }

    private Long uploadMemberAttachment(
            Long memberId, String originalFileName,
            String savedFileName, String fileUrl, Long fileSize
    ) {
        MemberAttachment attachment = MemberAttachment.builder()
                .member(Member.builder().id(memberId).build())
                .originalFileName(originalFileName)
                .savedFileName(savedFileName)
                .fileUrl(fileUrl)
                .fileSize(fileSize)
                .build();
        return memberAttachmentRepository.save(attachment).getId();
    }

    private Long uploadFreelancerAttachment(
            Long freelancerProfileId, String originalFileName,
            String savedFileName, String fileUrl, Long fileSize
    ) {
        FreelancerProfileAttachment attachment = FreelancerProfileAttachment.builder()
                .freelancerProfile(
                    FreelancerProfile.builder().id(freelancerProfileId).build())
                .originalFileName(originalFileName)
                .savedFileName(savedFileName)
                .fileUrl(fileUrl)
                .fileSize(fileSize)
                .build();
        return freelancerAttachmentRepository.save(attachment).getId();
    }
}
