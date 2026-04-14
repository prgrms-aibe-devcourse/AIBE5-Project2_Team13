package com.ilsamcheonri.hobby.repository;

import com.ilsamcheonri.hobby.entity.WishList;
import org.springframework.data.jpa.repository.JpaRepository;

// 8. 찜하기 (WishListRepository.java)
public interface WishListRepository extends JpaRepository<WishList, Long> {
}