package com.ilsamcheonri.hobby.repository;

import com.ilsamcheonri.hobby.entity.MemberAttachment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MemberAttachmentRepository extends JpaRepository<MemberAttachment, Long> {

    List<MemberAttachment> findByMemberIdAndIsDeletedFalse(Long memberId);

    Optional<MemberAttachment> findByIdAndIsDeletedFalse(Long id);
}
