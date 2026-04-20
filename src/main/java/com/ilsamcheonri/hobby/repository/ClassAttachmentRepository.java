package com.ilsamcheonri.hobby.repository;

import com.ilsamcheonri.hobby.entity.ClassAttachment;
import com.ilsamcheonri.hobby.entity.ClassBoard;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ClassAttachmentRepository extends JpaRepository<ClassAttachment, Long> {

    // 부모인 ClassBoard를 가져올 때, 연관된 attachments를 한 번에 싹 다 가져옵니다.
    //이미지 불러오는 속도 향상 위해 넣음
    @Query("SELECT DISTINCT cb FROM ClassBoard cb " +
            "LEFT JOIN FETCH cb.attachments a " +
            "WHERE cb.isDeleted = false")
    List<ClassBoard> findAllWithAttachments();

    /** 클래스에 속한 전체 첨부파일 목록 (삭제되지 않은 것만) */
    List<ClassAttachment> findByClassBoardIdAndIsDeletedFalse(Long classId);
    List<ClassAttachment> findAllByClassBoardIdAndIsDeletedFalse(Long classId);

    /** 파일 ID로 단건 조회 (삭제되지 않은 것만) */
    Optional<ClassAttachment> findByIdAndIsDeletedFalse(Long id);

    /** 특정 클래스의 모든 대표 이미지 설정을 해제 (0으로 초기화) */
    @Modifying(clearAutomatically = true)
    @Query("UPDATE ClassAttachment ca SET ca.isRepresentative = false WHERE ca.classBoard.id = :classId")
    void resetRepresentativeByClassId(@Param("classId") Long classId);

    /** 선택한 파일만 대표 이미지로 설정 (1로 변경) */
    @Modifying(clearAutomatically = true)
    @Query("UPDATE ClassAttachment ca SET ca.isRepresentative = true WHERE ca.id = :id")
     void updateRepresentativeById(@Param("id") Long id);

    List<ClassAttachment> findByClassBoardIdAndIsDeletedFalseOrderByIdAsc(Long classId);

    //쿼리메소드
    long countByClassBoardIdAndIsDeletedFalse(Long classId);
}
