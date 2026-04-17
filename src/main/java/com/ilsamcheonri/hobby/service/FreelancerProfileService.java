package com.ilsamcheonri.hobby.service;

import com.ilsamcheonri.hobby.dto.freelancerprofile.FreelancerProfileAttachmentDto;
import com.ilsamcheonri.hobby.dto.freelancerprofile.FreelancerProfileApplyRequest;
import com.ilsamcheonri.hobby.dto.freelancerprofile.FreelancerApprovalListItemResponse;
import com.ilsamcheonri.hobby.dto.freelancerprofile.FreelancerApplicationStatusResponse;
import com.ilsamcheonri.hobby.dto.freelancerprofile.FreelancerProfileMeResponse;
import com.ilsamcheonri.hobby.dto.freelancerprofile.FreelancerProfileUpsertRequest;
import com.ilsamcheonri.hobby.entity.Category;
import com.ilsamcheonri.hobby.entity.FreelancerProfile;
import com.ilsamcheonri.hobby.entity.Member;
import com.ilsamcheonri.hobby.repository.CategoryRepository;
import com.ilsamcheonri.hobby.repository.FreelancerProfileAttachmentRepository;
import com.ilsamcheonri.hobby.repository.FreelancerProfileRepository;
import com.ilsamcheonri.hobby.repository.MemberRepository;
import com.ilsamcheonri.hobby.repository.RoleCodeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FreelancerProfileService {

    private final FreelancerProfileRepository freelancerProfileRepository;
    private final FreelancerProfileAttachmentRepository freelancerProfileAttachmentRepository;
    private final MemberRepository memberRepository;
    private final CategoryRepository categoryRepository;
    private final RoleCodeRepository roleCodeRepository;

    @Transactional
    public Long applyFreelancerProfile(String email, FreelancerProfileApplyRequest request) {
        Member member = getUserMember(email);
        FreelancerProfile existingProfile = freelancerProfileRepository
                .findByFreelancerIdAndIsDeletedFalse(member.getId())
                .orElse(null);

        if (existingProfile != null && !"R".equals(existingProfile.getApprovalStatusCode())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "이미 프리랜서 프로필이 존재합니다.");
        }

        Category specialty = categoryRepository.findById(request.getSpecialtyCategoryId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "존재하지 않는 카테고리입니다."));

        member.updateName(request.getMemberName().trim());

        FreelancerProfile profile;
        if (existingProfile != null) {
            existingProfile.resubmitProfile(
                    specialty,
                    request.getSnsLink().trim(),
                    normalizeBlank(request.getBio()),
                    normalizeBlank(request.getCareer()),
                    normalizeBlank(request.getBankAccount())
            );
            profile = existingProfile;
        } else {
            profile = freelancerProfileRepository.save(
                    FreelancerProfile.builder()
                            .freelancer(member)
                            .specialty(specialty)
                            .snsLink(request.getSnsLink().trim())
                            .bio(normalizeBlank(request.getBio()))
                            .career(normalizeBlank(request.getCareer()))
                            .bankAccount(normalizeBlank(request.getBankAccount()))
                            .approvalStatusCode("W")
                            .approvalStatusName("승인 대기")
                            .build()
            );
        }

        return profile.getId();
    }

    public FreelancerApplicationStatusResponse getMyApplicationStatus(String email) {
        Member member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "존재하지 않는 회원입니다."));

        FreelancerProfile profile = freelancerProfileRepository
                .findByFreelancerIdAndIsDeletedFalse(member.getId())
                .orElse(null);

        return FreelancerApplicationStatusResponse.builder()
                .hasProfile(profile != null)
                .approvalStatusCode(profile != null ? profile.getApprovalStatusCode() : null)
                .approvalStatusName(profile != null ? profile.getApprovalStatusName() : null)
                .build();
    }

    public FreelancerProfileMeResponse getMyProfile(String email) {
        Member member = getFreelancerMember(email);

        FreelancerProfile profile = freelancerProfileRepository
                .findByFreelancerIdAndIsDeletedFalse(member.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "프리랜서 프로필이 없습니다."));

        List<FreelancerProfileAttachmentDto> attachments = freelancerProfileAttachmentRepository
                .findByFreelancerProfileIdAndIsDeletedFalseOrderByIdAsc(profile.getId())
                .stream()
                .map(FreelancerProfileAttachmentDto::from)
                .toList();

        return FreelancerProfileMeResponse.builder()
                .profileId(profile.getId())
                .memberName(member.getName())
                .memberEmail(member.getEmail())
                .memberPhone(member.getPhone())
                .memberAddress(formatAddress(member.getAddr(), member.getAddr2()))
                .specialtyCategoryId(profile.getSpecialty().getId())
                .specialtyCategoryName(profile.getSpecialty().getName())
                .snsLink(profile.getSnsLink())
                .bio(profile.getBio())
                .career(profile.getCareer())
                .bankAccount(profile.getBankAccount())
                .approvalStatusCode(profile.getApprovalStatusCode())
                .approvalStatusName(profile.getApprovalStatusName())
                .attachments(attachments)
                .build();
    }

    @Transactional
    public FreelancerProfileMeResponse updateMyProfile(String email, FreelancerProfileUpsertRequest request) {
        Member member = getFreelancerMember(email);
        Category specialty = categoryRepository.findById(request.getSpecialtyCategoryId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "존재하지 않는 카테고리입니다."));

        member.updateName(request.getMemberName().trim());

        FreelancerProfile profile = freelancerProfileRepository
                .findByFreelancerIdAndIsDeletedFalse(member.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "프리랜서 프로필이 없습니다."));

        profile.updateProfile(
                specialty,
                request.getSnsLink().trim(),
                normalizeBlank(request.getBio()),
                normalizeBlank(request.getCareer()),
                normalizeBlank(request.getBankAccount())
        );

        return getMyProfile(email);
    }

    public List<FreelancerApprovalListItemResponse> getPendingProfiles(String email) {
        validateAdmin(email);

        return freelancerProfileRepository.findByApprovalStatusCodeAndIsDeletedFalseOrderByCreatedAtAsc("W")
                .stream()
                .map(profile -> FreelancerApprovalListItemResponse.builder()
                        .profileId(profile.getId())
                        .memberName(profile.getFreelancer().getName())
                        .memberEmail(profile.getFreelancer().getEmail())
                        .specialtyCategoryName(profile.getSpecialty().getName())
                        .career(profile.getCareer())
                        .snsLink(profile.getSnsLink())
                        .approvalStatusCode(profile.getApprovalStatusCode())
                        .approvalStatusName(profile.getApprovalStatusName())
                        .appliedAt(profile.getCreatedAt())
                        .build())
                .toList();
    }

    @Transactional
    public void approveProfile(String email, Long profileId) {
        validateAdmin(email);

        FreelancerProfile profile = freelancerProfileRepository.findById(profileId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "프리랜서 프로필이 없습니다."));

        Member member = profile.getFreelancer();
        profile.approveProfile("승인 완료");

        member.updateRoleCode(
                roleCodeRepository.findByRoleCode("F")
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "프리랜서 권한 코드가 없습니다."))
        );
    }

    @Transactional
    public void rejectProfile(String email, Long profileId) {
        validateAdmin(email);

        FreelancerProfile profile = freelancerProfileRepository.findById(profileId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "프리랜서 프로필이 없습니다."));

        profile.rejectProfile("반려");
    }

    private Member getUserMember(String email) {
        Member member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "존재하지 않는 회원입니다."));

        if (!"U".equals(member.getRoleCode().getRoleCode())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "일반 회원만 프리랜서 등록을 신청할 수 있습니다.");
        }

        return member;
    }

    private Member getFreelancerMember(String email) {
        Member member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "존재하지 않는 회원입니다."));

        if (!"F".equals(member.getRoleCode().getRoleCode())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "프리랜서 회원만 접근할 수 있습니다.");
        }

        return member;
    }

    private void validateAdmin(String email) {
        Member member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "존재하지 않는 회원입니다."));

        if (!"A".equals(member.getRoleCode().getRoleCode())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "관리자만 접근할 수 있습니다.");
        }
    }

    private String formatAddress(String addr, String addr2) {
        if (addr == null && addr2 == null) {
            return "";
        }
        if (addr == null) {
            return addr2;
        }
        if (addr2 == null || addr2.isBlank()) {
            return addr;
        }
        return addr + " " + addr2;
    }

    private String normalizeBlank(String value) {
        if (value == null) {
            return null;
        }

        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
