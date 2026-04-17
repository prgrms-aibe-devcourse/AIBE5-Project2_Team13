package com.ilsamcheonri.hobby.repository;

import com.ilsamcheonri.hobby.entity.ClassAttachment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ClassAttachmentRepository extends JpaRepository<ClassAttachment, Long> {

    /** 클래스에 속한 전체 첨부파일 목록 (삭제되지 않은 것만) */
    List<ClassAttachment> findByClassBoardIdAndIsDeletedFalse(Long classId);

    /** 파일 ID로 단건 조회 (삭제되지 않은 것만) */
    Optional<ClassAttachment> findByIdAndIsDeletedFalse(Long id);
}
