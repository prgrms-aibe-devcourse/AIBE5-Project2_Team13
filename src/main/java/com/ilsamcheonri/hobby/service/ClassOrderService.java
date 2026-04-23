package com.ilsamcheonri.hobby.service;

import com.ilsamcheonri.hobby.dto.classorder.ClassOrderRequest;
import com.ilsamcheonri.hobby.dto.classorder.ClassOrderSummaryResponse;
import com.ilsamcheonri.hobby.dto.classorder.FreelancerDashboardResponse;
import com.ilsamcheonri.hobby.entity.ClassBoard;
import com.ilsamcheonri.hobby.entity.ClassOrder;
import com.ilsamcheonri.hobby.entity.Member;
import com.ilsamcheonri.hobby.entity.Review;
import com.ilsamcheonri.hobby.repository.ClassBoardRepository;
import com.ilsamcheonri.hobby.repository.ClassOrderRepository;
import com.ilsamcheonri.hobby.repository.MemberRepository;
import com.ilsamcheonri.hobby.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ClassOrderService {

    private final ClassOrderRepository classOrderRepository;
    private final ClassBoardRepository classBoardRepository;
    private final MemberRepository memberRepository;
    private final ReviewRepository reviewRepository;
    private final NotificationService notificationService; // ✅ 알림 공통 모듈

    // [기능: 수강 신청 생성 처리] [이유: 신청 생성 시 class_order와 class_board의 진행 상태를 모두 BEFORE_START로 맞추기 위해]
    @Transactional
    public Long applyClass(String studentEmail, ClassOrderRequest request) {
        Member student = memberRepository.findByEmail(studentEmail)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));

        ClassBoard classBoard = classBoardRepository.findByIdForUpdate(request.getClassBoardId())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 클래스입니다."));

        List<ClassOrder.ApprovalStatus> activeStatuses = List.of(
                ClassOrder.ApprovalStatus.PENDING,
                ClassOrder.ApprovalStatus.APPROVED
        );

        if (classOrderRepository.existsByStudentIdAndClassBoardIdAndApprovalStatusIn(
                student.getId(), classBoard.getId(), activeStatuses)) {
            throw new IllegalStateException("이미 진행 중인 수강 신청 내역이 있습니다.");
        }

        if ("CLOSE".equalsIgnoreCase(classBoard.getStatus())) {
            throw new IllegalStateException("이미 모집이 마감된 클래스입니다.");
        }

        int currentVolume = classBoard.getCurrentVolume() == null ? 0 : classBoard.getCurrentVolume();
        int maxCapacity = classBoard.getMaxCapacity() == null ? 0 : classBoard.getMaxCapacity();
        if (currentVolume >= maxCapacity) {
            classBoard.updateStatus("CLOSE");
            throw new IllegalStateException("정원이 마감된 클래스입니다.");
        }

        ClassOrder classOrder = ClassOrder.builder()
                .student(student)
                .classBoard(classBoard)
                .amount(classBoard.getPrice())
                .approvalStatus(ClassOrder.ApprovalStatus.PENDING)
                .progressStatus(ClassOrder.ProgressStatus.BEFORE_START)
                .build();

        ClassOrder saved = classOrderRepository.save(classOrder);
        classBoard.updateProgressStatus(ClassBoard.ProgressStatus.BEFORE_START);
        classBoard.increaseVolume();

        if (classBoard.getCurrentVolume() >= classBoard.getMaxCapacity()) {
            classBoard.updateStatus("CLOSE");
        }

        // ✅ 프리랜서에게 알림 — 새 수강 신청이 들어왔을 때
        notificationService.send(
                classBoard.getFreelancer().getId(), // 수신: 프리랜서
                student.getId(),                    // 발신: 신청한 학생
                "NEW_ORDER",
                "'" + classBoard.getTitle() + "' 클래스에 새 수강 신청이 들어왔습니다.",
                "/profile/freelancer/students"  // 프리랜서 마이페이지 수강생 관리 탭
        );

        return saved.getId();
    }

    // [기능: 학생 본인 수강 신청 내역 조회] [이유: 마이페이지 수강 관리 탭에 로그인한 학생의 신청 이력을 보여주기 위해]
    @Transactional(readOnly = true)
    public List<ClassOrderSummaryResponse> getMyClassOrders(String studentEmail) {
        Member student = memberRepository.findByEmail(studentEmail)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));

        return classOrderRepository.findByStudentIdAndIsDeletedFalseOrderByCreatedAtDesc(student.getId())
                .stream()
                .map(ClassOrderSummaryResponse::from)
                .toList();
    }

    // [기능: 프리랜서 본인 클래스 신청 내역 조회] [이유: 마이페이지 수강생 관리 탭에서 본인 클래스 신청 이력을 보여주기 위해]
    @Transactional(readOnly = true)
    public List<ClassOrderSummaryResponse> getFreelancerClassOrders(String freelancerEmail) {
        Member freelancer = memberRepository.findByEmail(freelancerEmail)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));

        return classOrderRepository.findByClassBoardFreelancerIdAndApprovalStatusNotAndIsDeletedFalseOrderByCreatedAtDesc(
                        freelancer.getId(),
                        ClassOrder.ApprovalStatus.CANCELLED
                )
                .stream()
                .map(ClassOrderSummaryResponse::from)
                .toList();
    }

    // [기능 설명: 학생의 이메일을 기반으로 회원을 조회하고, 해당 학생의 '수업 완료' 상태인 모든 주문 내역을 생성일 내림차순으로 조회하여 DTO 리스트로 변환합니다.] [작성 이유: 사용자가 마이페이지에서 수강 완료한 클래스 목록을 확인하고 리뷰를 작성할 수 있도록 데이터를 제공하기 위해 작성함]
    @Transactional(readOnly = true)
    public List<ClassOrderSummaryResponse> getMyCompletedClassOrders(String studentEmail) {
        Member student = memberRepository.findByEmail(studentEmail)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));

        return classOrderRepository.findByStudentIdAndProgressStatusAndIsDeletedFalseOrderByCreatedAtDesc(
                        student.getId(),
                        ClassOrder.ProgressStatus.COMPLETED
                )
                .stream()
                .map(ClassOrderSummaryResponse::from)
                .toList();
    }

    // [기능 설명: 관리자 권한을 검증한 후 삭제되지 않은 모든 클래스 주문 내역을 조회하여 DTO 리스트로 변환합니다.] [작성 이유: 관리자 페이지에서 전체 주문 현황을 모니터링하고 관리할 수 있도록 기능을 제공하기 위해 작성함]
    @Transactional(readOnly = true)
    public List<ClassOrderSummaryResponse> getAdminClassOrders(String adminEmail) {
        validateAdmin(adminEmail);

        return classOrderRepository.findByIsDeletedFalseOrderByCreatedAtDesc()
                .stream()
                .map(ClassOrderSummaryResponse::from)
                .toList();
    }

    // [기능: 프리랜서 수강 신청 승인 처리] [이유: 수강생 관리 탭의 승인 버튼으로 approval_status와 progress_status를 함께 갱신하기 위해]
    @Transactional
    public void approveClassOrder(String freelancerEmail, Long orderId) {
        ClassOrder classOrder = classOrderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 수강 신청 내역입니다."));

        validateFreelancerOwnership(freelancerEmail, classOrder);
        classOrder.updateStatus(ClassOrder.ApprovalStatus.APPROVED, ClassOrder.ProgressStatus.IN_PROGRESS);

        // ✅ 학생에게 알림 — 수강 신청이 승인되었을 때
        // 2026.04.22 최준열 생성
        notificationService.send(
                classOrder.getStudent().getId(),               // 수신: 신청한 학생
                classOrder.getClassBoard().getFreelancer().getId(), // 발신: 프리랜서
                "ORDER_APPROVED",
                "'" + classOrder.getClassBoard().getTitle() + "' 클래스 수강 신청이 승인되었습니다.",
                "/profile/activity"  // 학생 마이페이지 수강 관리 탭
        );
    }

    // [기능 설명: 수강 신청을 거절하고 관련 클래스의 수강 인원을 차감하며, 정원에 여유가 생기면 모집 상태를 'OPEN'으로 자동 변경합니다.] [작성 이유: 클래스 주문 반려 절차를 수행하고 정원 관리 로직을 통합하여 모집 현황을 정확하게 유지하기 위해 작성함]
    @Transactional
    public void rejectClassOrder(String freelancerEmail, Long orderId) {
        ClassOrder classOrder = classOrderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 수강 신청 내역입니다."));

        validateFreelancerOwnership(freelancerEmail, classOrder);
        classOrder.updateStatus(ClassOrder.ApprovalStatus.REJECTED, ClassOrder.ProgressStatus.REJECTED);

        ClassBoard classBoard = classOrder.getClassBoard();
        classBoard.decreaseVolume();

        if ("CLOSE".equalsIgnoreCase(classBoard.getStatus()) &&
                classBoard.getCurrentVolume() < classBoard.getMaxCapacity()) {
            classBoard.updateStatus("OPEN");
        }

        // ✅ 학생에게 알림 — 수강 신청이 거절되었을 때
        // 2026.04.22 최준열 생성
        notificationService.send(
                classOrder.getStudent().getId(),           // 수신: 신청한 학생
                classBoard.getFreelancer().getId(),        // 발신: 프리랜서
                "ORDER_REJECTED",
                "'" + classBoard.getTitle() + "' 클래스 수강 신청이 거절되었습니다.",
                "/profile/activity"  // 학생 마이페이지 수강 관리 탭
        );
    }

    // [기능: 수강 완료 처리]
    @Transactional
    public void completeClassOrder(String freelancerEmail, Long orderId) {
        ClassOrder classOrder = classOrderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 수강 신청 내역입니다."));

        validateFreelancerOwnership(freelancerEmail, classOrder);

        if (classOrder.getApprovalStatus() != ClassOrder.ApprovalStatus.APPROVED) {
            throw new IllegalStateException("승인된 수강 신청만 완료 처리할 수 있습니다.");
        }

        if (classOrder.getProgressStatus() == ClassOrder.ProgressStatus.COMPLETED) {
            throw new IllegalStateException("이미 완료 처리된 수강 신청입니다.");
        }

        classOrder.updateStatus(ClassOrder.ApprovalStatus.APPROVED, ClassOrder.ProgressStatus.COMPLETED);

        // 학생에게 알림 — 수강이 완료되었을 때
        // 2026.04.23 최준열 생성
        notificationService.send(
                classOrder.getStudent().getId(),                   // 수신: 학생
                classOrder.getClassBoard().getFreelancer().getId(), // 발신: 프리랜서
                "CLASS_COMPLETED",
                "'" + classOrder.getClassBoard().getTitle() + "' 클래스 수강이 완료되었습니다. 리뷰를 남겨보세요!",
                "/profile/activity"  // 학생 마이페이지 수강 관리 탭
        );
    }

    // [기능 설명: 수강생을 클래스에서 제외 처리하고, 수강 인원을 차감한 후 정원 여유가 생기면 모집 상태를 'OPEN'으로 변경합니다.]
    @Transactional
    public void excludeClassOrder(String freelancerEmail, Long orderId) {
        ClassOrder classOrder = classOrderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 수강 신청 내역입니다."));

        validateFreelancerOwnership(freelancerEmail, classOrder);

        if (classOrder.getApprovalStatus() != ClassOrder.ApprovalStatus.APPROVED) {
            throw new IllegalStateException("승인된 수강 신청만 수강 제외할 수 있습니다.");
        }

        classOrder.updateStatus(ClassOrder.ApprovalStatus.CANCELLED, ClassOrder.ProgressStatus.CANCELLED);

        ClassBoard classBoard = classOrder.getClassBoard();
        classBoard.decreaseVolume();

        if ("CLOSE".equalsIgnoreCase(classBoard.getStatus()) &&
                classBoard.getCurrentVolume() < classBoard.getMaxCapacity()) {
            classBoard.updateStatus("OPEN");
        }

        // ✅ 학생에게 알림 — 수강에서 제외되었을 때
        // 2026.04.23 최준열 생성
        notificationService.send(
                classOrder.getStudent().getId(),           // 수신: 학생
                classBoard.getFreelancer().getId(),        // 발신: 프리랜서
                "CLASS_CANCELLED",
                "'" + classBoard.getTitle() + "' 클래스 수강에서 제외되었습니다.",
                "/profile/activity"  // 학생 마이페이지 수강 관리 탭
        );
    }

    @Transactional
    public void cancelClassOrder(String studentEmail, Long orderId) {
        ClassOrder classOrder = classOrderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 수강 신청 내역입니다."));

        if (!classOrder.getStudent().getEmail().equals(studentEmail)) {
            throw new IllegalStateException("본인 수강 신청만 취소할 수 있습니다.");
        }

        if (classOrder.getApprovalStatus() == ClassOrder.ApprovalStatus.CANCELLED) {
            throw new IllegalStateException("이미 취소된 수강 신청입니다.");
        }

        classOrder.updateStatus(ClassOrder.ApprovalStatus.CANCELLED, ClassOrder.ProgressStatus.CANCELLED);

        ClassBoard classBoard = classOrder.getClassBoard();
        classBoard.decreaseVolume();

        if ("CLOSE".equalsIgnoreCase(classBoard.getStatus()) &&
            classBoard.getCurrentVolume() < classBoard.getMaxCapacity()) {
            classBoard.updateStatus("OPEN");
        }
    }

    /**
     * @author 김한비
     * @since 2026.04.23
     *
     * 프리랜서 대시보드 정보를 조회합니다.
     * - 승인된 신청 내역과 리뷰를 기반으로 매출, 수강생 수, 평점 통계 계산
     * - 조회 기간이 없으면 최근 6개월 기준으로 조회
     * - 시작일이 종료일보다 늦으면 예외 발생
     *
     * @param freelancerEmail 프리랜서 이메일
     * @param start 조회 시작일
     * @param end 조회 종료일
     * @return 프리랜서 대시보드 응답 DTO
     */
    @Transactional(readOnly = true)
    public FreelancerDashboardResponse getFreelancerDashboard(String freelancerEmail, LocalDate start, LocalDate end) {
        Member freelancer = memberRepository.findByEmail(freelancerEmail)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));

        LocalDate safeStart = start != null ? start : LocalDate.now().minusMonths(5).withDayOfMonth(1);
        LocalDate safeEnd = end != null ? end : LocalDate.now();
        if (safeStart.isAfter(safeEnd)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "조회 시작일은 종료일보다 늦을 수 없습니다.");
        }

        List<ClassOrder> paidOrders = classOrderRepository
                .findByClassBoardFreelancerIdAndApprovalStatusInAndIsDeletedFalseOrderByCreatedAtAsc(
                        freelancer.getId(),
                        List.of(ClassOrder.ApprovalStatus.APPROVED)
                );
        List<Review> reviews = reviewRepository.findFreelancerReviews(freelancer.getId());

        YearMonth currentMonth = YearMonth.from(LocalDate.now());
        YearMonth previousMonth = currentMonth.minusMonths(1);

        int currentMonthRevenue = sumRevenueForMonth(paidOrders, currentMonth);
        int previousMonthRevenue = sumRevenueForMonth(paidOrders, previousMonth);

        double averageRating = reviews.stream()
                .map(Review::getRating)
                .filter(rating -> rating != null)
                .mapToInt(Integer::intValue)
                .average()
                .orElse(0.0d);

        return FreelancerDashboardResponse.builder()
                .expectedRevenueThisMonth(currentMonthRevenue)
                .revenueChangeRate(calculateRevenueChangeRate(currentMonthRevenue, previousMonthRevenue))
                .totalStudents(paidOrders.size())
                .studentsAddedThisMonth(countOrdersForMonth(paidOrders, currentMonth))
                .averageRating(averageRating)
                .reviewCount(reviews.size())
                .totalRevenue(paidOrders.stream()
                        .map(ClassOrder::getAmount)
                        .filter(amount -> amount != null)
                        .mapToInt(Integer::intValue)
                        .sum())
                .trend(buildTrend(paidOrders, safeStart, safeEnd))
                .build();
    }

    /**
     * @author 김한비
     * @since 2026.04.23
     *
     * 특정 월의 총 매출을 계산합니다.
     * - 해당 월에 생성된 주문만 필터링
     * - 금액(amount)이 존재하는 주문만 합산
     *
     * @param orders 주문 목록
     * @param yearMonth 기준 연월
     * @return 해당 월 총 매출
     */
    private int sumRevenueForMonth(List<ClassOrder> orders, YearMonth yearMonth) {
        return orders.stream()
                .filter(order -> order.getCreatedAt() != null)
                .filter(order -> YearMonth.from(order.getCreatedAt()).equals(yearMonth))
                .map(ClassOrder::getAmount)
                .filter(amount -> amount != null)
                .mapToInt(Integer::intValue)
                .sum();
    }

    /**
     * @author 김한비
     * @since 2026.04.23
     *
     * 특정 월의 주문 수를 계산합니다.
     * - 해당 월에 생성된 주문만 카운트
     *
     * @param orders 주문 목록
     * @param yearMonth 기준 연월
     * @return 해당 월 주문 수
     */
    private int countOrdersForMonth(List<ClassOrder> orders, YearMonth yearMonth) {
        return (int) orders.stream()
                .filter(order -> order.getCreatedAt() != null)
                .filter(order -> YearMonth.from(order.getCreatedAt()).equals(yearMonth))
                .count();
    }

    /**
     * @author 김한비
     * @since 2026.04.23
     *
     * 전월 대비 매출 증감률을 계산합니다.
     * - 이전 달 매출이 0 이하일 경우 예외 처리 (현재 매출 > 0이면 100%)
     * - 계산 결과는 반올림하여 정수로 반환
     *
     * @param currentMonthRevenue 현재 월 매출
     * @param previousMonthRevenue 이전 월 매출
     * @return 매출 증감률 (%)
     */
    private int calculateRevenueChangeRate(int currentMonthRevenue, int previousMonthRevenue) {
        if (previousMonthRevenue <= 0) {
            return currentMonthRevenue > 0 ? 100 : 0;
        }

        double changeRate = ((double) (currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100;
        return (int) Math.round(changeRate);
    }

    /**
     * @author 김한비
     * @since 2026.04.23
     *
     * 조회 기간 내 월별 매출 및 수강생 추이 데이터를 생성합니다.
     * - 시작월부터 종료월까지 월 단위 통계 구조를 미리 생성
     * - 주문 데이터를 월별로 집계하여 매출과 신청 수를 계산
     *
     * @param orders 주문 목록
     * @param start 조회 시작일
     * @param end 조회 종료일
     * @return 월별 추이 데이터 목록
     */
    private List<FreelancerDashboardResponse.TrendItem> buildTrend(
            List<ClassOrder> orders,
            LocalDate start,
            LocalDate end
    ) {
        Map<YearMonth, int[]> monthlyStats = new LinkedHashMap<>();
        YearMonth startMonth = YearMonth.from(start);
        YearMonth endMonth = YearMonth.from(end);

        YearMonth cursor = startMonth;
        while (!cursor.isAfter(endMonth)) {
            monthlyStats.put(cursor, new int[]{0, 0});
            cursor = cursor.plusMonths(1);
        }

        LocalDateTime startDateTime = start.atStartOfDay();
        LocalDateTime endDateTime = end.plusDays(1).atStartOfDay();

        for (ClassOrder order : orders) {
            if (order.getCreatedAt() == null) {
                continue;
            }

            LocalDateTime createdAt = order.getCreatedAt();
            if (createdAt.isBefore(startDateTime) || !createdAt.isBefore(endDateTime)) {
                continue;
            }

            int[] stats = monthlyStats.get(YearMonth.from(createdAt));
            if (stats == null) {
                continue;
            }

            stats[0] += order.getAmount() != null ? order.getAmount() : 0;
            stats[1] += 1;
        }

        List<FreelancerDashboardResponse.TrendItem> trend = new ArrayList<>();
        for (Map.Entry<YearMonth, int[]> entry : monthlyStats.entrySet()) {
            int[] stats = entry.getValue();
            trend.add(FreelancerDashboardResponse.TrendItem.builder()
                    .month(formatMonthLabel(entry.getKey(), startMonth, endMonth))
                    .revenue(stats[0])
                    .students(stats[1])
                    .build());
        }
        return trend;
    }

    /**
     * @author 김한비
     * @since 2026.04.23
     *
     * 월 라벨을 포맷팅합니다.
     * - 동일 연도일 경우 "M월" 형식
     * - 연도가 다르면 "yy.M" 형식으로 표시
     *
     * @param month 대상 월
     * @param startMonth 시작 월
     * @param endMonth 종료 월
     * @return 포맷된 월 문자열
     */
    private String formatMonthLabel(YearMonth month, YearMonth startMonth, YearMonth endMonth) {
        if (startMonth.getYear() == endMonth.getYear()) {
            return month.getMonthValue() + "월";
        }

        return month.format(DateTimeFormatter.ofPattern("yy.M", Locale.KOREAN));
    }

    /**
     * @author 김한비
     * @since 2026.04.23
     *
     * 프리랜서가 해당 신청 건의 소유자인지 검증합니다.
     * - 클래스 등록자의 이메일과 요청 이메일 비교
     * - 불일치 시 예외 발생
     *
     * @param freelancerEmail 프리랜서 이메일
     * @param classOrder 신청 정보
     */
    private void validateFreelancerOwnership(String freelancerEmail, ClassOrder classOrder) {
        if (!classOrder.getClassBoard().getFreelancer().getEmail().equals(freelancerEmail)) {
            throw new IllegalStateException("본인 클래스 신청 건만 처리할 수 있습니다.");
        }
    }


    /**
     * @author 김한비
     * @since 2026.04.23
     *
     * 관리자 권한 여부를 검증합니다.
     * - 이메일로 회원 조회 후 역할 코드 확인
     * - 관리자(A)가 아니면 접근 차단
     *
     * @param email 사용자 이메일
     */
    private void validateAdmin(String email) {
        Member admin = memberRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));

        if (!"A".equals(admin.getRoleCode().getRoleCode())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "관리자만 접근할 수 있습니다.");
        }
    }
}
