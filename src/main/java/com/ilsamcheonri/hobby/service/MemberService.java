package com.ilsamcheonri.hobby.service;

import com.ilsamcheonri.hobby.dto.*;
import com.ilsamcheonri.hobby.dto.file.FileUploadResponse;
import com.ilsamcheonri.hobby.entity.Member;
import com.ilsamcheonri.hobby.entity.MemberAttachment;
import com.ilsamcheonri.hobby.entity.RoleCode;
import com.ilsamcheonri.hobby.entity.FreelancerProfile;
import com.ilsamcheonri.hobby.enums.FileTargetType;
import com.ilsamcheonri.hobby.jwt.JwtTokenProvider;
import com.ilsamcheonri.hobby.repository.FreelancerProfileAttachmentRepository;
import com.ilsamcheonri.hobby.repository.FreelancerProfileRepository;
import com.ilsamcheonri.hobby.repository.MemberAttachmentRepository;
import com.ilsamcheonri.hobby.repository.MemberRepository;
import com.ilsamcheonri.hobby.repository.RoleCodeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MemberService {

    private static final String DEFAULT_PROFILE_IMAGE_URL = "/default-profile-image.svg";

    private final JwtTokenProvider jwtTokenProvider;

    private final MemberRepository memberRepository;
    private final MemberAttachmentRepository memberAttachmentRepository;
    private final RoleCodeRepository roleCodeRepository;
    private final FreelancerProfileRepository freelancerProfileRepository;
    private final FreelancerProfileAttachmentRepository freelancerProfileAttachmentRepository;
    private final PasswordEncoder passwordEncoder;
    private final FileService fileService;

    @Transactional
    public Long signUp(MemberSignUpRequestDto dto) {

        if (memberRepository.existsByEmail(dto.getEmail())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "이미 가입된 이메일입니다. 로그인하거나 다른 이메일을 사용해주세요.");
        }

        String encodedPassword = passwordEncoder.encode(dto.getPassword());

        RoleCode role = roleCodeRepository.findByRoleCode("U")
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "기본 권한을 찾을 수 없습니다."));

        Member member = Member.builder()
                .email(dto.getEmail())
                .password(encodedPassword)
                .name(dto.getName())
                .birth(dto.getBirth())
                .phone(normalizePhone(dto.getPhone()))
                .addr(dto.getAddr())
                .addr2(dto.getAddr2())
                .roleCode(role)
                .build();

        return memberRepository.save(member).getId();
    }


    public LoginResponseDto login(LoginRequestDto dto) {
        System.out.println("LOGIN METHOD CALLED");
        Member member = memberRepository.findByEmail(dto.getEmail())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "존재하지 않는 이메일입니다."));
        System.out.println("AFTER FIND MEMBER");
        if (member.isDeleted()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "탈퇴한 계정입니다.");
        }
        if (!passwordEncoder.matches(dto.getPassword(), member.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "비밀번호가 일치하지 않습니다.");
        }
        System.out.println("LOGIN SUCCESS");

        String accessToken = jwtTokenProvider.createAccessToken(member.getEmail());
        String refreshToken = jwtTokenProvider.createRefreshToken(member.getEmail());

        return new LoginResponseDto(accessToken, refreshToken);
    }

    @Transactional
    public LoginResponseDto loginWithSocial(String email, String name) {
        String normalizedEmail = email.trim().toLowerCase(Locale.ROOT);
        String normalizedName = name == null ? "" : name.trim();

        Member member = memberRepository.findByEmail(normalizedEmail)
                .orElseGet(() -> createSocialMember(normalizedEmail, normalizedName));

        if (member.isDeleted()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "탈퇴한 계정입니다.");
        }

        String accessToken = jwtTokenProvider.createAccessToken(member.getEmail());
        String refreshToken = jwtTokenProvider.createRefreshToken(member.getEmail());

        return new LoginResponseDto(accessToken, refreshToken);
    }

    public FindEmailResponseDto findEmail(FindEmailRequestDto dto) {
        Member member = findActiveMemberForIdentity(dto.getName(), null, dto.getPhone(), dto.getBirth(), false);

        return FindEmailResponseDto.builder()
                .email(member.getEmail())
                .build();
    }

    public void verifyResetPasswordIdentity(PasswordResetVerifyRequestDto dto) {
        findActiveMemberForIdentity(dto.getName(), dto.getEmail(), dto.getPhone(), dto.getBirth(), true);
    }

    @Transactional
    public void resetPassword(PasswordResetRequestDto dto) {
        Member member = findActiveMemberForIdentity(dto.getName(), dto.getEmail(), dto.getPhone(), dto.getBirth(), true);

        String nextPassword = dto.getNewPassword().trim();
        if (nextPassword.length() < 8) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "새 비밀번호는 8자 이상이어야 합니다.");
        }

        if (passwordEncoder.matches(nextPassword, member.getPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "현재 비밀번호와 다른 비밀번호를 입력해주세요.");
        }

        member.updatePassword(passwordEncoder.encode(nextPassword));
    }

    // MyPage 첫 화면
    public MemberSummaryDto getMySummary(Long memberId) {
        return memberRepository.findSummaryById(memberId);
    }

    // 계정 설정 화면
    public MemberDetailDto getMyDetail(Long memberId) {
        return memberRepository.findDetailById(memberId);
    }

    public java.util.List<AdminMemberListItemDto> getAdminMembers(String email) {
        validateAdmin(email);

        return memberRepository.findAll().stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .map(member -> AdminMemberListItemDto.builder()
                        .id(member.getId())
                        .email(member.getEmail())
                        .name(member.getName())
                        .birth(member.getBirth() != null ? member.getBirth().toString() : "")
                        .role(toFrontendRole(member.getRoleCode().getRoleCode()))
                        .phone(member.getPhone())
                        .address(formatAddress(member.getAddr(), member.getAddr2()))
                        .joinedAt(member.getCreatedAt() != null ? member.getCreatedAt().toLocalDate().toString() : "")
                        .quitAt(null)
                        .isDeleted(member.isDeleted())
                        .build())
                .toList();
    }

    @Transactional
    public MemberDetailDto updateMyDetail(String email, MemberUpdateRequestDto dto) {
        Member member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "회원 없음"));

        member.updateName(dto.getName().trim());
        member.updatePhone(normalizePhone(dto.getPhone()));
        member.updateAddress(normalizeBlank(dto.getAddr()), normalizeBlank(dto.getAddr2()));

        return memberRepository.findDetailById(member.getId());
    }

    @Transactional
    public void updateMyPassword(String email, MemberPasswordUpdateRequestDto dto) {
        Member member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "회원 없음"));

        String currentPassword = dto.getCurrentPassword().trim();
        if (!passwordEncoder.matches(currentPassword, member.getPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "현재 비밀번호가 일치하지 않습니다.");
        }

        String nextPassword = dto.getNewPassword().trim();
        if (nextPassword.length() < 8) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "새 비밀번호는 8자 이상이어야 합니다.");
        }

        if (nextPassword.equals(currentPassword)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "현재 비밀번호와 다른 비밀번호를 입력해주세요.");
        }

        member.updatePassword(passwordEncoder.encode(nextPassword));
    }

    @Transactional
    public MemberDetailDto updateMyProfileImage(String email, MultipartFile file) throws IOException {
        Member member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "회원 없음"));

        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "업로드할 파일을 선택해주세요.");
        }

        FileUploadResponse uploadResponse = memberAttachmentRepository
                .findFirstByMemberIdAndIsDeletedFalseOrderByCreatedAtAsc(member.getId())
                .map(existing -> updateMemberProfileImage(existing, file, member.getId()))
                .orElseGet(() -> uploadMemberProfileImage(file, member.getId()));

        member.updateImgUrl(uploadResponse.getFileUrl());

        return memberRepository.findDetailById(member.getId());
    }

    @Transactional
    public MemberDetailDto setMyProfileImageToDefault(String email) {
        Member member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "회원 없음"));

        memberAttachmentRepository.findByMemberIdAndIsDeletedFalse(member.getId())
                .forEach(attachment -> fileService.delete(attachment.getId(), FileTargetType.MEMBER));

        member.updateImgUrl(DEFAULT_PROFILE_IMAGE_URL);
        return memberRepository.findDetailById(member.getId());
    }

    @Transactional
    public AdminMemberListItemDto updateMemberRole(String adminEmail, Long memberId, MemberRoleUpdateRequestDto dto) {
        validateAdmin(adminEmail);

        Member admin = memberRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "회원 없음"));
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "회원 없음"));

        if (admin.getId().equals(member.getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "본인의 권한은 변경할 수 없습니다.");
        }

        String currentRoleCode = member.getRoleCode().getRoleCode();
        String roleCode = toRoleCode(dto.getRole());

        validateRoleTransition(member, currentRoleCode, roleCode);

        RoleCode role = roleCodeRepository.findByRoleCode(roleCode)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "유효하지 않은 권한입니다."));

        member.updateRoleCode(role);
        memberRepository.saveAndFlush(member);

        if ("F".equals(currentRoleCode) && "U".equals(roleCode)) {
            deleteFreelancerProfile(member.getId());
        }

        return AdminMemberListItemDto.builder()
                .id(member.getId())
                .email(member.getEmail())
                .name(member.getName())
                .birth(member.getBirth() != null ? member.getBirth().toString() : "")
                .role(toFrontendRole(member.getRoleCode().getRoleCode()))
                .phone(member.getPhone())
                .address(formatAddress(member.getAddr(), member.getAddr2()))
                .joinedAt(member.getCreatedAt() != null ? member.getCreatedAt().toLocalDate().toString() : "")
                .quitAt(null)
                .isDeleted(member.isDeleted())
                .build();
    }

    @Transactional
    public void withdrawMyAccount(String email) {
        Member member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "회원 없음"));

        member.markDeleted();
    }

    @Transactional
    public AdminMemberListItemDto toggleMemberDeleted(String adminEmail, Long memberId) {
        validateAdmin(adminEmail);

        Member admin = memberRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "회원 없음"));
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "회원 없음"));

        if (admin.getId().equals(member.getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "관리자 본인은 탈퇴 처리할 수 없습니다.");
        }

        if (member.isDeleted()) {
            member.restoreDeleted();
        } else {
            member.markDeleted();
        }

        memberRepository.saveAndFlush(member);

        return AdminMemberListItemDto.builder()
                .id(member.getId())
                .email(member.getEmail())
                .name(member.getName())
                .birth(member.getBirth() != null ? member.getBirth().toString() : "")
                .role(toFrontendRole(member.getRoleCode().getRoleCode()))
                .phone(member.getPhone())
                .address(formatAddress(member.getAddr(), member.getAddr2()))
                .joinedAt(member.getCreatedAt() != null ? member.getCreatedAt().toLocalDate().toString() : "")
                .quitAt(member.isDeleted() && member.getUpdatedAt() != null ? member.getUpdatedAt().toLocalDate().toString() : null)
                .isDeleted(member.isDeleted())
                .build();
    }

    private String normalizeBlank(String value) {
        if (value == null) {
            return null;
        }

        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private String normalizePhone(String value) {
        String normalized = normalizeBlank(value);
        if (normalized == null) {
            return null;
        }

        return normalized.replaceAll("\\D", "");
    }

    private Member findActiveMemberForIdentity(String name, String email, String phone, java.time.LocalDate birth, boolean emailRequired) {
        String normalizedName = name == null ? "" : name.trim();
        String normalizedPhone = normalizePhone(phone);

        Member member;
        if (emailRequired) {
            String normalizedEmail = email == null ? "" : email.trim().toLowerCase();
            member = memberRepository.findByEmailAndNameAndPhoneAndBirth(
                            normalizedEmail,
                            normalizedName,
                            normalizedPhone,
                            birth
                    )
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "일치하는 회원 정보를 찾을 수 없습니다."));
        } else {
            member = memberRepository.findByNameAndPhoneAndBirth(
                            normalizedName,
                            normalizedPhone,
                            birth
                    )
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "일치하는 회원 정보를 찾을 수 없습니다."));
        }

        if (member.isDeleted()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "탈퇴한 계정입니다.");
        }

        return member;
    }

    private FileUploadResponse uploadMemberProfileImage(MultipartFile file, Long memberId) {
        try {
            return fileService.upload(file, FileTargetType.MEMBER, memberId);
        } catch (IOException ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "프로필 이미지 업로드 중 오류가 발생했습니다.");
        }
    }

    private FileUploadResponse updateMemberProfileImage(MemberAttachment existing, MultipartFile file, Long memberId) {
        try {
            return fileService.update(existing.getId(), file, FileTargetType.MEMBER, memberId);
        } catch (IOException ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "프로필 이미지 업로드 중 오류가 발생했습니다.");
        }
    }

    private void validateRoleTransition(Member member, String currentRoleCode, String nextRoleCode) {
        if (currentRoleCode.equals(nextRoleCode)) {
            return;
        }

        if ("F".equals(currentRoleCode) && "A".equals(nextRoleCode)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "프리랜서를 관리자로 변경할 수 없습니다.");
        }

        if ("A".equals(currentRoleCode) && "F".equals(nextRoleCode)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "관리자를 프리랜서로 변경할 수 없습니다.");
        }

        if ("U".equals(currentRoleCode) && "F".equals(nextRoleCode)) {
            FreelancerProfile profile = freelancerProfileRepository.findByFreelancerIdAndIsDeletedFalse(member.getId())
                    .orElse(null);

            if (profile == null || !"A".equals(profile.getApprovalStatusCode())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "프리랜서 프로필이 승인된 회원만 프리랜서 권한으로 변경할 수 있습니다.");
            }
        }
    }

    private void deleteFreelancerProfile(Long memberId) {
        FreelancerProfile profile = freelancerProfileRepository.findByFreelancerIdAndIsDeletedFalse(memberId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "삭제할 프리랜서 프로필이 없습니다."));

        freelancerProfileAttachmentRepository.deleteByFreelancerProfileId(profile.getId());
        freelancerProfileRepository.delete(profile);
    }

    private void validateAdmin(String email) {
        Member member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "회원 없음"));

        if (!"A".equals(member.getRoleCode().getRoleCode())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "관리자만 접근할 수 있습니다.");
        }
    }

    private String toRoleCode(String role) {
        return switch (role) {
            case "ROLE_ADMIN", "ADMIN", "A" -> "A";
            case "ROLE_FREELANCER", "FREELANCER", "F" -> "F";
            case "ROLE_USER", "USER", "U" -> "U";
            default -> throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "유효하지 않은 권한입니다.");
        };
    }

    private String toFrontendRole(String roleCode) {
        return switch (roleCode) {
            case "A" -> "ROLE_ADMIN";
            case "F" -> "ROLE_FREELANCER";
            default -> "ROLE_USER";
        };
    }

    private String formatAddress(String addr, String addr2) {
        if (addr == null || addr.isBlank()) {
            return addr2 == null ? "" : addr2;
        }
        if (addr2 == null || addr2.isBlank()) {
            return addr;
        }
        return addr + " " + addr2;
    }

    private Member createSocialMember(String email, String name) {
        RoleCode role = roleCodeRepository.findByRoleCode("U")
                .orElseThrow(() -> new IllegalStateException("기본 권한을 찾을 수 없습니다."));

        String resolvedName = name == null || name.isBlank() ? email.split("@")[0] : name;

        Member member = Member.builder()
                .email(email)
                .password(passwordEncoder.encode(UUID.randomUUID().toString()))
                .name(resolvedName)
                .roleCode(role)
                .build();

        return memberRepository.save(member);
    }

}
