package com.ilsamcheonri.hobby.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class MemberInfoDto {
    private Long id;
    private String email;
    private String name;
    private String imgUrl;
    private String role;
}
