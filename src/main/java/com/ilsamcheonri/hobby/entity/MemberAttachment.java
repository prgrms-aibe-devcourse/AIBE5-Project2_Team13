package com.ilsamcheonri.hobby.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "MEMBER_ATTACHMENT")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class MemberAttachment {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

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

    public void softDelete() {
        this.isDeleted = true;
    }

    public void update(String originalFileName, String savedFileName, String fileUrl, Long fileSize) {
        this.originalFileName = originalFileName;
        this.savedFileName    = savedFileName;
        this.fileUrl          = fileUrl;
        this.fileSize         = fileSize;
    }
}