package com.ilsamcheonri.hobby.repository;

import com.ilsamcheonri.hobby.entity.Report;
import org.springframework.data.jpa.repository.JpaRepository;

// 10. 신고 (ReportRepository.java)
public interface ReportRepository extends JpaRepository<Report, Long> {
}