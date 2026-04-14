package com.ilsamcheonri.hobby.repository;

import com.ilsamcheonri.hobby.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;

// 3. 카테고리 (CategoryRepository.java)
public interface CategoryRepository extends JpaRepository<Category, Long> {
}