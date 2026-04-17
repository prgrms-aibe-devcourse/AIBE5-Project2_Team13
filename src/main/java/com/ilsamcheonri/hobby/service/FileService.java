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
import org.springframework.util.StringUtils;
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
 */
@Service
@RequiredArgsConstructor
@Transactional(rollbackFor = Exception.class)
public class FileService {

    private final ClassAttachmentRepository             classAttachmentRepository;
    private final MemberAttachmentRepository            memberAttachmentRepository;
    private final FreelancerProfileAttachmentRepository freelancerAttachmentRepository;

    // ✅ [수정 - 문제 1, 3] 프록시 대신 실제 존재 여부 확인을 위한 Repository 추가
    private final ClassBoardRepository        classBoardRepository;
    private final MemberRepository            memberRepository;
    private final FreelancerProfileRepository freelancerProfileRepository;

    @Value("${file.upload.path:D:\\fileDownLoadServer\\}")
    private String uploadPath;

    // =========================================================
    // ✅ 1. 파일 단건 업로드
    // =========================================================

    private static final String DOWNLOAD_URL_PREFIX = "/api/files/download/";

    /**
      * 파일을 D:\fileDownLoadServer\에 저장하고 해당 첨부파일 테이블에 기록합니다.
     *
     * [수정 - 문제 1, 3]
     * 기존: ClassBoard.builder().id(classId).build() 방식 (프록시 — 존재 확인 없음)
     * 변경: Repository.findById()로 실제 존재 여부 확인 후 연결
     *       존재하지 않는 ID 전달 시 IllegalArgumentException 발생
     */
    public FileUploadResponse upload(
            MultipartFile file,
            FileTargetType targetType,
            Long targetId
    ) throws IOException {

        // 1. 경로 조작 방지를 위한 파일명 정제
        String originalFileName = StringUtils.cleanPath(file.getOriginalFilename());
        if (originalFileName.contains("..")) {
            throw new SecurityException("잘못된 파일명입니다.");
        }

        // 2. 확장자 추출 및 안전한 랜덤 파일명 생성
        String extension = "";
        int dotIndex = originalFileName.lastIndexOf('.');
        if (dotIndex > 0) {
            extension = originalFileName.substring(dotIndex);
        }
        String savedFileName = UUID.randomUUID().toString() + extension;
        String fileUrl = DOWNLOAD_URL_PREFIX + savedFileName;
        long fileSize = file.getSize();

        // 3. DB 존재 검증 및 정보 저장을 먼저 수행 (예외 발생 시 여기서 중단, 파일 저장소 누수 방지)
        Long savedId = switch (targetType) {
            case CLASS      -> uploadClassAttachment(targetId, originalFileName, savedFileName, fileUrl, fileSize);
            case MEMBER     -> uploadMemberAttachment(targetId, originalFileName, savedFileName, fileUrl, fileSize);
            case FREELANCER -> uploadFreelancerAttachment(targetId, originalFileName, savedFileName, fileUrl, fileSize);
        };

        // 4. DB 저장이 성공한 경우에만 실제 물리적 파일 저장
        Path savePath = Paths.get(uploadPath).resolve(savedFileName).normalize();
        Files.createDirectories(savePath.getParent());
        file.transferTo(savePath.toFile());

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
     * 일부 실패 시 해당 파일은 건너뛰고 나머지를 계속 처리합니다.
     */
    public List<FileUploadResponse> uploadMultiple(
            List<MultipartFile> files,
            FileTargetType targetType,
            Long targetId
    ) throws IOException {
        List<FileUploadResponse> results = new ArrayList<>();

        for (MultipartFile file : files) {
            if (file.isEmpty()) continue;
            try {
                results.add(upload(file, targetType, targetId));
            } catch (Exception e) {
                System.err.println("[FileService] 파일 업로드 실패: "
                        + file.getOriginalFilename() + " / " + e.getMessage());
            }
        }
        return results;
    }

    // =========================================================
    // ✅ 3. 파일 수정
    // =========================================================

    /**
     * 기존 파일을 새 파일로 교체합니다.
     *
     * [수정 - 문제 2]
     * 기존: 기존 파일 먼저 삭제 → 새 파일 업로드 실패 시 둘 다 없어지는 문제
     * 변경: 새 파일 먼저 업로드 성공 → 그 후 기존 파일 삭제
     *       새 파일 업로드 실패 시 기존 파일은 그대로 유지됩니다.
     */
    public FileUploadResponse update(
            Long fileId,
            MultipartFile file,
            FileTargetType targetType,
            Long targetId
    ) throws IOException {

        // 1. 새 파일 먼저 업로드 (실패 시 기존 파일 보존됨)
        FileUploadResponse newFile = upload(file, targetType, targetId);

        // 2. 업로드 성공 후 기존 파일 삭제
        try {
            delete(fileId, targetType);
        } catch (Exception e) {
            // 기존 파일 삭제 실패해도 새 파일은 이미 저장됨 → 로그만 남김
            System.err.println("[FileService] 기존 파일 삭제 실패 (새 파일은 저장됨): "
                    + fileId + " / " + e.getMessage());
        }
        return newFile;
    }

    // =========================================================
     // ✅ 4. 파일 단건 삭제 (DB 레코드 삭제 + 실제 파일 삭제)
    // =========================================================

    /**
     * DB 레코드 삭제 + D:\fileDownLoadServer\에서 실제 파일 삭제를 함께 처리합니다.
     */
    public void delete(Long fileId, FileTargetType targetType) {

        String savedFileName = switch (targetType) {
            case CLASS -> {
                ClassAttachment a = classAttachmentRepository
                        .findById(fileId)
                        .orElseThrow(() -> new IllegalArgumentException("파일을 찾을 수 없습니다. fileId: " + fileId));
                classAttachmentRepository.delete(a);
                yield a.getSavedFileName();
            }
            case MEMBER -> {
                MemberAttachment a = memberAttachmentRepository
                        .findById(fileId)
                        .orElseThrow(() -> new IllegalArgumentException("파일을 찾을 수 없습니다. fileId: " + fileId));
                memberAttachmentRepository.delete(a);
                yield a.getSavedFileName();
            }
            case FREELANCER -> {
                FreelancerProfileAttachment a = freelancerAttachmentRepository
                        .findById(fileId)
                        .orElseThrow(() -> new IllegalArgumentException("파일을 찾을 수 없습니다. fileId: " + fileId));
                freelancerAttachmentRepository.delete(a);
                yield a.getSavedFileName();
            }
        };

        deletePhysicalFile(savedFileName);
    }

    /** 하위 호환성 유지 — softDelete() 호출 시 delete()로 위임 */
    public void softDelete(Long fileId, FileTargetType targetType) {
        delete(fileId, targetType);
    }

    // =========================================================
    // ✅ 5. 다중 파일 삭제
    // =========================================================

    /**
     * 여러 파일을 한 번에 삭제합니다.
     * 일부 실패 시 해당 파일은 건너뛰고 나머지를 계속 처리합니다.
     */
    public void deleteMultiple(List<Long> fileIds, FileTargetType targetType) {
        for (Long fileId : fileIds) {
            try {
                delete(fileId, targetType);
            } catch (IllegalArgumentException e) {
                System.err.println("[FileService] 파일 삭제 실패: fileId="
                        + fileId + " / " + e.getMessage());
            }
        }
    }

    // =========================================================
    // ✅ 6. 파일 다운로드
    // =========================================================

    /**
     * savedFileName으로 D:\fileDownLoadServer\에서 파일을 읽어 반환합니다.
     * 파일이 없으면 500 대신 명확한 예외를 던집니다. → Controller에서 404 처리
     */
    @Transactional(readOnly = true)
    public Resource download(String savedFileName) {
        String cleanFileName = StringUtils.cleanPath(savedFileName);

        if (cleanFileName.contains("..")) {
            throw new SecurityException("잘못된 파일 경로입니다.");
        }

        Path filePath = Paths.get(uploadPath).resolve(cleanFileName).normalize();
        Resource resource = new FileSystemResource(filePath);

        if (!resource.exists()) {
            throw new IllegalArgumentException(
                "파일을 찾을 수 없습니다. 이미 삭제되었거나 경로가 올바르지 않습니다: " + cleanFileName
            );
        }
        return resource;
    }

    // =========================================================
    // private 저장 메서드들
    // =========================================================

    /** [수정 - 문제 1] findById()로 존재 확인 후 연결 */
    private Long uploadClassAttachment(
            Long classId, String originalFileName,
            String savedFileName, String fileUrl, Long fileSize
    ) {
        ClassBoard classBoard = classBoardRepository.findById(classId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "존재하지 않는 클래스입니다. classId: " + classId));

        return classAttachmentRepository.save(
                ClassAttachment.builder()
                        .classBoard(classBoard)
                        .originalFileName(originalFileName)
                        .savedFileName(savedFileName)
                        .fileUrl(fileUrl)
                        .fileSize(fileSize)
                        .build()
        ).getId();
    }

    /** [수정 - 문제 1, 3] findById()로 존재 확인 후 연결 (null 필드 INSERT 에러 방지) */
    private Long uploadMemberAttachment(
            Long memberId, String originalFileName,
            String savedFileName, String fileUrl, Long fileSize
    ) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "존재하지 않는 회원입니다. memberId: " + memberId));

        return memberAttachmentRepository.save(
                MemberAttachment.builder()
                        .member(member)
                        .originalFileName(originalFileName)
                        .savedFileName(savedFileName)
                        .fileUrl(fileUrl)
                        .fileSize(fileSize)
                        .build()
        ).getId();
    }

    /** [수정 - 문제 1, 3] findById()로 존재 확인 후 연결 (null 필드 INSERT 에러 방지) */
    private Long uploadFreelancerAttachment(
            Long freelancerProfileId, String originalFileName,
            String savedFileName, String fileUrl, Long fileSize
    ) {
        FreelancerProfile profile = freelancerProfileRepository.findById(freelancerProfileId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "존재하지 않는 프리랜서 프로필입니다. freelancerProfileId: " + freelancerProfileId));

        return freelancerAttachmentRepository.save(
                FreelancerProfileAttachment.builder()
                        .freelancerProfile(profile)
                        .originalFileName(originalFileName)
                        .savedFileName(savedFileName)
                        .fileUrl(fileUrl)
                        .fileSize(fileSize)
                        .build()
        ).getId();
    }

    /** 실제 파일을 디스크에서 삭제합니다. 실패 시 트랜잭션 롤백 방지를 위해 예외를 던지지 않습니다. */
    private void deletePhysicalFile(String savedFileName) {
        try {
            Path filePath = Paths.get(uploadPath + savedFileName);
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            System.err.println("[FileService] 실제 파일 삭제 실패: "
                    + savedFileName + " / " + e.getMessage());
        }
    }
}
