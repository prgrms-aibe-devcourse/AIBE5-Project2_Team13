package com.ilsamcheonri.hobby.dto.chat;

import jakarta.validation.constraints.AssertTrue;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChatDirectRoomRequestDto {
    // 일반 1:1 문의는 대상 회원 PK로 방을 엽니다.
    private Long targetMemberId;

    // footer에서는 실제 관리자 이메일을 몰라도 되도록 "관리자 문의" 여부만 boolean으로 전달합니다.
    // footer 1:1 문의는 "관리자 문의" 의도만 보내고, 실제 관리자 이메일은 백엔드가 고정합니다.
    private boolean adminInquiry;

    // 일반 대상 회원 id가 있거나, 관리자 문의 플래그가 true여야만 채팅방 생성/재사용 API를 허용합니다.
    // 일반 문의(targetMemberId) 또는 관리자 문의(adminInquiry) 중 하나는 반드시 필요합니다.
    @AssertTrue(message = "채팅 대상 정보가 필요합니다.")
    public boolean isTargetProvided() {
        return targetMemberId != null || adminInquiry;
    }
}
