package com.ilsamcheonri.hobby.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MemberDetailDto {
    private String imgUrl;
    private String name;
    private String email;
    private String phone;
    private String addr;
    private String addr2;

    public MemberDetailDto(String imgUrl, String name, String email, String phone, String addr, String addr2) {
        this.imgUrl = imgUrl;
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.addr = addr;
        this.addr2 = addr2;
    }

}
