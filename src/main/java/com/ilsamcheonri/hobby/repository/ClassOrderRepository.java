package com.ilsamcheonri.hobby.repository;

import com.ilsamcheonri.hobby.entity.ClassOrder;
import org.springframework.data.jpa.repository.JpaRepository;

// 7. 클래스 주문/결제 (ClassOrderRepository.java)
public interface ClassOrderRepository extends JpaRepository<ClassOrder, Long> {
}