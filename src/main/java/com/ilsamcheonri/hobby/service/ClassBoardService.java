package com.ilsamcheonri.hobby.service;

import com.ilsamcheonri.hobby.dto.classboard.ClassAttachmentResponse;
import com.ilsamcheonri.hobby.dto.classboard.ClassBoardCreateRequest;
import com.ilsamcheonri.hobby.dto.classboard.ClassBoardResponse;
import com.ilsamcheonri.hobby.dto.classboard.ClassDetailResponse;
import com.ilsamcheonri.hobby.dto.file.FileUploadResponse;
import com.ilsamcheonri.hobby.entity.*;
import com.ilsamcheonri.hobby.enums.FileTargetType;
import com.ilsamcheonri.hobby.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ClassBoardService {

    private final ClassBoardRepository classBoardRepository;
    private final MemberRepository memberRepository;
    private final CategoryRepository categoryRepository;
    private final ClassAttachmentRepository classAttachmentRepository;
    private final FileService fileService; // 중복 선언 하나만 남겼어요!

    // 제안된 클래스 목록을 최신순으로 조회합니다.
    public List<ClassBoardResponse> getOfferClassList() {
        return classBoardRepository.findByBoardTypeAndIsDeletedFalseOrderByCreatedAtDesc("OFFER")
                .stream()
                .map(classBoard -> { //첨부파일 이미지 표시
                    List<ClassAttachmentResponse> attachments = classAttachmentRepository
                            .findAllByClassBoardIdAndIsDeletedFalse(classBoard.getId())
                            .stream()
                            .map(ClassAttachmentResponse::from)
                            .collect(Collectors.toList());
                    return ClassBoardResponse.from(classBoard, attachments);
                })
                .collect(Collectors.toList());
    }

    // 특정 ID의 클래스 정보를 조회합니다.
    public ClassBoardResponse getOfferClass(Long id) {
        ClassBoard classBoard = classBoardRepository
                .findByIdAndBoardTypeAndIsDeletedFalse(id, "OFFER")
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 클래스입니다."));

        return ClassBoardResponse.from(classBoard);
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

        return ClassDetailResponse.from(classBoard, images);
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
}