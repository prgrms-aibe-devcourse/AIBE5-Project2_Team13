package com.ilsamcheonri.hobby.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "CLASS_ATTACHMENT")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class ClassAttachment {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "class_id", nullable = false)
    private ClassBoard classBoard;

    @Column(name = "original_file_name", nullable = false)
    private String originalFileName;

    @Column(name = "saved_file_name", nullable = false)
    private String savedFileName;

    @Column(name = "file_url", nullable = false, length = 500)
    private String fileUrl;

    @Column(name = "file_size")
    private Long fileSize;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Builder.Default
    @Column(name = "is_deleted")
    private boolean isDeleted = false;

    // 대표이미지
    @Column(name = "is_representative")
    private boolean isRepresentative;

    public void softDelete() {
        this.isDeleted = true;
    }

    /** 파일 정보 수정 (기존 파일 삭제 후 새 파일로 교체 시 사용) */
    public void update(String originalFileName, String savedFileName, String fileUrl, Long fileSize) {
        this.originalFileName = originalFileName;
        this.savedFileName    = savedFileName;
        this.fileUrl          = fileUrl;
        this.fileSize         = fileSize;
    }
}