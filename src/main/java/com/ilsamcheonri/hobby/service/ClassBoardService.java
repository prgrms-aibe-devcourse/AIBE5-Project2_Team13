package com.ilsamcheonri.hobby.service;

import com.ilsamcheonri.hobby.dto.classboard.ClassAttachmentResponse;
import com.ilsamcheonri.hobby.dto.classboard.ClassBoardCreateRequest;
import com.ilsamcheonri.hobby.dto.classboard.ClassBoardResponse;
import com.ilsamcheonri.hobby.dto.classboard.ClassDetailResponse;
import com.ilsamcheonri.hobby.dto.file.FileUploadResponse;
import com.ilsamcheonri.hobby.dto.review.ClassReviewStats;
import com.ilsamcheonri.hobby.entity.*;
import com.ilsamcheonri.hobby.enums.FileTargetType;
import com.ilsamcheonri.hobby.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ClassBoardService {

    private final ClassBoardRepository classBoardRepository;
    private final MemberRepository memberRepository;
    private final CategoryRepository categoryRepository;
    private final ClassAttachmentRepository classAttachmentRepository;
    private final FileService fileService;
    private final NotificationService notificationService;
    private final ReviewRepository reviewRepository;

    // 제안된 클래스 목록을 최신순으로 조회합니다.
    public List<ClassBoardResponse> getOfferClassList() {
        List<ClassBoard> classBoards = classBoardRepository.findByBoardTypeAndIsDeletedFalseOrderByCreatedAtDesc("OFFER");
        Map<Long, ClassReviewStats> reviewStatsByClassId = getReviewStatsByClassId(
                classBoards.stream().map(ClassBoard::getId).toList()
        );

        return classBoards.stream()
                .map(classBoard -> { //첨부파일 이미지 표시
                    List<ClassAttachmentResponse> attachments = classAttachmentRepository
                            .findAllByClassBoardIdAndIsDeletedFalse(classBoard.getId())
                            .stream()
                            .map(ClassAttachmentResponse::from)
                            .collect(Collectors.toList());
                    ClassReviewStats stats = reviewStatsByClassId.get(classBoard.getId());
                    return ClassBoardResponse.from(
                            classBoard,
                            attachments,
                            getRoundedAverageRating(stats),
                            getReviewCount(stats)
                    );
                })
                .collect(Collectors.toList());
    }

    // 특정 ID의 클래스 정보를 조회합니다.
    public ClassBoardResponse getOfferClass(Long id) {
        ClassBoard classBoard = classBoardRepository
                .findByIdAndBoardTypeAndIsDeletedFalse(id, "OFFER")
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 클래스입니다."));

        ClassReviewStats stats = getReviewStatsByClassId(List.of(id)).get(id);
        return ClassBoardResponse.from(classBoard, List.of(), getRoundedAverageRating(stats), getReviewCount(stats));
    }

    // 클래스 정보와 연결된 첨부 이미지 리스트를 함께 조회합니다.
    public ClassDetailResponse getDetails(Long id) {
        ClassBoard classBoard = classBoardRepository
                .findByIdAndBoardTypeAndIsDeletedFalse(id, "OFFER")
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 클래스입니다. id: " + id));

        List<ClassAttachmentResponse> images = classAttachmentRepository
                .findByClassBoardIdAndIsDeletedFalse(id)
                .stream()
                .map(ClassAttachmentResponse::from)
                .collect(Collectors.toList());

        ClassReviewStats stats = getReviewStatsByClassId(List.of(id)).get(id);
        return ClassDetailResponse.from(classBoard, images, getRoundedAverageRating(stats), getReviewCount(stats));
    }

    // 새로운 클래스를 등록하고, 파일 업로드 및 대표 이미지를 설정합니다.
    @Transactional
    public Long createOfferClass(String email, ClassBoardCreateRequest request) {
        Member member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 카테고리입니다."));

        if (request.getEndAt() != null && request.getStartAt() != null &&
                request.getEndAt().isBefore(request.getStartAt())) {
            throw new IllegalArgumentException("종료 일시는 시작 일시보다 이후여야 합니다.");
        }

        ClassBoard offerClass = ClassBoard.builder()
                .freelancer(member)
                .category(category)
                .title(request.getTitle())
                .description(request.getDescription())
                .price(request.getPrice())
                .isOnline(request.getIsOnline())
                .startAt(request.getStartAt())
                .endAt(request.getEndAt())
                .maxCapacity(request.getMaxCapacity())
                .boardType("OFFER")
                .status("OPEN")
                .curriculum(request.getCurriculum())
                .location(request.getLocation())
                .build();

        Long classId = classBoardRepository.save(offerClass).getId();

        if (request.getImages() != null && !request.getImages().isEmpty()) {
            try {
                List<FileUploadResponse> uploadedFiles = fileService.uploadMultiple(
                        request.getImages(),
                        FileTargetType.CLASS,
                        classId
                );

                if (!uploadedFiles.isEmpty()) {
                    updateRepresentativeImage(classId, uploadedFiles.get(0).getFileId());
                }
            } catch (IOException e) {
                throw new RuntimeException("클래스 이미지 업로드에 실패했습니다.", e);
            }
        }

        // ✅ 팔로워 전체에게 알림 발송 — 이 프리랜서를 팔로우하는 일반 사용자에게 알림
        notificationService.sendToFollowers(member.getId(), classId, request.getTitle());

        return classId;
    }

    // 기존 클래스 정보를 수정하고, 연결된 이미지 파일을 교체합니다.
    @Transactional
    public Long updateOfferClass(String email, Long id, ClassBoardCreateRequest request) {
        Member member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));

        ClassBoard classBoard = classBoardRepository
                .findByIdAndBoardTypeAndIsDeletedFalse(id, "OFFER")
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 클래스입니다."));

        if (!classBoard.getFreelancer().getId().equals(member.getId())) {
            throw new IllegalArgumentException("수정 권한이 없습니다.");
        }

        if (request.getEndAt() != null && request.getStartAt() != null &&
                request.getEndAt().isBefore(request.getStartAt())) {
            throw new IllegalArgumentException("종료 일시는 시작 일시보다 이후여야 합니다.");
        }

        classBoard.updateOfferClass(
                categoryRepository.findById(request.getCategoryId())
                        .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 카테고리입니다.")),
                request.getTitle(),
                request.getDescription(),
                request.getPrice(),
                request.getIsOnline(),
                request.getStartAt(),
                request.getEndAt(),
                request.getMaxCapacity(),
                request.getCurriculum(),
                request.getLocation()
        );

        if (request.getDeletedImageIds() != null && !request.getDeletedImageIds().isEmpty()) {
            fileService.deleteMultiple(request.getDeletedImageIds(), FileTargetType.CLASS);
        }

        if (request.getImages() != null && !request.getImages().isEmpty()) {
            try {
                fileService.uploadMultiple(
                        request.getImages(),
                        FileTargetType.CLASS,
                        classBoard.getId()
                );
            } catch (IOException e) {
                throw new RuntimeException("클래스 이미지 업로드에 실패했습니다.", e);
            }
        }

        //한 게시글 id에 첨부되어있는 사진 모두 불러오기
        List<ClassAttachment> remainingAttachments = classAttachmentRepository
                .findByClassBoardIdAndIsDeletedFalseOrderByIdAsc(classBoard.getId());
        if (!remainingAttachments.isEmpty()) {
            updateRepresentativeImage(classBoard.getId(), remainingAttachments.get(0).getId());
        }

        return classBoard.getId();
    }

    // 클래스를 삭제(소프트 삭제)하고 관련된 첨부파일도 함께 처리합니다.
    @Transactional
    public void deleteOfferClass(String email, Long id) {
        Member member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));

        ClassBoard classBoard = classBoardRepository
                .findByIdAndBoardTypeAndIsDeletedFalse(id, "OFFER")
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 클래스입니다."));

        if (!classBoard.getFreelancer().getId().equals(member.getId())) {
            throw new IllegalArgumentException("삭제 권한이 없습니다.");
        }

        classBoard.softDelete();

        List<ClassAttachment> attachments = classAttachmentRepository.findByClassBoardIdAndIsDeletedFalse(id);
        for (ClassAttachment attachment : attachments) {
            attachment.softDelete();
        }
    }

    // 클래스의 모집 상태를 OPEN <-> CLOSE로 전환합니다.
    @Transactional
    public String toggleStatus(String email, Long id) {
        Member member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));
        ClassBoard classBoard = classBoardRepository
                .findByIdAndBoardTypeAndIsDeletedFalse(id, "OFFER")
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 클래스입니다."));

        if (!classBoard.getFreelancer().getId().equals(member.getId())) {
            throw new IllegalArgumentException("상태 변경 권한이 없습니다.");
        }

        String nextStatus = "OPEN".equals(classBoard.getStatus()) ? "CLOSE" : "OPEN";
        classBoard.updateStatus(nextStatus);
        return nextStatus;
    }

    // 특정 파일을 클래스의 대표 이미지로 지정합니다.
    @Transactional
    public void updateRepresentativeImage(Long classId, Long newRepresentativeId) {
        if (!classBoardRepository.existsById(classId)) {
            throw new IllegalArgumentException("존재하지 않는 클래스입니다. classId: " + classId);
        }
        classAttachmentRepository.resetRepresentativeByClassId(classId);
        classAttachmentRepository.updateRepresentativeById(newRepresentativeId);
    }

    private Map<Long, ClassReviewStats> getReviewStatsByClassId(List<Long> classIds) {
        if (classIds.isEmpty()) {
            return Map.of();
        }

        return reviewRepository.findReviewStatsByClassIds(classIds)
                .stream()
                .collect(Collectors.toMap(ClassReviewStats::getClassId, Function.identity()));
    }

    private Double getRoundedAverageRating(ClassReviewStats stats) {
        if (stats == null || stats.getAverageRating() == null) {
            return 0.0;
        }

        return Math.round(stats.getAverageRating() * 10.0) / 10.0;
    }

    private Long getReviewCount(ClassReviewStats stats) {
        return stats == null || stats.getReviewCount() == null ? 0L : stats.getReviewCount();
    }
}
