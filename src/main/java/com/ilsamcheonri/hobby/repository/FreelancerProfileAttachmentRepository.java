package com.ilsamcheonri.hobby.repository;

import com.ilsamcheonri.hobby.entity.FreelancerProfileAttachment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FreelancerProfileAttachmentRepository extends JpaRepository<FreelancerProfileAttachment, Long> {
    List<FreelancerProfileAttachment> findByFreelancerProfileIdAndIsDeletedFalseOrderByIdAsc(Long profileId);
    void deleteByFreelancerProfileId(Long profileId);
}
