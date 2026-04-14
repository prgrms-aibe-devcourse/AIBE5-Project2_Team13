package com.ilsamcheonri.hobby.repository;

import com.ilsamcheonri.hobby.entity.ClassBoard;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ClassBoardRepository extends JpaRepository<ClassBoard, Long> {

    // 예를 들어 온라인 클래스만 따로 조회하고 싶을 때 활용할 수 있습니다.
    List<ClassBoard> findByIsOnlineTrue();

    // 특정 카테고리의 오프라인 클래스만 조회할 때
    List<ClassBoard> findByCategoryIdAndIsOnlineFalse(Long categoryId);
}