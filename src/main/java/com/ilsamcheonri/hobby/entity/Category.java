package com.ilsamcheonri.hobby.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "CATEGORY")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 대분류/소분류 구현을 위한 셀프 참조 (최상위 카테고리는 null)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private Category parent;

    @Column(nullable = false, length = 50)
    private String name;

    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder;

    // ERD 반영: BOOLEAN DEFAULT TRUE (화면 노출 여부)
    @Builder.Default
    @Column(name = "is_visible", nullable = false)
    private boolean isVisible = true;

    // ERD 반영: BOOLEAN DEFAULT FALSE
    @Builder.Default
    @Column(name = "is_deleted")
    private boolean isDeleted = false;

    // [비즈니스 로직] 카테고리 정보 수정
    public void updateCategory(String name, Integer sortOrder, boolean isVisible) {
        this.name = name;
        this.sortOrder = sortOrder;
        this.isVisible = isVisible;
    }
}