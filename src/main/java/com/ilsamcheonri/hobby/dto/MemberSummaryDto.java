package com.ilsamcheonri.hobby.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MemberSummaryDto {
    private String name;
    private String role;

    public MemberSummaryDto(String name, String role) {
        this.name = name;
        this.role = role;
    }
}
