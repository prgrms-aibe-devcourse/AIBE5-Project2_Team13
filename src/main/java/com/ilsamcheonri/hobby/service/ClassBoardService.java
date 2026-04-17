package com.ilsamcheonri.hobby.service;

import com.ilsamcheonri.hobby.dto.classboard.ClassBoardResponse;
import com.ilsamcheonri.hobby.repository.ClassBoardRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ClassBoardService {

    private final ClassBoardRepository classBoardRepository;

    public List<ClassBoardResponse> getOfferClassList() {
        return classBoardRepository.findByBoardTypeAndIsDeletedFalse("OFFER")
                .stream()
                .map(ClassBoardResponse::from)
                .collect(Collectors.toList());
    }
}
