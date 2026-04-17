package com.ilsamcheonri.hobby.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AdminMemberListItemDto {
    private Long id;
    private String email;
    private String name;
    private String birth;
    private String role;
    private String phone;
    private String address;
    private String joinedAt;
    private String quitAt;
    private boolean isDeleted;
}
