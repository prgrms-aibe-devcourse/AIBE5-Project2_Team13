package com.ilsamcheonri.hobby.service;

import com.ilsamcheonri.hobby.dto.MemberSignUpRequestDto;
import com.ilsamcheonri.hobby.entity.Member;
import com.ilsamcheonri.hobby.entity.RoleCode;
import com.ilsamcheonri.hobby.repository.MemberRepository;
import com.ilsamcheonri.hobby.repository.RoleCodeRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest // 스프링 서버를 띄워서 진짜 환경과 똑같이 테스트합니다.
@Transactional // 테스트가 끝나면 DB에 넣었던 데이터를 깔끔하게 롤백(삭제)해 줍니다.
@TestPropertySource(locations = "classpath:application-test.properties") // H2 설정 파일 적용
class MemberServiceTest {

    // 진짜 객체들을 주입받습니다!
    @Autowired private MemberService memberService;
    @Autowired private MemberRepository memberRepository;
    @Autowired private RoleCodeRepository roleCodeRepository;

    // [치명적 문제 해결] 빈 H2 DB에 회원가입 필수 데이터인 '권한'을 먼저 만들어주는 헬퍼 메서드
    public void saveBasicRole() {
        RoleCode roleCode = RoleCode.builder()
                .roleCode("U")
                .roleName("일반 사용자")
                .build();
        roleCodeRepository.save(roleCode);
    }

    @Test
    @DisplayName("회원가입 통합 테스트: 실제 H2 DB에 회원이 정상적으로 Insert 되어야 한다.")
    public void signUp_Success() {
        // 1. 사전 데이터 세팅 (권한 생성)
        saveBasicRole();

        // 2. 가입 요청 데이터 (DTO) 생성
        MemberSignUpRequestDto requestDto = MemberSignUpRequestDto.builder()
                .email("real_test@ilsamcheonri.com")
                .password("password123")
                .passwordConfirm("password123")
                .name("일삼천리")
                .birth(LocalDate.of(1995, 5, 5))
                .phone("010-1234-5678")
                .addr("서울특별시 강남구")
                .build();

        // 3. 실제 서비스 로직 실행 (H2 DB에 INSERT 쿼리가 날아갑니다!)
        Long savedMemberId = memberService.signUp(requestDto);

        // 4. 검증: 저장된 ID로 실제 DB에서 회원을 다시 꺼내와서 이메일이 일치하는지 확인
        Member savedMember = memberRepository.findById(savedMemberId).orElseThrow();
        assertThat(savedMember.getEmail()).isEqualTo("real_test@ilsamcheonri.com");
    }

    @Test
    @DisplayName("이메일 중복 테스트: 같은 이메일로 가입하면 예외가 터져야 한다.")
    public void signUp_Fail_DuplicateEmail() {
        saveBasicRole(); // 권한 세팅

        // 첫 번째 회원 데이터
        MemberSignUpRequestDto requestDto1 = MemberSignUpRequestDto.builder()
                .email("duplicate@test.com")
                .password("1234").passwordConfirm("1234")
                .name("회원1").birth(LocalDate.now()).phone("010").addr("주소")
                .build();

        // 실제 DB에 첫 번째 회원 저장
        memberService.signUp(requestDto1);

        // 두 번째 회원 (동일한 이메일 사용)
        MemberSignUpRequestDto requestDto2 = MemberSignUpRequestDto.builder()
                .email("duplicate@test.com") // 중복!
                .password("5678").passwordConfirm("5678")
                .name("회원2").birth(LocalDate.now()).phone("010").addr("주소")
                .build();

        // 중복 회원을 저장하려 할 때 IllegalStateException이 발생하는지 확인
        assertThatThrownBy(() -> memberService.signUp(requestDto2))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("이미 가입된 이메일입니다.");
    }
}