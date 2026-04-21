package com.ilsamcheonri.hobby.controller;

import com.ilsamcheonri.hobby.dto.file.FileUploadResponse;
import com.ilsamcheonri.hobby.enums.FileTargetType;
import com.ilsamcheonri.hobby.service.FileService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;

/**
 * 📁 파일 업로드/수정/삭제/다운로드 공통 Controller
 *
 * ── 단일 파일 API ────────────────────────────────────────────
 * POST   /api/files/upload                파일 단건 등록
 * PUT    /api/files/{fileId}              파일 수정 (기존 삭제 + 새 파일 등록)
 * DELETE /api/files/{fileId}              파일 삭제 (DB 레코드 삭제 + 실제 파일 삭제)
 * GET    /api/files/download/{fileName}   파일 다운로드
 *
 * ── 다중 파일 API ────────────────────────────────────────────
 * POST   /api/files/upload/multiple       파일 다건 등록
 * DELETE /api/files/multiple              파일 다건 삭제
 *
 * ── 파라미터 ────────────────────────────────────────────────
 * targetType : CLASS / MEMBER / FREELANCER
 * targetId   : 각 타입의 고유번호 (class_id, member_id, freelancer_profile_id)
 *
 * ── 다른 Service에서 FileService 사용 방법 ──────────────────
 * private final FileService fileService;
 *
 * // 단일 파일 업로드
 * FileUploadResponse res = fileService.upload(file, FileTargetType.CLASS, classId);
 *
 * // 다중 파일 업로드
 * List<FileUploadResponse> resList = fileService.uploadMultiple(files, FileTargetType.CLASS, classId);
 * ────────────────────────────────────────────────────────────
 */
@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
public class FileController {

    private final FileService fileService;

    // =========================================================
    // ✅ 파일 단건 등록
    // POST /api/files/upload?targetType=CLASS&targetId=1
    // =========================================================
    @PostMapping("/upload")
    public ResponseEntity<FileUploadResponse> upload(
            @RequestParam("file")       MultipartFile  file,
            @RequestParam("targetType") FileTargetType targetType,
            @RequestParam("targetId")   Long           targetId
    ) throws IOException {
        return ResponseEntity.status(201)
                .body(fileService.upload(file, targetType, targetId));
    }

    // =========================================================
    // ✅ 파일 다건 등록
    // POST /api/files/upload/multiple?targetType=CLASS&targetId=1
    //
    // 여러 파일을 한 번에 업로드합니다.
    // 각 파일마다 개별 FileUploadResponse를 반환합니다.
    // =========================================================
    @PostMapping("/upload/multiple")
    public ResponseEntity<List<FileUploadResponse>> uploadMultiple(
            @RequestParam("files")      List<MultipartFile> files,
            @RequestParam("targetType") FileTargetType      targetType,
            @RequestParam("targetId")   Long                targetId
    ) throws IOException {
        return ResponseEntity.status(201)
                .body(fileService.uploadMultiple(files, targetType, targetId));
    }

    // =========================================================
    // ✅ 파일 수정
    // PUT /api/files/{fileId}?targetType=CLASS&targetId=1
    //
    // 기존 파일을 삭제하고 새 파일로 교체합니다.
    // =========================================================
    @PutMapping("/{fileId}")
    public ResponseEntity<FileUploadResponse> update(
            @PathVariable               Long           fileId,
            @RequestParam("file")       MultipartFile  file,
            @RequestParam("targetType") FileTargetType targetType,
            @RequestParam("targetId")   Long           targetId
    ) throws IOException {
        return ResponseEntity.ok(
                fileService.update(fileId, file, targetType, targetId));
    }

    // =========================================================
    // ✅ 파일 단건 삭제
    // DELETE /api/files/{fileId}?targetType=CLASS
    //
     // DB 레코드 삭제 + 실제 파일 삭제를 함께 처리합니다.
    // =========================================================
    @DeleteMapping("/{fileId}")
    public ResponseEntity<Void> delete(
            @PathVariable               Long           fileId,
            @RequestParam("targetType") FileTargetType targetType
    ) {
        fileService.delete(fileId, targetType);
        return ResponseEntity.noContent().build(); // 204
    }

    // =========================================================
    // ✅ 파일 다건 삭제
    // DELETE /api/files/multiple?targetType=CLASS
    // Body: [1, 2, 3]  (삭제할 fileId 목록)
    //
    // 여러 파일을 한 번에 삭제합니다.
    // 일부 파일 삭제 실패 시 나머지는 계속 진행됩니다.
    // =========================================================
    @DeleteMapping("/multiple")
    public ResponseEntity<Void> deleteMultiple(
            @RequestParam("targetType") FileTargetType targetType,
            @RequestBody                List<Long>     fileIds
    ) {
        fileService.deleteMultiple(fileIds, targetType);
        return ResponseEntity.noContent().build(); // 204
    }

    // =========================================================
    // ✅ 파일 다운로드
    // GET /api/files/download/{savedFileName}
    //
    // 파일이 없으면 404 대신 no-image.svg를 200으로 반환합니다.
    //
    // 왜 404 대신 200으로 반환하나요?
    // - 브라우저는 <img> 태그가 404를 받으면 콘솔에 빨간 에러를 자동으로 출력합니다.
    // - JavaScript(onError 핸들러)로는 이 콘솔 에러를 막을 수 없습니다.
    // - 파일이 없을 때 no-image.svg를 200으로 내려주면 브라우저 입장에서 성공이므로
    //   콘솔 에러가 전혀 생기지 않습니다.
    // =========================================================
    @GetMapping("/download/{savedFileName}")
    public ResponseEntity<Resource> download(
            @PathVariable String savedFileName
    ) {
        try {
            Resource resource = fileService.download(savedFileName);

            // 한글 파일명 인코딩 처리
            String encodedFileName = URLEncoder.encode(savedFileName, StandardCharsets.UTF_8)
                    .replace("+", "%20");

            // 파일 확장자로 Content-Type 결정
            MediaType mediaType = resolveMediaType(savedFileName);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "inline; filename=\"" + encodedFileName + "\"")
                    .contentType(mediaType)
                    .body(resource);

        } catch (IllegalArgumentException e) {
            // 파일이 없는 경우 → 404 대신 no-image.svg를 200으로 반환
            // → 브라우저가 성공으로 인식하므로 콘솔에 빨간 에러가 쌓이지 않음
            return noImageResponse();

        } catch (SecurityException e) {
            // 잘못된 경로 접근 시에도 no-image.svg 반환
            return noImageResponse();
        }
    }

    /**
     * 파일이 없을 때 no-image.svg를 200으로 반환합니다.
     * static/no-image.svg 를 classpath에서 읽어서 응답합니다.
     */
    private ResponseEntity<Resource> noImageResponse() {
        try {
            // frontend/public/no-image.svg를 Spring Boot static 리소스로도 서빙하기 위해
            // src/main/resources/static/no-image.svg 에 복사해두면 classpath에서 읽을 수 있습니다.
            Resource noImage = new ClassPathResource("static/no-image.svg");
            if (noImage.exists()) {
                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType("image/svg+xml"))
                        .body(noImage);
            }
        } catch (Exception ignored) { }

        // static/no-image.svg도 없으면 204 No Content (빈 응답) — 콘솔 에러 없음
        return ResponseEntity.noContent().build();
    }

    /**
     * 파일 확장자로 Content-Type을 결정합니다.
     * 브라우저가 이미지를 인라인으로 올바르게 표시하기 위해 필요합니다.
     */
    private MediaType resolveMediaType(String fileName) {
        String lower = fileName.toLowerCase();
        if (lower.endsWith(".png"))  return MediaType.IMAGE_PNG;
        if (lower.endsWith(".gif"))  return MediaType.IMAGE_GIF;
        if (lower.endsWith(".svg"))  return MediaType.parseMediaType("image/svg+xml");
        if (lower.endsWith(".webp")) return MediaType.parseMediaType("image/webp");
        // jpg, jpeg 및 기타 → 기본 image/jpeg
        return MediaType.IMAGE_JPEG;
    }
}
