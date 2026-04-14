package com.ilsamcheonri.hobby.repository;

import com.ilsamcheonri.hobby.entity.ClassAttachment;
import org.springframework.data.jpa.repository.JpaRepository;

// 6. 클래스 첨부파일 (ClassAttachmentRepository.java)
public interface ClassAttachmentRepository extends JpaRepository<ClassAttachment, Long> {
}