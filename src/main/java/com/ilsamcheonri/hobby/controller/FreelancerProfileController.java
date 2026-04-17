package com.ilsamcheonri.hobby.controller;

import com.ilsamcheonri.hobby.dto.freelancerprofile.FreelancerApprovalListItemResponse;
import com.ilsamcheonri.hobby.dto.freelancerprofile.FreelancerApplicationStatusResponse;
import com.ilsamcheonri.hobby.dto.freelancerprofile.FreelancerProfileApplyRequest;
import com.ilsamcheonri.hobby.dto.freelancerprofile.FreelancerProfileMeResponse;
import com.ilsamcheonri.hobby.dto.freelancerprofile.FreelancerProfileUpsertRequest;
import com.ilsamcheonri.hobby.service.FreelancerProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/freelancer-profile")
@RequiredArgsConstructor
public class FreelancerProfileController {

    private final FreelancerProfileService freelancerProfileService;

    @PostMapping("/apply")
    public ResponseEntity<Long> applyFreelancerProfile(
            @AuthenticationPrincipal String email,
            @Valid @RequestBody FreelancerProfileApplyRequest request
    ) {
        return ResponseEntity.status(201).body(freelancerProfileService.applyFreelancerProfile(email, request));
    }

    @GetMapping("/application-status")
    public ResponseEntity<FreelancerApplicationStatusResponse> getMyApplicationStatus(
            @AuthenticationPrincipal String email
    ) {
        return ResponseEntity.ok(freelancerProfileService.getMyApplicationStatus(email));
    }

    @GetMapping("/me")
    public ResponseEntity<FreelancerProfileMeResponse> getMyFreelancerProfile(
            @AuthenticationPrincipal String email
    ) {
        return ResponseEntity.ok(freelancerProfileService.getMyProfile(email));
    }

    @PutMapping("/me")
    public ResponseEntity<FreelancerProfileMeResponse> upsertMyFreelancerProfile(
            @AuthenticationPrincipal String email,
            @Valid @RequestBody FreelancerProfileUpsertRequest request
    ) {
        return ResponseEntity.ok(freelancerProfileService.updateMyProfile(email, request));
    }

    @GetMapping("/admin/pending")
    public ResponseEntity<List<FreelancerApprovalListItemResponse>> getPendingProfiles(
            @AuthenticationPrincipal String email
    ) {
        return ResponseEntity.ok(freelancerProfileService.getPendingProfiles(email));
    }

    @PatchMapping("/admin/{profileId}/approve")
    public ResponseEntity<Void> approveFreelancerProfile(
            @AuthenticationPrincipal String email,
            @PathVariable Long profileId
    ) {
        freelancerProfileService.approveProfile(email, profileId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/admin/{profileId}/reject")
    public ResponseEntity<Void> rejectFreelancerProfile(
            @AuthenticationPrincipal String email,
            @PathVariable Long profileId
    ) {
        freelancerProfileService.rejectProfile(email, profileId);
        return ResponseEntity.noContent().build();
    }
}
