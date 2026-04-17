package com.ilsamcheonri.hobby.repository;

import com.ilsamcheonri.hobby.entity.FreelancerProfileAttachment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FreelancerProfileAttachmentRepository extends JpaRepository<FreelancerProfileAttachment, Long> {

    /** FileService에서 사용 — 기본 목록 조회 */
    List<FreelancerProfileAttachment> findByFreelancerProfileIdAndIsDeletedFalse(Long profileId);

    /** FreelancerProfileService에서 사용 — ID 오름차순 정렬 */
    List<FreelancerProfileAttachment> findByFreelancerProfileIdAndIsDeletedFalseOrderByIdAsc(Long profileId);

    Optional<FreelancerProfileAttachment> findByIdAndIsDeletedFalse(Long id);

    void deleteByFreelancerProfileId(Long profileId);
}
