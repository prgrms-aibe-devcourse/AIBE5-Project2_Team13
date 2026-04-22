import React, {useEffect, useMemo, useState} from 'react';
import {
    Heart,
    CheckCircle,
    ChevronRight,
    User,
    Settings,
    LogOut,
    Star,
    LayoutDashboard,
    MessageSquare,
    CreditCard,
    TrendingUp,
    Users,
    BookOpen,
    Edit2,
    BadgeCheck,
    X,
    Shield,
    AlertCircle,
    UserCheck,
    Plus,
    Calendar,
    MapPin,
    Search,
    Filter,
    ArrowUpDown,
    MoreVertical,
    Trash2,
    Check,
    Ban,
    Save,
    type LucideIcon
} from 'lucide-react';
import {
    MOCK_CLASSES,
    UserRole,
    REGIONS,
    ReportItem,
    MOCK_REPORTS,
    MOCK_REVIEWS,
    type EnrollmentItem
} from '@/src/constants';
import ExplorerItemCard from '@/src/components/ExplorerItemCard';
import {motion, AnimatePresence} from 'motion/react';
import {cn} from '@/src/lib/utils';
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    Legend
} from 'recharts';
import {useEnrollments} from '../context/EnrollmentContext';
import {useReports} from '../context/ReportContext';
import {useClasses} from '../context/ClassContext';
import {useFreelancers} from '../context/FreelancerContext';
import {useFollow} from '../context/FollowContext';
import {useRequests} from '../context/RequestContext';
import {useWish} from '../context/WishContext';
import ReviewModal from '../components/ReviewModal';
import {ReviewItem} from '@/src/constants';
import {
    getAdminMembers,
    getMyDetail,
    setMyProfileImageToDefault,
    toggleMemberDeleted,
    updateMemberRole,
    updateMyDetail,
    updateMyPassword,
    updateMyProfileImage,
    withdrawMyAccount,
    type AdminMemberListItem,
    type MemberDetail
} from '@/src/api/member';
import {
    deleteFreelancerPortfolioImages,
    getMyFreelancerProfile,
    uploadFreelancerPortfolioImages,
    upsertMyFreelancerProfile,
    type FreelancerProfileMeResponse
} from '@/src/api/freelancerProfile';
import {
    approveFreelancerProfile,
    getPendingFreelancerProfiles,
    rejectFreelancerProfile,
    type FreelancerApprovalListItemResponse
} from '@/src/api/freelancerRegistration';
import {useAuth} from '@/src/context/AuthContext';
import {useCategories} from '../context/CategoryContext';
import axios from 'axios';
import {formatPhoneNumber, stripPhoneNumber} from '@/src/lib/phone';
import {DEFAULT_PROFILE_IMAGE_URL} from '@/src/lib/profileImage';
import {
    approveFreelancerClassOrder,
    completeFreelancerClassOrder,
    excludeFreelancerClassOrder,
    getAdminClassOrders,
    getMyFreelancerClassOrders,
    rejectFreelancerClassOrder
} from '@/src/api/classOrder';
import {useNavigate, Link} from 'react-router-dom';
import MyRequestManage from './MyRequestManage';
import SafeImage from '../components/SafeImage';
import FollowingList from '../components/FollowingList';

const REVENUE_DATA = [
    {month: '1월', revenue: 1200000, students: 45},
    {month: '2월', revenue: 1800000, students: 62},
    {month: '3월', revenue: 1500000, students: 58},
    {month: '4월', revenue: 2100000, students: 75},
    {month: '5월', revenue: 2800000, students: 92},
    {month: '6월', revenue: 3200000, students: 108},
];

type MenuType =
    'activity'
    | 'my_requests'
    | 'reviews'
    | 'freelancer_dashboard'
    | 'freelancer_classes'
    | 'freelancer_students'
    | 'freelancer_profile'
    | 'admin_home'
    | 'admin_users'
    | 'admin_reports'
    | 'admin_approvals'
    | 'admin'
    | 'settings'
    | 'pick'
    | 'following';

const toRoleCode = (role?: string): UserRole => {
    if (role === 'ADMIN' || role === 'ROLE_ADMIN' || role === 'A') return 'ROLE_ADMIN';
    if (role === 'FREELANCER' || role === 'ROLE_FREELANCER' || role === 'F') return 'ROLE_FREELANCER';
    return 'ROLE_USER';
};

const toRoleLabel = (role: UserRole): string => {
    if (role === 'ROLE_ADMIN') return '관리자';
    if (role === 'ROLE_FREELANCER') return '프리랜서';
    return '회원';
};

type PortfolioImageItem = {
    id: number | null;
    originalFileName: string;
    fileUrl: string;
    // 새로 추가한 이미지인 경우에만 로컬 File을 들고 있고, 기존 서버 첨부는 id/fileUrl만 유지합니다.
    localFile?: File;
};

const MAX_PORTFOLIO_IMAGES = 10;

const mapFreelancerProfileState = (profile: FreelancerProfileMeResponse) => ({
    freelancerId: profile.freelancerId,
    profileId: profile.profileId,
    name: profile.memberName || '',
    specialtyCategoryId: profile.specialtyCategoryId ?? '',
    specialtyCategoryName: profile.specialtyCategoryName || '',
    introduction: profile.bio || '',
    career: profile.career || '',
    snsLink: profile.snsLink || '',
    bankAccount: profile.bankAccount || '',
    location: profile.memberAddress || '',
    portfolioImages: profile.attachments.map((attachment) => ({
        // 서버에서 내려온 첨부는 저장 완료 상태이므로 attachment id를 그대로 유지합니다.
        id: attachment.id,
        originalFileName: attachment.originalFileName,
        fileUrl: attachment.fileUrl,
    })),
});

type AdminNotificationItem = {
    id: string;
    title: string;
    meta: string;
    badge: string;
};

type StatCardProps = {
    title: string;
    value: string;
    description?: string;
    icon: LucideIcon;
    iconClassName?: string;
    action?: React.ReactNode;
    children?: React.ReactNode;
    className?: string;
};

function StatCard({
                      title,
                      value,
                      description,
                      icon: Icon,
                      iconClassName,
                      action,
                      children,
                      className,
                  }: StatCardProps) {
    return (
        <section
            className={cn(
                "group rounded-[32px] border border-coral/10 bg-white p-8 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-coral/20 hover:shadow-md",
                className
            )}
        >
            <div className="mb-8 flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div
                        className={cn("rounded-2xl bg-ivory p-3 text-gray-600 transition-colors group-hover:bg-coral group-hover:text-white", iconClassName)}>
                        <Icon size={22}/>
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-500">{title}</p>
                    </div>
                </div>
                {action}
            </div>
            <div className="space-y-3">
                <p className="text-4xl font-bold tracking-tight text-gray-900">{value}</p>
                {description && <p className="text-sm text-gray-400">{description}</p>}
                {children}
            </div>
        </section>
    );
}

function ActiveClassCard({activeClasses}: { activeClasses: { general: number; request: number } }) {
    return (
        <StatCard
            title="현재 활성화된 클래스"
            value={`${activeClasses.general + activeClasses.request}건`}
            description="현재 운영 중인 클래스 현황"
            icon={BookOpen}
            iconClassName="bg-violet-50 text-violet-600 group-hover:bg-violet-600 group-hover:text-white"
        >
            <div className="mt-6 grid grid-cols-1 overflow-hidden rounded-[24px] border border-coral/10 md:grid-cols-2">
                <div className="bg-ivory/60 px-6 py-5">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">일반 클래스</p>
                    <p className="mt-3 text-3xl font-bold text-gray-900">{activeClasses.general}건</p>
                </div>
                <div className="border-t border-coral/10 bg-white px-6 py-5 md:border-l md:border-t-0">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">요청</p>
                    <p className="mt-3 text-3xl font-bold text-gray-900">{activeClasses.request}건</p>
                </div>
            </div>
        </StatCard>
    );
}

function NotificationSection({notifications}: { notifications: AdminNotificationItem[] }) {
    return (
        <section className="rounded-[32px] border border-coral/10 bg-white p-8 shadow-sm">
            <div className="mb-6 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="rounded-2xl bg-ivory p-3 text-coral">
                        <MessageSquare size={22}/>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">알림</h3>
                        <p className="text-sm text-gray-500">최근 활동과 관리자 확인이 필요한 항목</p>
                    </div>
                </div>
                <span className="rounded-full bg-ivory px-3 py-1 text-xs font-bold text-coral">
          {notifications.length}건
        </span>
            </div>

            <div className="max-h-[360px] space-y-3 overflow-y-auto pr-2">
                {notifications.length > 0 ? notifications.map((notification) => (
                    <div
                        key={notification.id}
                        className="flex items-center justify-between gap-4 rounded-2xl border border-coral/10 bg-ivory/40 px-5 py-4 transition-colors hover:bg-ivory/70"
                    >
                        <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-gray-900">{notification.title}</p>
                            <p className="mt-1 truncate text-xs text-gray-400">{notification.meta}</p>
                        </div>
                        <span
                            className="shrink-0 rounded-full bg-white px-3 py-1 text-[11px] font-bold text-coral border border-coral/10">
              {notification.badge}
            </span>
                    </div>
                )) : (
                    <div
                        className="flex h-[220px] items-center justify-center rounded-[24px] border border-dashed border-coral/10 bg-ivory/40 text-sm text-gray-400">
                        확인할 알림이 없습니다.
                    </div>
                )}
            </div>
        </section>
    );
}

export default function MyPage({initialMenu}: { initialMenu?: MenuType }) {
    const navigate = useNavigate();
    const {user, loading: authLoading, logout, refreshCurrentUser} = useAuth();
    const {enrollments, updateEnrollmentStatus, cancelOrder, refreshEnrollments} = useEnrollments();
    const {reports} = useReports();
    const {classes, deleteClass, toggleStatus} = useClasses();
    const {freelancers} = useFreelancers();
    const {followingIds, toggleFollow} = useFollow();
    const {categories} = useCategories();
    const {requests, fetchRequests} = useRequests();
    const {wishedIds, fetchWishedIds, toggleWish} = useWish();

    const [activeMenu, setActiveMenu] = useState<MenuType>(initialMenu || 'activity');
    const [activityTab, setActivityTab] = useState<'enrolled' | 'waiting' | 'finished'>('enrolled');
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [reviewMode, setReviewMode] = useState<'create' | 'edit'>('create');
    const [selectedReviewData, setSelectedReviewData] = useState<Partial<ReviewItem>>({});
    const [allReviews, setAllReviews] = useState<ReviewItem[]>([]);
    const [freelancerEnrollments, setFreelancerEnrollments] = useState<EnrollmentItem[]>([]);

    // Load reviews from localStorage
    useEffect(() => {
        const savedReviews = localStorage.getItem('all_reviews');
        if (savedReviews) {
            setAllReviews(JSON.parse(savedReviews));
        } else {
            // Initialize with mock reviews if empty
            localStorage.setItem('all_reviews', JSON.stringify(MOCK_REVIEWS));
            setAllReviews(MOCK_REVIEWS);
        }
    }, []);

    const saveReviewsToStorage = (reviews: ReviewItem[]) => {
        localStorage.setItem('all_reviews', JSON.stringify(reviews));
        setAllReviews(reviews);
    };
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [isCancelRequestModalOpen, setIsCancelRequestModalOpen] = useState(false);
    const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
    const [selectedEnrollmentId, setSelectedEnrollmentId] = useState<string | null>(null);
    const [pendingCancelEnrollmentIds, setPendingCancelEnrollmentIds] = useState<Set<string>>(new Set());
    const [rejectReason, setRejectReason] = useState('');
    const [studentCancelReason, setStudentCancelReason] = useState('');
    const [selectedCity, setSelectedCity] = useState('');
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [dashboardDateRange, setDashboardDateRange] = useState({start: '2024-01-01', end: '2024-06-30'});
    const [freelancerProfile, setFreelancerProfile] = useState({
        freelancerId: null as number | null,
        profileId: null as number | null,
        name: '',
        specialtyCategoryId: '' as number | '',
        specialtyCategoryName: '',
        introduction: '',
        career: '',
        snsLink: '',
        bankAccount: '',
        location: '',
        portfolioImages: [] as PortfolioImageItem[]
    });
    const [freelancerProfileLoading, setFreelancerProfileLoading] = useState(false);
    const [freelancerProfileSaving, setFreelancerProfileSaving] = useState(false);
    const [freelancerProfileMissing, setFreelancerProfileMissing] = useState(false);
    const [deletedPortfolioImageIds, setDeletedPortfolioImageIds] = useState<number[]>([]);

    const [myDetail, setMyDetail] = useState<MemberDetail | null>(null);
    const [detailLoading, setDetailLoading] = useState(true);
    const [detailError, setDetailError] = useState<string | null>(null);
    const [settingsForm, setSettingsForm] = useState({
        name: '',
        email: '',
        phone: '',
    });
    const [settingsSaving, setSettingsSaving] = useState(false);
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [passwordSaving, setPasswordSaving] = useState(false);

    // Admin States
    const [adminUsers, setAdminUsers] = useState<AdminMemberListItem[]>([]);
    const [adminUsersLoading, setAdminUsersLoading] = useState(false);
    const [adminReports, setAdminReports] = useState<ReportItem[]>(MOCK_REPORTS);
    const [pendingFreelancerProfiles, setPendingFreelancerProfiles] = useState<FreelancerApprovalListItemResponse[]>([]);
    const [pendingProfilesLoading, setPendingProfilesLoading] = useState(false);
    const [adminClassOrders, setAdminClassOrders] = useState<EnrollmentItem[]>([]);
    const [userSearch, setUserSearch] = useState('');
    const [userFilter, setUserFilter] = useState('ALL');
    const [userSort, setUserSort] = useState<'joinedAt' | 'role'>('joinedAt');
    const [isApprovalRejectModalOpen, setIsApprovalRejectModalOpen] = useState(false);
    const [selectedApprovalId, setSelectedApprovalId] = useState<number | null>(null);
    const [approvalRejectReason, setApprovalRejectReason] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [pendingProfileImageFile, setPendingProfileImageFile] = useState<File | null>(null);
    const [isPendingDefaultProfileImage, setIsPendingDefaultProfileImage] = useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const portfolioInputRef = React.useRef<HTMLInputElement>(null);
    const portfolioImagesRef = React.useRef<PortfolioImageItem[]>([]);

    const userRole = toRoleCode(user?.role || localStorage.getItem('userRole') || undefined);
    const userRoleLabel = toRoleLabel(userRole);
    const displayName = myDetail?.name || user?.name || '포근사용자';
    const profileImageSrc = profileImage || myDetail?.imgUrl || DEFAULT_PROFILE_IMAGE_URL;

    // Set default menu based on role
    useEffect(() => {
        if (initialMenu) {
            setActiveMenu(initialMenu);
            return;
        }
        if (userRole === 'ROLE_ADMIN') setActiveMenu('admin_home');
        else if (userRole === 'ROLE_FREELANCER') setActiveMenu('freelancer_dashboard');
        else setActiveMenu('activity');
    }, [userRole, initialMenu]);

    useEffect(() => {
        if (authLoading) {
            return;
        }

        if (!user) {
            setDetailLoading(false);
            return;
        }

        let isMounted = true;

        const loadMyDetail = async () => {
            setDetailLoading(true);
            setDetailError(null);

            try {
                const detail = await getMyDetail();

                if (!isMounted) {
                    return;
                }

                setMyDetail(detail);
                setSettingsForm({
                    name: detail.name || user.name || '',
                    email: detail.email || user.email || '',
                    phone: formatPhoneNumber(detail.phone || ''),
                });
                setSelectedCity(detail.addr || '');
                setSelectedDistrict(detail.addr2 || '');
                setProfileImage(detail.imgUrl || null);
                setPendingProfileImageFile(null);
                setIsPendingDefaultProfileImage(false);
            } catch (error) {
                if (!isMounted) {
                    return;
                }

                setDetailError('회원 정보를 불러오지 못했습니다.');
                setSettingsForm({
                    name: user.name || '',
                    email: user.email || '',
                    phone: '',
                });
            } finally {
                if (isMounted) {
                    setDetailLoading(false);
                }
            }
        };

        loadMyDetail();

        return () => {
            isMounted = false;
        };
    }, [authLoading, user]);

    useEffect(() => {
        if (authLoading || userRole !== 'ROLE_FREELANCER') {
            return;
        }

        let isMounted = true;

        const loadFreelancerProfile = async () => {
            setFreelancerProfileLoading(true);
            setFreelancerProfileMissing(false);
            try {
                const profile = await getMyFreelancerProfile();

                if (!isMounted) {
                    return;
                }

            //현재 활성화된 클래스
            // 일반 클래스 건수: classes.filter(...status === 'OPEN')라 실제 /classes 응답 기반입니다.
                setFreelancerProfile(mapFreelancerProfileState(profile));
                setDeletedPortfolioImageIds([]);
            } catch (error) {
                //요청 건수: requests.length라 실제 /request-classes 응답 기반입니다.
                if (isMounted) {
                    if (axios.isAxiosError(error) && error.response?.status === 404) {
                        setFreelancerProfileMissing(true);
                    } else {
                        showToast('프리랜서 프로필을 불러오지 못했습니다.', 'error');
                    }
                }
            } finally {
                if (isMounted) {
                    setFreelancerProfileLoading(false);
                }
            }
        };

        loadFreelancerProfile();

        return () => {
            isMounted = false;
        };
    }, [authLoading, userRole]);

    useEffect(() => {
        return () => {
            if (profileImage?.startsWith('blob:')) {
                URL.revokeObjectURL(profileImage);
            }
        };
    }, [profileImage]);

    useEffect(() => {
        portfolioImagesRef.current = freelancerProfile.portfolioImages;
    }, [freelancerProfile.portfolioImages]);

    useEffect(() => {
        return () => {
            revokePortfolioObjectUrls(portfolioImagesRef.current);
        };
    }, []);

    useEffect(() => {
        if (authLoading || userRole !== 'ROLE_ADMIN') {
            return;
        }

        let isMounted = true;

        //전체 사용자 수: adminUsers.length 기반이라 실제 API 결과입니다. getAdminMembers() 호출 후 상태에 저장합니다.
        const loadAdminUsers = async () => {
            setAdminUsersLoading(true);
            try {
                const members = await getAdminMembers();
                if (isMounted) {
                    setAdminUsers(members);
                }
            } catch (error) {
                if (isMounted) {
                    showToast('회원 목록을 불러오지 못했습니다.', 'error');
                }
            } finally {
                if (isMounted) {
                    setAdminUsersLoading(false);
                }
            }
        };

        //프리랜서 승인 요청 건수: pendingFreelancerProfiles.length 기반이라 실제 API 결과입니다.getPendingFreelancerProfiles()를 사용합니다.
        const loadPendingFreelancerProfiles = async () => {
            setPendingProfilesLoading(true);
            try {
                const approvals = await getPendingFreelancerProfiles();
                if (isMounted) {
                    setPendingFreelancerProfiles(approvals);
                }
            } catch (error) {
                if (isMounted) {
                    showToast('프리랜서 승인 목록을 불러오지 못했습니다.', 'error');
                }
            } finally {
                if (isMounted) {
                    setPendingProfilesLoading(false);
                }
            }
        };

        const loadAdminClassOrders = async () => {
            try {
                const orders = await getAdminClassOrders();
                if (isMounted) {
                    setAdminClassOrders(orders);
                }
            } catch (error) {
                if (isMounted) {
                    showToast('주문 목록을 불러오지 못했습니다.', 'error');
                }
            }
        };

        loadAdminUsers();
        loadPendingFreelancerProfiles();
        loadAdminClassOrders();

        return () => {
            isMounted = false;
        };
    }, [authLoading, userRole]);

    const appliedClasses = classes.slice(2, 4);
    const currentUserEmail = user?.email || '';
    const teachingClasses = classes.filter(c => c.freelancerEmail === currentUserEmail);
    const pickedClasses = classes.filter(item => wishedIds.has(item.id));
    const pickedRequests = requests.filter(item => wishedIds.has(item.id));
    const totalUsers = adminUsers.length;
    const today = new Date();
    const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const todayRevenue = adminClassOrders
        .filter((order) => order.appliedAt === todayKey)
        .reduce((sum, order) => sum + (order.price ?? 0), 0);
    const activeClasses = {
        general: classes.filter((classItem) => classItem.status === 'OPEN').length,
        request: requests.length,
    };
    const adminNotifications = [
        ...pendingFreelancerProfiles.slice(0, 2).map((profile) => ({
            id: `approval-${profile.profileId}`,
            title: `${profile.memberName}님의 프리랜서 승인 요청`,
            meta: profile.specialtyCategoryName || '승인 대기',
            badge: '승인 요청',
        })),
        ...adminReports.slice(0, 2).map((report) => ({
            id: `report-${report.id}`,
            title: report.reason,
            meta: `${report.reportedAt} · ${report.type}`,
            badge: '신고 접수',
        })),
    ].slice(0, 3);
// 실제 클래스 목록을 우선으로 하고, 부족한 데이터를 MOCK_CLASSES로 보완하여 ID 기반의 통합 조회용 Map 객체를 생성합니다.
    const classLookup = useMemo(() => {
        const lookup = new Map(classes.map((classItem) => [classItem.id, classItem]));

        MOCK_CLASSES.forEach((classItem) => {
            if (!lookup.has(classItem.id)) {
                lookup.set(classItem.id, classItem);
            }
        });

        return lookup;
    }, [classes]);

    useEffect(() => {
        if (activeMenu !== 'pick') return;

        fetchRequests();
        fetchWishedIds();
    }, [activeMenu, fetchRequests, fetchWishedIds]);

    useEffect(() => {
        if (authLoading || userRole !== 'ROLE_FREELANCER' || activeMenu !== 'freelancer_students') {
            return;
        }

        let isMounted = true;

        // [기능: 프리랜서 수강 신청 목록 조회] [이유: 수강생 관리 탭에서 본인 클래스 신청 내역을 서버 기준으로 보여주기 위해]
        const loadFreelancerEnrollments = async () => {
            try {
                const orders = await getMyFreelancerClassOrders();

                if (isMounted) {
                    setFreelancerEnrollments(orders);
                }
            } catch (error) {
                if (isMounted) {
                    showToast('수강 신청 목록을 불러오지 못했습니다.', 'error');
                }
            }
        };

        loadFreelancerEnrollments();

        return () => {
            isMounted = false;
        };
    }, [activeMenu, authLoading, userRole]);

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({message, type});
        setTimeout(() => setToast(null), 3000);
    };

    const revokePortfolioObjectUrls = (images: PortfolioImageItem[]) => {
        images.forEach((image) => {
            if (image.localFile && image.fileUrl.startsWith('blob:')) {
                // 서버 URL은 건드리지 않고, 로컬에서 생성한 미리보기 blob URL만 정리합니다.
                URL.revokeObjectURL(image.fileUrl);
            }
        });
    };

    const handleLogout = () => {
        if (window.confirm('로그아웃 하시겠습니까?')) {
            logout();
            navigate('/');
        }
    };

    const handleSaveChanges = async () => {
        if (!settingsForm.name.trim()) {
            showToast('이름을 입력해주세요.', 'error');
            return;
        }

        try {
            setSettingsSaving(true);

            const savedDetail = await updateMyDetail({
                name: settingsForm.name,
                phone: stripPhoneNumber(settingsForm.phone),
                addr: selectedCity,
                addr2: selectedDistrict,
            });

            const finalDetail = pendingProfileImageFile
                ? await updateMyProfileImage(pendingProfileImageFile)
                : isPendingDefaultProfileImage
                    ? await setMyProfileImageToDefault()
                    : savedDetail;

            await refreshCurrentUser();

            setMyDetail(finalDetail);
            setSettingsForm({
                name: finalDetail.name || '',
                email: finalDetail.email || user?.email || '',
                phone: formatPhoneNumber(finalDetail.phone || ''),
            });
            setSelectedCity(finalDetail.addr || '');
            setSelectedDistrict(finalDetail.addr2 || '');
            setProfileImage(finalDetail.imgUrl || null);
            setPendingProfileImageFile(null);
            setIsPendingDefaultProfileImage(false);

            if (userRole === 'ROLE_FREELANCER') {
                const refreshedProfile = await getMyFreelancerProfile();
                setFreelancerProfile(mapFreelancerProfileState(refreshedProfile));
                setDeletedPortfolioImageIds([]);
            }

            showToast('계정 정보가 저장되었습니다.');
        } catch (error) {
            showToast('계정 정보 저장 중 오류가 발생했습니다.', 'error');
        } finally {
            setSettingsSaving(false);
        }
    };

    const resetSettingsDraft = () => {
        if (profileImage?.startsWith('blob:')) {
            URL.revokeObjectURL(profileImage);
        }

        setSettingsForm({
            name: myDetail?.name || user?.name || '',
            email: myDetail?.email || user?.email || '',
            phone: formatPhoneNumber(myDetail?.phone || ''),
        });
        setSelectedCity(myDetail?.addr || '');
        setSelectedDistrict(myDetail?.addr2 || '');
        setProfileImage(myDetail?.imgUrl || null);
        setPendingProfileImageFile(null);
        setIsPendingDefaultProfileImage(false);

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleMenuChange = (nextMenu: MenuType) => {
        if (activeMenu === 'settings' && nextMenu !== 'settings') {
            resetSettingsDraft();
        }

        setActiveMenu(nextMenu);
    };

    const resetPasswordForm = () => {
        setPasswordForm({
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        });
    };

    const handleChangePassword = () => {
        resetPasswordForm();
        setIsPasswordModalOpen(true);
    };

    const handleClosePasswordModal = () => {
        setIsPasswordModalOpen(false);
        resetPasswordForm();
    };

    const handleSubmitPasswordChange = async () => {
        const currentPassword = passwordForm.currentPassword.trim();
        const newPassword = passwordForm.newPassword.trim();
        const confirmPassword = passwordForm.confirmPassword.trim();

        if (!currentPassword || !newPassword || !confirmPassword) {
            showToast('비밀번호 항목을 모두 입력해주세요.', 'error');
            return;
        }

        if (newPassword !== confirmPassword) {
            showToast('새 비밀번호 확인이 일치하지 않습니다.', 'error');
            return;
        }

        try {
            setPasswordSaving(true);
            await updateMyPassword({
                currentPassword,
                newPassword,
            });
            handleClosePasswordModal();
            alert('비밀번호가 변경되었습니다.');
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const responseData = error.response?.data;
                const message =
                    typeof responseData === 'string'
                        ? responseData
                        : responseData?.message || responseData?.detail || responseData?.error || '비밀번호 변경 중 오류가 발생했습니다.';
                showToast(message, 'error');
                return;
            }
            showToast('비밀번호 변경 중 오류가 발생했습니다.', 'error');
        } finally {
            setPasswordSaving(false);
        }
    };

    const handleWithdraw = () => {
        if (!window.confirm('정말 회원 탈퇴하시겠습니까?')) {
            return;
        }

        (async () => {
            try {
                await withdrawMyAccount();
                logout();
                alert('회원 탈퇴가 완료되었습니다.');
                navigate('/');
            } catch (error) {
                if (axios.isAxiosError(error)) {
                    showToast(error.response?.data?.message || '회원 탈퇴 중 오류가 발생했습니다.', 'error');
                    return;
                }
                showToast('회원 탈퇴 중 오류가 발생했습니다.', 'error');
            }
        })();
    };

    const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) {
            return;
        }

        const previewUrl = URL.createObjectURL(file);
        setPendingProfileImageFile(file);
        setIsPendingDefaultProfileImage(false);
        setProfileImage(previewUrl);

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSetDefaultProfileImage = () => {
        if (profileImage?.startsWith('blob:')) {
            URL.revokeObjectURL(profileImage);
        }
        setPendingProfileImageFile(null);
        setIsPendingDefaultProfileImage(true);
        setProfileImage(DEFAULT_PROFILE_IMAGE_URL);
    };

    //사용자의 '취소 의사'를 확인 -> 실제 서버 작업 수행 -> 결과를 알림(피드백)으로 보여주는 과정을 담당하는 이벤트 핸들러(Event Handler) 함수
    const handleCancelApplication = async (id: string) => {
        if (window.confirm('신청을 취소하시겠습니까?')) {
            try {
                // 1. 서버에 취소 요청
                setPendingCancelEnrollmentIds((prev) => new Set(prev).add(id));
                await cancelOrder(id);

                // 2. 피드백
                showToast('신청이 취소되었습니다.');

                // 취소 성공 후 목록을 다시 불러와 화면을 최신 상태로 맞춘다.
                await refreshEnrollments();

            } catch (error) {
                setPendingCancelEnrollmentIds((prev) => {
                    const next = new Set(prev);
                    next.delete(id);
                    return next;
                });
                showToast('신청 취소 중 오류가 발생했습니다.', 'error');
            }
        }
    };

    const handleConfirmCancelRequest = () => {
        if (!studentCancelReason.trim()) {
            alert('취소 사유를 입력해주세요.');
            return;
        }
        if (selectedEnrollmentId) {
            updateEnrollmentStatus(selectedEnrollmentId, 'CANCEL_REQUESTED', studentCancelReason);
            alert('취소 요청이 접수되었습니다.');
            setIsCancelRequestModalOpen(false);
            setStudentCancelReason('');
            setSelectedEnrollmentId(null);
        }
    };

    const renderEnrollmentButton = (enrollment: any) => {

        //데이터가 실제로 어떻게 생겼는지 눈으로 확인
        //신청 취소가 안되는 문제 해결 위해 추가
        console.log("현재 enrollment 데이터:", enrollment);

        if (enrollment.status === 'PENDING') {
            return (
                <button
                    onClick={() => handleCancelApplication(enrollment.id)}
                    className="w-full py-3 bg-gray-100 text-gray-600 font-bold rounded-2xl hover:bg-red-50 hover:text-red-500 transition-all text-sm border border-coral/10 shadow-sm"
                >
                    신청 취소
                </button>
            );
        }
        return null;
    };

    const renderActivity = () => (
        <div className="space-y-8">
            <div className="flex flex-wrap gap-4 p-1 bg-ivory rounded-2xl w-fit">
                <button
                    onClick={() => setActivityTab('enrolled')}
                    className={cn(
                        "px-6 py-2 rounded-xl font-bold transition-all",
                        activityTab === 'enrolled' ? "bg-coral text-white shadow-md" : "text-gray-500 hover:text-coral"
                    )}
                >
                    수강 중
                </button>
                <button
                    onClick={() => setActivityTab('waiting')}
                    className={cn(
                        "px-6 py-2 rounded-xl font-bold transition-all",
                        activityTab === 'waiting' ? "bg-coral text-white shadow-md" : "text-gray-500 hover:text-coral"
                    )}
                >
                    승인 대기
                </button>
                <button
                    onClick={() => setActivityTab('finished')}
                    className={cn(
                        "px-6 py-2 rounded-xl font-bold transition-all",
                        activityTab === 'finished' ? "bg-coral text-white shadow-md" : "text-gray-500 hover:text-coral"
                    )}
                >
                    수강 완료
                </button>
            </div>

            <AnimatePresence mode="wait">
                {activityTab === 'enrolled' ? (
                    <motion.div
                        key="enrolled"
                        initial={{opacity: 0, y: 10}}
                        animate={{opacity: 1, y: 0}}
                        exit={{opacity: 0, y: -10}}
                        className="grid grid-cols-1 md:grid-cols-2 gap-8"
                    >
                        {enrollments.filter(e => e.status === 'APPROVED' || e.status === 'CANCEL_REQUESTED').map(e => {
                            const classItem = classLookup.get(e.classId);
                            return classItem ? (
                                <div key={e.id} className="flex flex-col gap-4">
                                    <ExplorerItemCard
                                        id={classItem.id}
                                        image={classItem.image}
                                        title={classItem.title}
                                        value={classItem.price}
                                        valueLabel="수강료"
                                        personName={classItem.freelancer}
                                        personLabel="프리랜서"
                                        category={classItem.category}
                                        categoryName={e.status === 'APPROVED' ? "수강 중" : "취소 요청 중"}
                                    />
                                    <div className="flex gap-2">
                                        {e.status === 'APPROVED' ? (
                                            <>
                                                <button
                                                    onClick={() => {

                                                        setSelectedEnrollmentId(e.id);
                                                        setIsCancelRequestModalOpen(true);
                                                    }}
                                                    className="flex-1 py-3 bg-ivory text-gray-500 font-bold rounded-2xl hover:bg-red-50 hover:text-red-500 transition-all text-sm border border-coral/10 shadow-sm"
                                                >
                                                    취소 요청
                                                </button>
                                            </>
                                        ) : (
                                            <div
                                                className="w-full py-3 bg-gray-50 text-gray-400 font-bold rounded-2xl text-center text-sm border border-coral/5">
                                                취소 검토 중
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : null;
                        })}
                    </motion.div>
                ) : activityTab === 'waiting' ? (
                    <motion.div
                        key="waiting"
                        initial={{opacity: 0, y: 10}}
                        animate={{opacity: 1, y: 0}}
                        exit={{opacity: 0, y: -10}}
                        className="grid grid-cols-1 md:grid-cols-2 gap-8"
                    >
                        {enrollments.filter(e => e.status === 'PENDING' && !pendingCancelEnrollmentIds.has(e.id)).map(e => {
                            const classItem = classLookup.get(e.classId);
                            return classItem ? (
                                <div key={e.id} className="flex flex-col gap-4">
                                    <ExplorerItemCard
                                        id={classItem.id}
                                        image={classItem.image}
                                        title={classItem.title}
                                        value={classItem.price}
                                        valueLabel="수강료"
                                        personName={classItem.freelancer}
                                        personLabel="프리랜서"
                                        category={classItem.category}
                                        categoryName="승인 대기"
                                        status={classItem.status}
                                        imageLoading="eager"
                                    />
                                    {renderEnrollmentButton(e)}
                                </div>
                            ) : null;
                        })}
                    </motion.div>
                ) : (
                    <motion.div
                        key="finished"
                        initial={{opacity: 0, y: 10}}
                        animate={{opacity: 1, y: 0}}
                        exit={{opacity: 0, y: -10}}
                        className="space-y-4"
                    >
                        {/* Mock finished classes */}
                        {[
                            {
                                id: '1',
                                title: '따스한 수채화 원데이 클래스',
                                date: '2024-03-20',
                                image: 'https://picsum.photos/seed/art1/400/300'
                            },
                            {
                                id: '2',
                                title: '초보 자전거 정비 및 라이딩 기초',
                                date: '2024-03-15',
                                image: 'https://picsum.photos/seed/bike/400/300'
                            }
                        ].map(item => {
                            const existingReview = allReviews.find(r => r.classId === item.id);
                            return (
                                <div key={item.id}
                                     className="bg-white rounded-[32px] p-6 border border-coral/10 flex flex-col gap-6 shadow-sm">
                                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                                        <div className="flex items-center gap-6 w-full md:w-auto">
                                            <img
                                                src={item.image}
                                                alt={item.title}
                                                className="w-20 h-20 rounded-2xl object-cover cursor-pointer hover:opacity-80 transition-opacity"
                                                referrerPolicy="no-referrer"
                                                onClick={() => handleClassClick(item.id)}
                                            />
                                            <div className="min-w-0 flex-1">
                                                <h4
                                                    className="font-bold text-gray-900 mb-1 cursor-pointer hover:text-coral transition-colors line-clamp-1"
                                                    onClick={() => handleClassClick(item.id)}
                                                >
                                                    {item.title}
                                                </h4>
                                                <p className="text-sm text-gray-400">수강 완료일: {item.date}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => existingReview ? handleEditReview(existingReview) : handleCreateReview(item)}
                                            className={cn(
                                                "w-full md:w-auto px-8 py-3 font-bold rounded-2xl transition-all shadow-lg flex-shrink-0 whitespace-nowrap",
                                                existingReview
                                                    ? "bg-white text-coral border border-coral hover:bg-coral/5 shadow-coral/10"
                                                    : "bg-coral text-white hover:bg-coral/90 shadow-coral/20"
                                            )}
                                        >
                                            {existingReview ? '리뷰 수정하기' : '리뷰 작성하기'}
                                        </button>
                                    </div>

                                    {existingReview && (
                                        <div className="mt-2 p-4 bg-ivory/50 rounded-2xl border border-coral/5">
                                            <div className="flex gap-1 mb-2">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} size={14}
                                                          className={cn(i < existingReview.rating ? "text-coral fill-coral" : "text-gray-200")}/>
                                                ))}
                                            </div>
                                            <p className="text-sm text-gray-600 line-clamp-2">{existingReview.content}</p>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );

    const renderPick = () => (
        <div className="space-y-12">
            <div>
                <h3 className="text-xl font-bold text-gray-900 mb-6">Pick 클래스</h3>
                {pickedClasses.length === 0 ? (
                    <div className="bg-white rounded-[32px] p-8 border border-coral/10 text-gray-400 shadow-sm">
                        아직 Pick한 일반 클래스가 없습니다.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                        {pickedClasses.map(item => (
                            <ExplorerItemCard
                                key={item.id}
                                id={item.id}
                                image={item.image}
                                title={item.title}
                                value={item.price}
                                valueLabel="수강료"
                                personName={item.freelancer}
                                personLabel="프리랜서"
                                personId={item.freelancerId}
                                category={item.category}
                                categoryName={item.category}
                                type="class"
                                location={item.location}
                                lessonType={item.isOffline ? '오프라인' : '온라인'}
                                rating={item.rating}
                                reviews={item.reviews}
                                isWished
                                compact
                                onWishToggle={() => toggleWish(item.id)}
                            />
                        ))}
                    </div>
                )}
            </div>
            <div>
                <h3 className="text-xl font-bold text-gray-900 mb-6">관심 요청글</h3>
                {pickedRequests.length === 0 ? (
                    <div className="bg-white rounded-[32px] p-8 border border-coral/10 text-gray-400 shadow-sm">
                        아직 Pick한 요청 클래스가 없습니다.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                        {pickedRequests.map(item => (
                            <ExplorerItemCard
                                key={item.id}
                                id={item.id}
                                image={item.image}
                                title={item.title}
                                value={item.reward}
                                valueLabel="희망 금액"
                                personName={item.author}
                                personLabel="요청자"
                                category={item.category}
                                categoryName={item.category}
                                type="request"
                                lessonType={item.lessonType}
                                isWished
                                compact
                                onWishToggle={() => toggleWish(item.id)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );

    const renderFollowing = () => {
        return <FollowingList/>;
    };

    const handleClassClick = (classId: string) => {
        navigate(`/class/${classId}`);
    };

    const handleEditReview = (review: ReviewItem) => {
        setReviewMode('edit');
        setSelectedReviewData(review);
        setIsReviewModalOpen(true);
    };

    const handleCreateReview = (classItem: any) => {
        setReviewMode('create');
        setSelectedReviewData({
            classId: classItem.id,
            className: classItem.title,
        });
        setIsReviewModalOpen(true);
    };

    const handleSaveReview = (reviewData: Partial<ReviewItem>) => {
        const now = new Date().toISOString().split('T')[0];

        if (reviewMode === 'create') {
            const newReview: ReviewItem = {
                id: `rv${Date.now()}`,
                author: '포근사용자', // In real app, get from user context
                userId: 'u1',
                rating: reviewData.rating || 5,
                content: reviewData.content || '',
                image: reviewData.image,
                date: now,
                className: selectedReviewData.className || '',
                classId: selectedReviewData.classId || '',
            };
            saveReviewsToStorage([...allReviews, newReview]);
            showToast('리뷰가 등록되었습니다!');
        } else {
            const updatedReviews = allReviews.map(r =>
                r.id === selectedReviewData.id
                    ? {...r, ...reviewData, date: now}
                    : r
            );
            saveReviewsToStorage(updatedReviews);
            showToast('리뷰가 수정되었습니다!');
        }
        setIsReviewModalOpen(false);
    };

// [기능 설명: 특정 클래스 주문을 승인하고, 상태를 '승인됨/진행 중'으로 변경하여 UI에 즉시 반영합니다.] [작성 이유: API 호출 결과를 로컬 상태와 동기화하여 별도의 데이터 새로고침 없이 사용자에게 승인 결과를 보여주기 위해 작성함]
    const handleApprove = async (id: string) => {
        try {
            await approveFreelancerClassOrder(id);
            setFreelancerEnrollments((prev) => prev.map((enrollment) => enrollment.id === id ? {
                ...enrollment,
                status: 'APPROVED',
                progressStatus: 'IN_PROGRESS'
            } : enrollment));
            alert('수강 신청이 승인되었습니다. 유저 상태가 수강자로 변경되었습니다.');
            return;
        } catch (error) {
            showToast('수강 신청 승인 중 오류가 발생했습니다.', 'error');
            return;
        }
        alert('수강 신청이 승인되었습니다. 유저 상태가 수강자로 변경되었습니다.');
    };

// [기능 설명: 거절 사유를 입력받을 모달을 띄우기 위해 선택된 주문 ID를 설정합니다.] [작성 이유: 거절 프로세스를 버튼 클릭과 모달 확정으로 분리하여 사용자 경험을 개선하고 의도치 않은 거절을 방지하기 위해 작성함]
    const handleRejectClick = (id: string) => {
        setSelectedEnrollmentId(id);
        setIsRejectModalOpen(true);
    };

// [기능 설명: 입력된 거절 사유를 검증한 후 서버에 거절 요청을 보내고, UI의 상태를 거절 상태로 업데이트합니다.] [작성 이유: 사유 입력을 필수로 하여 거절 프로세스를 명확히 하고, 서버와 로컬 상태를 일치시키기 위해 작성함]
    const handleConfirmReject = async () => {
        if (!rejectReason.trim()) {
            alert('거절 사유를 입력해주세요.');
            return;
        }
        if (selectedEnrollmentId) {
            try {
                await rejectFreelancerClassOrder(selectedEnrollmentId);
                setFreelancerEnrollments((prev) => prev.map((enrollment) => enrollment.id === selectedEnrollmentId ? {
                    ...enrollment,
                    status: 'REJECTED',
                    progressStatus: 'REJECTED',
                    cancelReason: rejectReason
                } : enrollment));
                alert('수강 신청이 거절되었습니다.');
                setIsRejectModalOpen(false);
                setRejectReason('');
                setSelectedEnrollmentId(null);
                return;
            } catch (error) {
                showToast('수강 신청 거절 중 오류가 발생했습니다.', 'error');
                return;
            }
            alert('수강 신청이 거절되었습니다.');
            setIsRejectModalOpen(false);
            setRejectReason('');
            setSelectedEnrollmentId(null);
        }
    };

    const handleChatSimulation = (studentName: string) => {
        alert(`${studentName}님과의 1:1 대화방으로 이동합니다.`);
        navigate('/chat');
    };

    // [기능 설명: 수강 신청의 상태와 진행 상황을 바탕으로 UI에 표시할 배지 스타일과 라벨을 결정합니다.] [작성 이유: 수강 신청의 다양한 상태 조합에 따른 UI 표시 로직을 중앙화하여 코드 중복을 방지하고 유지보수성을 높이기 위해 작성함]
    const getFreelancerEnrollmentStatusMeta = (enrollment: EnrollmentItem) => {
        if (enrollment.status === 'APPROVED' && enrollment.progressStatus === 'COMPLETED') {
            return {
                badgeClassName: 'bg-blue-100 text-blue-600',
                label: '수업 완료',
            };
        }

        if (enrollment.status === 'PENDING') {
            return {
                badgeClassName: 'bg-yellow-100 text-yellow-600',
                label: '승인 대기',
            };
        }

        if (enrollment.status === 'APPROVED') {
            return {
                badgeClassName: 'bg-green-100 text-green-600',
                label: '수강 중',
            };
        }

        if (enrollment.status === 'CANCEL_REQUESTED') {
            return {
                badgeClassName: 'bg-orange-100 text-orange-600',
                label: '취소 요청 중',
            };
        }

        return {
            badgeClassName: 'bg-red-100 text-red-600',
            label: enrollment.status === 'CANCELLED' ? '취소됨' : '거절됨',
        };
    };

    // [기능 설명: 특정 클래스 주문을 완료 처리하고, UI의 수강 신청 상태를 '완료'로 즉시 갱신합니다.] [작성 이유: API 호출 결과를 로컬 상태에 바로 반영하여 데이터 일관성을 유지하고 사용자에게 완료 결과를 피드백하기 위해 작성함]
    const handleFreelancerComplete = async (id: string) => {
        try {
            await completeFreelancerClassOrder(id);
            setFreelancerEnrollments((prev) =>
                prev.map((enrollment) =>
                    enrollment.id === id
                        ? {...enrollment, status: 'APPROVED', progressStatus: 'COMPLETED'}
                        : enrollment
                )
            );
            showToast('수업이 완료 처리되었습니다.');
        } catch (error) {
            showToast('수업 완료 처리 중 오류가 발생했습니다.', 'error');
        }
    };

    // [기능 설명: 수강생에게 제외 여부를 확인한 후, 서버에 제외 요청을 보내고 로컬 상태를 '취소됨'으로 갱신합니다.] [작성 이유: 사용자 확인 절차를 거쳐 의도치 않은 제외를 방지하고, API 통신 성공 시 UI를 즉시 동기화하기 위해 작성함]
    const handleFreelancerExclude = async (id: string, studentName: string) => {
        if (!window.confirm(`${studentName}님을 수강 목록에서 제외하시겠습니까?`)) {
            return;
        }

        try {
            await excludeFreelancerClassOrder(id);
            setFreelancerEnrollments((prev) =>
                prev.map((enrollment) =>
                    enrollment.id === id
                        ? {...enrollment, status: 'CANCELLED', progressStatus: 'CANCELLED'}
                        : enrollment
                )
            );
            showToast('수강생이 제외되었습니다.');
        } catch (error) {
            showToast('수강 제외 처리 중 오류가 발생했습니다.', 'error');
        }
    };

    // [기능: 프리랜서 수강 신청 승인 상태 반영] [이유: 수강생 관리 탭에서 승인 결과를 실제 신청 목록에 즉시 반영하기 위해]
    const handleFreelancerApprove = (id: string) => {
        handleApprove(id);
        alert('수강 신청이 승인되었습니다. 유저 상태가 수강자로 변경되었습니다.');

        // [기능: 프리랜서 수강 신청 거절 상태 반영] [이유: 수강생 관리 탭에서 거절 결과를 실제 신청 목록에 즉시 반영하기 위해]
    };

    const handleFreelancerReject = () => {
        if (!rejectReason.trim()) {
            alert('거절 사유를 입력해주세요.');
            return;
        }

        if (selectedEnrollmentId) {
            setFreelancerEnrollments((prev) =>
                prev.map((enrollment) =>
                    enrollment.id === selectedEnrollmentId
                        ? {...enrollment, status: 'REJECTED', cancelReason: rejectReason}
                        : enrollment
                )
            );
        }
    };

    // [기능: 프리랜서 수강생 관리 테이블 렌더링] [이유: 본인 클래스에 신청한 회원 목록을 마이페이지에서 바로 확인할 수 있게 하기 위해]
    const renderEnrollmentManagement = () => (
        <div className="space-y-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">수강 신청 관리</h2>
            <div className="bg-white rounded-[40px] border border-coral/10 overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead>
                    <tr className="bg-ivory border-b border-coral/10">
                        <th className="px-6 py-4 text-sm font-bold text-gray-600">클래스명</th>
                        <th className="px-6 py-4 text-sm font-bold text-gray-600">신청자</th>
                        <th className="px-6 py-4 text-sm font-bold text-gray-600">신청일</th>
                        <th className="px-6 py-4 text-sm font-bold text-gray-600">상태</th>
                        <th className="px-6 py-4 text-sm font-bold text-gray-600">액션</th>
                    </tr>
                    </thead>
                    <tbody>
                    {freelancerEnrollments.map((e) => (
                        <tr key={e.id} className="border-b border-coral/5 hover:bg-ivory/30 transition-colors">
                            <td className="px-6 py-4">
                                <p className="font-bold text-gray-900 text-sm">{e.classTitle}</p>
                            </td>
                            <td className="px-6 py-4">
                                <p className="text-sm text-gray-600">{e.studentName}</p>
                                <p className="text-xs text-gray-400">{e.studentEmail}</p>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">{e.appliedAt}</td>
                            <td className="px-6 py-4">
                  <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-bold",
                      getFreelancerEnrollmentStatusMeta(e).badgeClassName
                  )}>
                    {e.status === 'PENDING' ? '승인 대기' :
                        e.status === 'APPROVED' ? (e.progressStatus === 'COMPLETED' ? '수업 완료' : '수강 중') :
                            e.status === 'CANCEL_REQUESTED' ? '취소 요청 중' :
                                e.status === 'CANCELLED' ? '취소됨' : '거절됨'}
                  </span>
                                {e.cancelReason &&
                                    <p className="text-[10px] text-red-400 mt-1">사유: {e.cancelReason}</p>}
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex gap-2">
                                    {e.status === 'PENDING' && (
                                        <>
                                            <button
                                                onClick={() => handleFreelancerApprove(e.id)}
                                                className="px-3 py-1.5 bg-coral text-white text-xs font-bold rounded-lg hover:bg-coral/90 transition-all"
                                            >
                                                승인
                                            </button>
                                            <button
                                                onClick={() => handleRejectClick(e.id)}
                                                className="px-3 py-1.5 bg-gray-100 text-gray-600 text-xs font-bold rounded-lg hover:bg-gray-200 transition-all"
                                            >
                                                거절
                                            </button>
                                        </>
                                    )}
                                    {e.status === 'APPROVED' && e.progressStatus !== 'COMPLETED' && (
                                        <button
                                            onClick={() => handleFreelancerComplete(e.id)}
                                            className="px-3 py-1.5 bg-blue-500 text-white text-xs font-bold rounded-lg hover:bg-blue-600 transition-all"
                                        >
                                            수업 완료
                                        </button>
                                    )}
                                    {e.status === 'APPROVED' && (
                                        <button
                                            onClick={() => handleFreelancerExclude(e.id, e.studentName)}
                                            className="px-3 py-1.5 bg-red-500 text-white text-xs font-bold rounded-lg hover:bg-red-600 transition-all"
                                        >
                                            수강 제외
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleChatSimulation(e.studentName)}
                                        className="px-3 py-1.5 border border-coral text-coral text-xs font-bold rounded-lg hover:bg-coral/5 transition-all"
                                    >
                                        1:1 대화
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    {freelancerEnrollments.length === 0 && (
                        <tr>
                            <td colSpan={5} className="px-6 py-16 text-center text-sm text-gray-400">
                                아직 신청한 수강생이 없습니다.
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderReviews = () => (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">나의 리뷰</h2>
            <div className="space-y-4">
                {allReviews.length === 0 && (
                    <div className="text-center py-20 text-gray-400">작성한 리뷰가 없습니다.</div>
                )}
                {allReviews.map(review => (
                    <div key={review.id} className="bg-white rounded-[32px] p-8 border border-coral/10 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex-1">
                                <h3
                                    className="font-bold text-gray-900 mb-1 cursor-pointer hover:text-coral transition-colors"
                                    onClick={() => handleClassClick(review.classId)}
                                >
                                    {review.className}
                                </h3>
                                <div className="flex gap-1 mb-2">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={16}
                                              className={cn(i < review.rating ? "text-coral fill-coral" : "text-gray-200")}/>
                                    ))}
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleEditReview(review)}
                                    className="p-2 text-gray-400 hover:text-coral hover:bg-coral/10 rounded-xl transition-all"
                                >
                                    <Edit2 size={18}/>
                                </button>
                                <button
                                    onClick={() => {
                                        if (window.confirm('리뷰를 삭제하시겠습니까?')) {
                                            saveReviewsToStorage(allReviews.filter(r => r.id !== review.id));
                                            showToast('리뷰가 삭제되었습니다.');
                                        }
                                    }}
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                >
                                    <Trash2 size={18}/>
                                </button>
                            </div>
                        </div>
                        {review.image && (
                            <div className="mb-4 rounded-2xl overflow-hidden max-w-sm border border-coral/10">
                                <img src={review.image} alt="Review" className="w-full h-auto"/>
                            </div>
                        )}
                        <p className="text-gray-600 leading-relaxed mb-4">{review.content}</p>
                        <span className="text-sm text-gray-400">{review.date}</span>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderFreelancerDashboard = () => (
        <div className="space-y-12">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div
                    className="bg-white rounded-[32px] p-8 border border-coral/10 shadow-sm bg-gradient-to-br from-white to-coral/5">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-coral text-white rounded-2xl shadow-lg shadow-coral/20">
                            <CreditCard size={24}/>
                        </div>
                        <span className="font-bold text-gray-500">이번 달 예상 수익</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">2,450,000원</p>
                    <p className="text-sm text-green-500 font-bold mt-2">▲ 지난 달 대비 15%</p>
                </div>
                <div className="bg-white rounded-[32px] p-8 border border-coral/10 shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-coral/10 rounded-2xl text-coral">
                            <Users size={24}/>
                        </div>
                        <span className="font-bold text-gray-500">수강생 수</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">128명</p>
                    <p className="text-sm text-coral font-bold mt-2">이번 달 +12명</p>
                </div>
                <div className="bg-white rounded-[32px] p-8 border border-coral/10 shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-yellow-400/10 rounded-2xl text-yellow-500">
                            <Star size={24}/>
                        </div>
                        <span className="font-bold text-gray-500">평균 별점</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">4.9 / 5.0</p>
                    <p className="text-sm text-gray-400 mt-2">총 56개의 리뷰</p>
                </div>
            </div>

            {/* Charts Section */}
            <div className="bg-white rounded-[40px] p-8 border border-coral/10 shadow-sm">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <h3 className="text-xl font-bold text-gray-900">수익 및 수강생 추이</h3>
                    <div className="flex items-center gap-2 bg-ivory p-2 rounded-2xl">
                        <input
                            type="date"
                            value={dashboardDateRange.start}
                            onChange={(e) => setDashboardDateRange(prev => ({...prev, start: e.target.value}))}
                            className="bg-transparent text-sm font-bold text-gray-600 outline-none"
                        />
                        <span className="text-gray-300">~</span>
                        <input
                            type="date"
                            value={dashboardDateRange.end}
                            onChange={(e) => setDashboardDateRange(prev => ({...prev, end: e.target.value}))}
                            className="bg-transparent text-sm font-bold text-gray-600 outline-none"
                        />
                    </div>
                </div>

                <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={REVENUE_DATA}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0"/>
                            <XAxis dataKey="month" axisLine={false} tickLine={false}
                                   tick={{fill: '#9ca3af', fontSize: 12}} dy={10}/>
                            <YAxis yAxisId="left" axisLine={false} tickLine={false}
                                   tick={{fill: '#9ca3af', fontSize: 12}}
                                   tickFormatter={(value) => `${value / 10000}만`}/>
                            <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false}
                                   tick={{fill: '#9ca3af', fontSize: 12}}/>
                            <Tooltip
                                contentStyle={{
                                    borderRadius: '16px',
                                    border: 'none',
                                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                                }}
                            />
                            <Legend verticalAlign="top" align="right" height={36}/>
                            <Line yAxisId="left" type="monotone" dataKey="revenue" name="수익(원)" stroke="#FF7F6E"
                                  strokeWidth={4} dot={{r: 6, fill: '#FF7F6E', strokeWidth: 2, stroke: '#fff'}}
                                  activeDot={{r: 8}}/>
                            <Line yAxisId="right" type="monotone" dataKey="students" name="수강생(명)" stroke="#4ade80"
                                  strokeWidth={4} dot={{r: 6, fill: '#4ade80', strokeWidth: 2, stroke: '#fff'}}
                                  activeDot={{r: 8}}/>
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-2 gap-8 mt-12 pt-8 border-t border-coral/5">
                    <div className="text-center">
                        <p className="text-sm font-bold text-gray-400 mb-1">누적 총 수익</p>
                        <p className="text-2xl font-bold text-gray-900">15,800,000원</p>
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-bold text-gray-400 mb-1">누적 총 수강생</p>
                        <p className="text-2xl font-bold text-gray-900">482명</p>
                    </div>
                </div>
            </div>
        </div>
    );

    const handleDeleteClassClick = (id: string) => {
        setSelectedClassId(id);
        setIsDeleteConfirmModalOpen(true);
    };

    // 모달에서 삭제 확인 시 실제 API 호출 및 UI 업데이트 기능
    const handleConfirmDeleteClass = async () => {
        if (selectedClassId) {
            try {
                await deleteClass(selectedClassId);
                showToast('삭제되었습니다.');
            } catch (error) {
                showToast('삭제 중 오류가 발생했습니다.', 'error');
            } finally {
                setIsDeleteConfirmModalOpen(false);
                setSelectedClassId(null);
            }
        }
    };

    // 버튼 클릭 시 클래스 모집 상태 토글 기능을 호출하는 핸들러
    const handleToggleStatus = async (id: string) => {
        try {
            await toggleStatus(id);
            showToast('모집 상태가 변경되었습니다.');
        } catch (error) {
            showToast('상태 변경 중 오류가 발생했습니다.', 'error');
        }
    };

    const renderFreelancerClasses = () => (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">내 클래스 관리</h2>
                <button
                    onClick={() => navigate('/class/create')}
                    className="px-6 py-3 bg-coral text-white font-bold rounded-2xl hover:bg-coral/90 transition-all shadow-lg shadow-coral/20 flex items-center gap-2"
                >
                    <Plus size={20}/> 새 클래스 등록
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {teachingClasses.map(item => (
                    <div key={item.id}
                         className="bg-white rounded-[32px] p-6 border border-coral/10 flex gap-6 items-center shadow-sm group hover:border-coral transition-all">
                        <img src={item.image} alt={item.title} className="w-20 h-20 rounded-2xl object-cover"
                             referrerPolicy="no-referrer"/>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-bold text-gray-900 line-clamp-1 flex-1">{item.title}</h4>
                                <span className={cn(
                                    "px-2 py-0.5 rounded-full text-[10px] font-bold flex-shrink-0 whitespace-nowrap",
                                    item.status === 'OPEN' ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-500"
                                )}>
                  {item.status === 'OPEN' ? '모집 중' : '모집 마감'}
                </span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-400">
                                <span className="flex items-center gap-1"><Users size={14}/> 12명</span>
                                <span className="flex items-center gap-1"><Star size={14}
                                                                                className="text-coral fill-coral"/> {item.rating}</span>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <button
                                onClick={() => handleToggleStatus(item.id)}
                                className={cn(
                                    "p-2 rounded-xl transition-all",
                                    item.status === 'OPEN' ? "text-green-500 hover:bg-green-50" : "text-gray-400 hover:bg-gray-50"
                                )}
                                title={item.status === 'OPEN' ? "모집 마감하기" : "모집 시작하기"}
                            >
                                {item.status === 'OPEN' ? <CheckCircle size={18}/> : <Ban size={18}/>}
                            </button>
                            <button
                                onClick={() => navigate(`/class/edit/${item.id}`)}
                                className="p-2 text-coral hover:bg-coral/10 rounded-xl transition-all"
                                title="수정"
                            >
                                <Edit2 size={18}/>
                            </button>
                            <button
                                onClick={() => handleDeleteClassClick(item.id)}
                                className="p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 rounded-xl transition-all"
                                title="삭제"
                            >
                                <Trash2 size={18}/>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const handleSaveFreelancerProfile = async () => {
        if (freelancerProfileMissing) {
            showToast('프리랜서 등록에서 생성된 프로필만 수정할 수 있습니다.', 'error');
            return;
        }

        if (freelancerProfile.specialtyCategoryId === '') {
            showToast('전문 분야를 선택해주세요.', 'error');
            return;
        }

        try {
            setFreelancerProfileSaving(true);
            const savedProfile = await upsertMyFreelancerProfile({
                specialtyCategoryId: Number(freelancerProfile.specialtyCategoryId),
                snsLink: freelancerProfile.snsLink.trim() || undefined,
                bio: freelancerProfile.introduction,
                career: freelancerProfile.career,
                bankAccount: freelancerProfile.bankAccount,
            });

            // 기존 첨부 삭제와 신규 업로드를 저장 시점에 몰아서 처리해 화면 미리보기와 실제 저장 시점을 분리합니다.
            if (deletedPortfolioImageIds.length > 0) {
                await deleteFreelancerPortfolioImages(deletedPortfolioImageIds);
            }

            const newPortfolioFiles = freelancerProfile.portfolioImages
                .filter((image) => image.localFile)
                .map((image) => image.localFile as File);

            if (savedProfile.profileId && newPortfolioFiles.length > 0) {
                await uploadFreelancerPortfolioImages(savedProfile.profileId, newPortfolioFiles);
            }

            const refreshedProfile = await getMyFreelancerProfile();

            await refreshCurrentUser();

            revokePortfolioObjectUrls(freelancerProfile.portfolioImages);
            setFreelancerProfile(mapFreelancerProfileState(refreshedProfile));
            setDeletedPortfolioImageIds([]);

            showToast('프로필이 저장되었습니다.');
        } catch (error) {
            console.error('Error saving profile:', error);
            showToast('저장 중 오류가 발생했습니다.', 'error');
        } finally {
            setFreelancerProfileSaving(false);
        }
    };

    const handleAddFreelancerPortfolioImages = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(event.target.files || []);

        if (selectedFiles.length === 0) {
            return;
        }

        const remainingCount = MAX_PORTFOLIO_IMAGES - freelancerProfile.portfolioImages.length;
        if (remainingCount <= 0) {
            showToast(`포트폴리오 이미지는 최대 ${MAX_PORTFOLIO_IMAGES}장까지 등록할 수 있습니다.`, 'error');
            event.target.value = '';
            return;
        }

        // 프로필 관리에서도 저장 전에는 프론트 미리보기만 바꾸고 실제 업로드는 저장 버튼에서 수행합니다.
        const nextImages: PortfolioImageItem[] = selectedFiles.slice(0, remainingCount).map((file) => ({
            id: null,
            originalFileName: file.name,
            fileUrl: URL.createObjectURL(file),
            localFile: file,
        }));

        setFreelancerProfile((prev) => ({
            ...prev,
            portfolioImages: [...prev.portfolioImages, ...nextImages],
        }));
        event.target.value = '';
    };

    const handleRemoveFreelancerPortfolioImage = (index: number) => {
        setFreelancerProfile((prev) => {
            const targetImage = prev.portfolioImages[index];
            if (!targetImage) {
                return prev;
            }

            if (targetImage.id !== null) {
                // 기존 서버 첨부는 즉시 삭제하지 않고 저장 시점에만 삭제 요청을 보내도록 모아둡니다.
                setDeletedPortfolioImageIds((current) => [...current, targetImage.id as number]);
            }

            if (targetImage.localFile && targetImage.fileUrl.startsWith('blob:')) {
                URL.revokeObjectURL(targetImage.fileUrl);
            }

            return {
                ...prev,
                portfolioImages: prev.portfolioImages.filter((_, currentIndex) => currentIndex !== index),
            };
        });
    };

    const handlePreviewFreelancerProfile = () => {
        if (freelancerProfileMissing || freelancerProfileLoading || !freelancerProfile.freelancerId) {
            return;
        }

        // 프로필 상세는 freelancerId 기준 공개 페이지로 이동합니다.
        navigate(`/freelancer/${freelancerProfile.freelancerId}`);
    };

    const renderFreelancerProfile = () => (
        <div className="max-w-3xl space-y-10">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">프리랜서 프로필 관리</h2>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handlePreviewFreelancerProfile}
                        disabled={freelancerProfileMissing || freelancerProfileLoading}
                        className="px-6 py-4 bg-white text-coral border border-coral/20 font-bold rounded-2xl hover:bg-coral/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        프로필 확인
                    </button>
                    <button
                        onClick={handleSaveFreelancerProfile}
                        disabled={freelancerProfileSaving}
                        className="px-8 py-4 bg-coral text-white font-bold rounded-2xl hover:bg-coral/90 transition-all shadow-lg shadow-coral/20 flex items-center gap-2"
                    >
                        <Save size={20}/> {freelancerProfileSaving ? '저장 중...' : '저장하기'}
                    </button>
                </div>
            </div>

            <div className="space-y-8 bg-white p-10 rounded-[40px] border border-coral/10 shadow-sm">
                {freelancerProfileLoading && (
                    <div className="rounded-2xl bg-ivory px-4 py-3 text-sm text-gray-500">
                        프리랜서 프로필을 불러오는 중입니다.
                    </div>
                )}
                {freelancerProfileMissing && (
                    <div className="rounded-2xl bg-yellow-50 px-4 py-3 text-sm text-yellow-700">
                        아직 생성된 프리랜서 프로필이 없습니다. 프리랜서 등록 화면에서 먼저 프로필을 생성해야 합니다.
                    </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                        <label className="text-sm font-bold text-gray-700 ml-1">활동명</label>
                        <input
                            type="text"
                            value={freelancerProfile.name}
                            disabled
                            className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-2 border-transparent outline-none transition-all font-bold text-gray-500 cursor-not-allowed"
                            placeholder="계정 설정에서 수정할 수 있습니다."
                        />
                        <p className="text-xs text-gray-400 ml-1">활동명은 계정 설정에서 수정할 수 있습니다.</p>
                    </div>
                    <div className="space-y-3">
                        <label className="text-sm font-bold text-gray-700 ml-1">전문 분야</label>
                        <select
                            value={freelancerProfile.specialtyCategoryId}
                            onChange={(e) => {
                                const selectedId = e.target.value === '' ? '' : Number(e.target.value);
                                const selectedCategory = categories.find(category => category.id === selectedId);
                                setFreelancerProfile(prev => ({
                                    ...prev,
                                    specialtyCategoryId: selectedId,
                                    specialtyCategoryName: selectedCategory?.name || '',
                                }));
                            }}
                            className="w-full px-6 py-4 bg-ivory rounded-2xl border-2 border-transparent focus:border-coral outline-none transition-all font-bold"
                        >
                            <option value="">전문 분야를 선택해주세요.</option>
                            {categories.map(category => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="text-sm font-bold text-gray-700 ml-1">한 줄 소개</label>
                    <textarea
                        value={freelancerProfile.introduction}
                        onChange={(e) => setFreelancerProfile(prev => ({...prev, introduction: e.target.value}))}
                        className="w-full px-6 py-4 bg-ivory rounded-2xl border-2 border-transparent focus:border-coral outline-none transition-all min-h-[100px] resize-none"
                        placeholder="자신을 한 줄로 소개해주세요."
                    />
                </div>

                <div className="space-y-3">
                    <label className="text-sm font-bold text-gray-700 ml-1">경력 사항</label>
                    <textarea
                        value={freelancerProfile.career}
                        onChange={(e) => setFreelancerProfile(prev => ({...prev, career: e.target.value}))}
                        className="w-full px-6 py-4 bg-ivory rounded-2xl border-2 border-transparent focus:border-coral outline-none transition-all min-h-[150px] resize-none"
                        placeholder="주요 경력을 입력해주세요."
                    />
                </div>

                <div className="space-y-3">
                    <label className="text-sm font-bold text-gray-700 ml-1">포트폴리오 링크</label>
                    <div className="relative">
                        <BookOpen className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
                        <input
                            type="text"
                            value={freelancerProfile.snsLink}
                            onChange={(e) => setFreelancerProfile(prev => ({...prev, snsLink: e.target.value}))}
                            placeholder="https://..."
                            className="w-full pl-12 pr-6 py-4 bg-ivory rounded-2xl border-2 border-transparent focus:border-coral outline-none transition-all"
                            autoComplete="off"
                        />
                    </div>
                    <p className="text-xs text-gray-400 ml-1">선택 입력입니다. 링크 없이 포트폴리오 이미지만 저장해도 됩니다.</p>
                </div>

                <div className="space-y-3">
                    <label className="text-sm font-bold text-gray-700 ml-1">정산 계좌</label>
                    <input
                        type="text"
                        value={freelancerProfile.bankAccount}
                        onChange={(e) => setFreelancerProfile(prev => ({...prev, bankAccount: e.target.value}))}
                        placeholder="은행명 / 계좌번호"
                        className="w-full px-6 py-4 bg-ivory rounded-2xl border-2 border-transparent focus:border-coral outline-none transition-all"
                    />
                </div>

                <div className="space-y-3">
                    <label className="text-sm font-bold text-gray-700 ml-1">활동 지역</label>
                    <div className="relative">
                        <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
                        <input
                            type="text"
                            value={freelancerProfile.location}
                            disabled
                            className="w-full pl-12 pr-6 py-4 bg-ivory rounded-2xl border-2 border-transparent focus:border-coral outline-none transition-all"
                        />
                    </div>
                    <p className="text-xs text-gray-400 ml-1">계정 설정의 주소 정보가 표시됩니다.</p>
                </div>

                <div className="space-y-4">
                    <label className="text-sm font-bold text-gray-700 ml-1">포트폴리오 이미지</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {freelancerProfile.portfolioImages.map((image, idx) => (
                            <div key={`${image.id ?? image.originalFileName}-${idx}`}
                                 className="relative aspect-square rounded-2xl overflow-hidden group border border-coral/10 bg-white shadow-sm">
                                <SafeImage src={image.fileUrl} alt={image.originalFileName}
                                           className="w-full h-full object-cover"/>
                                <button
                                    type="button"
                                    onClick={() => handleRemoveFreelancerPortfolioImage(idx)}
                                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/75 transition-colors"
                                >
                                    <X size={16}/>
                                </button>
                            </div>
                        ))}
                        {freelancerProfile.portfolioImages.length < MAX_PORTFOLIO_IMAGES && (
                            <button
                                type="button"
                                onClick={() => portfolioInputRef.current?.click()}
                                className="aspect-square rounded-2xl border-2 border-dashed border-coral/20 flex flex-col items-center justify-center text-coral bg-ivory/50 hover:border-coral hover:bg-coral/5 transition-all"
                            >
                                <Plus size={24}/>
                                <span className="text-[10px] font-bold mt-1">추가</span>
                            </button>
                        )}
                    </div>
                    <input
                        ref={portfolioInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleAddFreelancerPortfolioImages}
                    />
                    <p className="text-xs text-gray-400 ml-1">최대 10장까지 등록할 수 있습니다.</p>
                </div>
            </div>
        </div>
    );

    // Admin Handlers
    const handleUpdateUserRole = async (userId: number, newRole: UserRole) => {
        try {
            const updatedUser = await updateMemberRole(userId, newRole);
            setAdminUsers(prev => prev.map(u => u.id === userId ? updatedUser : u));
            alert('사용자 권한이 변경되었습니다.');
        } catch (error) {
            if (axios.isAxiosError(error)) {
                showToast(error.response?.data?.message || '사용자 권한 변경 중 오류가 발생했습니다.', 'error');
                return;
            }
            showToast('사용자 권한 변경 중 오류가 발생했습니다.', 'error');
        }
    };

    const getAvailableAdminRoles = (targetUser: AdminMemberListItem): UserRole[] => {
        const isSelf = targetUser.email === user?.email;
        if (isSelf) {
            return [targetUser.role as UserRole];
        }

        if (targetUser.role === 'ROLE_FREELANCER') {
            return ['ROLE_FREELANCER', 'ROLE_USER'];
        }

        if (targetUser.role === 'ROLE_ADMIN') {
            return ['ROLE_ADMIN', 'ROLE_USER'];
        }

        return ['ROLE_USER', 'ROLE_ADMIN'];
    };

    const handleDeleteUser = (targetUser: AdminMemberListItem) => {
        const isRestoreAction = targetUser.isDeleted;
        const actionLabel = isRestoreAction ? '탈퇴를 취소하시겠습니까?' : '정말 이 사용자를 탈퇴 처리하시겠습니까?';
        if (window.confirm(actionLabel)) {
            (async () => {
                try {
                    const updatedUser = await toggleMemberDeleted(targetUser.id);
                    setAdminUsers(prev => prev.map(u => u.id === targetUser.id ? updatedUser : u));
                    alert(isRestoreAction ? '사용자 탈퇴가 취소되었습니다.' : '사용자가 탈퇴 처리되었습니다.');
                } catch (error) {
                    if (axios.isAxiosError(error)) {
                        showToast(error.response?.data?.message || '사용자 탈퇴 처리 중 오류가 발생했습니다.', 'error');
                        return;
                    }
                    showToast('사용자 탈퇴 처리 중 오류가 발생했습니다.', 'error');
                }
            })();
        }
    };

    const handleApproveFreelancer = async (profileId: number) => {
        try {
            await approveFreelancerProfile(profileId);
            setPendingFreelancerProfiles(prev => prev.filter(profile => profile.profileId !== profileId));
            showToast('프리랜서 승인이 완료되었습니다.');
        } catch (error) {
            showToast('프리랜서 승인 처리 중 오류가 발생했습니다.', 'error');
        }
    };

    const handleRejectFreelancerClick = (id: number) => {
        setSelectedApprovalId(id);
        setIsApprovalRejectModalOpen(true);
    };

    const handleConfirmApprovalReject = async () => {
        if (!approvalRejectReason.trim()) {
            alert('거절 사유를 입력해주세요.');
            return;
        }
        if (selectedApprovalId) {
            try {
                await rejectFreelancerProfile(selectedApprovalId);
                setPendingFreelancerProfiles(prev => prev.filter(profile => profile.profileId !== selectedApprovalId));
                setIsApprovalRejectModalOpen(false);
                setApprovalRejectReason('');
                setSelectedApprovalId(null);
                showToast('프리랜서 요청이 반려되었습니다.');
            } catch (error) {
                showToast('프리랜서 반려 처리 중 오류가 발생했습니다.', 'error');
            }
        }
    };

    const handleSoftDeleteReport = (reportId: string) => {
        if (window.confirm('해당 콘텐츠를 삭제(논리 삭제)하시겠습니까?')) {
            setAdminReports(prev => prev.map(r => r.id === reportId ? {...r, isDeleted: true} : r));
            alert('콘텐츠가 논리 삭제되었습니다.');
        }
    };

    const renderAdminHome = () => (
        <div className="space-y-8">
            <h2 className="text-2xl font-bold text-gray-900">관리자 홈</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <StatCard
                    title="전체 사용자 수"
                    value={`${totalUsers}명`}
                    description="현재 플랫폼에 가입한 전체 회원 수"
                    icon={Users}
                    iconClassName="bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white"
                />

                <StatCard
                    title="오늘 결제 금액"
                    value={`${todayRevenue.toLocaleString('ko-KR')}원`}
                    description="오늘 생성된 주문 금액 합계"
                    icon={CreditCard}
                    iconClassName="bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white"
                />

                <ActiveClassCard activeClasses={activeClasses}/>

                <StatCard
                    title="프리랜서 승인 요청 건수"
                    value={`${pendingFreelancerProfiles.length}건`}
                    description="현재 검토 대기 중인 승인 요청"
                    icon={BadgeCheck}
                    iconClassName="bg-amber-50 text-amber-600 group-hover:bg-amber-500 group-hover:text-white"
                    action={(
                        <button
                            type="button"
                            onClick={() => handleMenuChange('admin_approvals')}
                            className="inline-flex items-center gap-2 rounded-full bg-coral px-4 py-2 text-sm font-bold text-white transition-all hover:bg-coral/90 shadow-lg shadow-coral/20"
                        >
                            승인하러 가기
                            <ChevronRight size={16}/>
                        </button>
                    )}
                />
            </div>

            <NotificationSection notifications={adminNotifications}/>
        </div>
    );

    const renderAdminUsers = () => {
        const filteredUsers = adminUsers
            .filter(u => u.name.includes(userSearch) || String(u.id).includes(userSearch))
            .filter(u => userFilter === 'ALL' ? true : u.role === userFilter)
            .sort((a, b) => {
                if (userSort === 'joinedAt') return b.joinedAt.localeCompare(a.joinedAt);
                return a.role.localeCompare(b.role);
            });

        const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
        const paginatedUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

        return (
            <div className="space-y-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <h2 className="text-2xl font-bold text-gray-900">사용자 관리</h2>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
                            <input
                                type="text"
                                placeholder="ID 또는 이름 검색"
                                value={userSearch}
                                onChange={(e) => setUserSearch(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-ivory rounded-2xl border-2 border-transparent focus:border-coral outline-none transition-all text-sm"
                            />
                        </div>
                        <select
                            value={userFilter}
                            onChange={(e) => setUserFilter(e.target.value)}
                            className="px-4 py-3 bg-ivory rounded-2xl border-2 border-transparent focus:border-coral outline-none transition-all text-sm font-bold text-gray-600"
                        >
                            <option value="ALL">전체 등급</option>
                            <option value="ROLE_USER">일반 유저</option>
                            <option value="ROLE_FREELANCER">프리랜서</option>
                            <option value="ROLE_ADMIN">관리자</option>
                        </select>
                    </div>
                </div>

                {adminUsersLoading && (
                    <div className="rounded-2xl bg-ivory px-4 py-3 text-sm text-gray-500">
                        회원 목록을 불러오는 중입니다.
                    </div>
                )}

                <div className="bg-white rounded-[32px] border border-coral/10 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                            <tr className="bg-ivory border-b border-coral/10">
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">ID / 이름</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">생년월일</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">등급</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">연락처 / 주소</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">가입일 / 상태</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-center">액션</th>
                            </tr>
                            </thead>
                            <tbody>
                            {paginatedUsers.map(u => (
                                <tr key={u.id}
                                    className="border-b border-coral/5 hover:bg-ivory/30 transition-colors group">
                                    <td className="px-6 py-4">
                                        <p className="font-bold text-gray-900 text-sm">{u.name}</p>
                                        <p className="text-[10px] text-gray-400">{u.id}</p>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{u.birth}</td>
                                    <td className="px-6 py-4">
                                        <select
                                            value={u.role}
                                            onChange={(e) => handleUpdateUserRole(u.id, e.target.value as UserRole)}
                                            disabled={u.email === user?.email}
                                            className="bg-transparent text-xs font-bold text-coral outline-none cursor-pointer disabled:text-gray-400 disabled:cursor-not-allowed"
                                        >
                                            {getAvailableAdminRoles(u).map(role => (
                                                <option key={role} value={role}>
                                                    {role === 'ROLE_USER' ? 'USER' : role === 'ROLE_FREELANCER' ? 'FREELANCER' : 'ADMIN'}
                                                </option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm text-gray-600">{u.phone}</p>
                                        <p className="text-[10px] text-gray-400">{u.address}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm text-gray-600">{u.joinedAt}</p>
                                        <span className={cn(
                                            "text-[10px] font-bold",
                                            u.isDeleted ? "text-red-500" : "text-green-500"
                                        )}>
                        {u.isDeleted ? (u.quitAt && u.quitAt !== 'null' ? `탈퇴 (${u.quitAt})` : '탈퇴') : '정상'}
                      </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-center gap-2">
                                            {u.email !== user?.email && (
                                                <button
                                                    onClick={() => handleDeleteUser(u)}
                                                    className={cn(
                                                        "px-3 py-1.5 text-xs font-bold rounded-lg transition-all",
                                                        u.isDeleted
                                                            ? "text-green-600 bg-green-50 hover:bg-green-100"
                                                            : "text-red-500 bg-red-50 hover:bg-red-100",
                                                    )}
                                                    title={u.isDeleted ? "탈퇴 취소" : "탈퇴 처리"}
                                                >
                                                    {u.isDeleted ? '탈퇴 취소' : '탈퇴'}
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination */}
                <div className="flex justify-center items-center gap-2">
                    {[...Array(totalPages)].map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrentPage(i + 1)}
                            className={cn(
                                "w-10 h-10 rounded-xl font-bold transition-all",
                                currentPage === i + 1
                                    ? "bg-coral text-white shadow-lg shadow-coral/20"
                                    : "bg-white text-gray-400 hover:bg-ivory border border-coral/5"
                            )}
                        >
                            {i + 1}
                        </button>
                    ))}
                </div>
            </div>
        );
    };

    const renderAdminReports = () => (
        <div className="space-y-8">
            <h2 className="text-2xl font-bold text-gray-900">신고 및 콘텐츠 관리</h2>
            <div className="bg-white rounded-[32px] border border-coral/10 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                    <tr className="bg-ivory border-b border-coral/10">
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">유형</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">신고 사유</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">신고일</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">상태</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-center">액션</th>
                    </tr>
                    </thead>
                    <tbody>
                    {adminReports.map(report => (
                        <tr key={report.id} className="border-b border-coral/5 hover:bg-ivory/30 transition-colors">
                            <td className="px-6 py-4">
                                <span
                                    className="px-2 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold rounded-md">{report.type}</span>
                            </td>
                            <td className="px-6 py-4">
                                <p className="text-sm text-gray-900">{report.isDeleted ?
                                    <span className="text-red-400 italic">삭제된 게시글입니다</span> : report.reason}</p>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">{report.reportedAt}</td>
                            <td className="px-6 py-4">
                  <span className={cn(
                      "text-xs font-bold",
                      report.status === 'PENDING' ? "text-coral" : "text-gray-400"
                  )}>
                    {report.status === 'PENDING' ? '처리 대기' : '처리 완료'}
                  </span>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex justify-center gap-2">
                                    {!report.isDeleted && (
                                        <button
                                            onClick={() => handleSoftDeleteReport(report.id)}
                                            className="px-3 py-1.5 bg-red-50 text-red-500 text-xs font-bold rounded-lg hover:bg-red-100 transition-all"
                                        >
                                            삭제
                                        </button>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderAdminApprovals = () => (
        <div className="space-y-8">
            <h2 className="text-2xl font-bold text-gray-900">프리랜서 승인 관리</h2>
            {pendingProfilesLoading && (
                <div className="rounded-2xl bg-ivory px-4 py-3 text-sm text-gray-500">
                    승인 대기 목록을 불러오는 중입니다.
                </div>
            )}
            {!pendingProfilesLoading && pendingFreelancerProfiles.length === 0 && (
                <div className="bg-white rounded-[32px] p-8 border border-coral/10 shadow-sm text-gray-400">
                    승인 대기 중인 프리랜서 신청이 없습니다.
                </div>
            )}
            <div className="grid grid-cols-1 gap-6">
                {pendingFreelancerProfiles.map(approval => (
                    <div key={approval.profileId}
                         className="bg-white rounded-[32px] p-8 border border-coral/10 shadow-sm">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div className="flex-1 space-y-4">
                                <div className="flex items-center gap-3">
                                    <h3 className="text-xl font-bold text-gray-900">{approval.memberName}</h3>
                                    <span
                                        className="px-3 py-1 bg-ivory text-coral text-[10px] font-bold rounded-full">{approval.specialtyCategoryName}</span>
                                    <span className={cn(
                                        "px-3 py-1 text-[10px] font-bold rounded-full",
                                        approval.approvalStatusCode === 'W' ? "bg-yellow-100 text-yellow-600" :
                                            approval.approvalStatusCode === 'A' ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                                    )}>
                    {approval.approvalStatusName || approval.approvalStatusCode}
                  </span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-gray-400 font-bold mb-1">이메일</p>
                                        <p className="text-gray-600">{approval.memberEmail}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-400 font-bold mb-1">신청일</p>
                                        <p className="text-gray-600">{approval.appliedAt.slice(0, 10)}</p>
                                    </div>
                                    <div className="md:col-span-2">
                                        <p className="text-gray-400 font-bold mb-1">경력 사항</p>
                                        <p className="text-gray-600 whitespace-pre-line">{approval.career || '-'}</p>
                                    </div>
                                    <div className="md:col-span-2">
                                        <p className="text-gray-400 font-bold mb-1">SNS 링크</p>
                                        {approval.snsLink ? (
                                            <a href={approval.snsLink} target="_blank" rel="noreferrer"
                                               className="text-coral hover:underline">{approval.snsLink}</a>
                                        ) : (
                                            <p className="text-gray-600">-</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                            {approval.approvalStatusCode === 'W' && (
                                <div className="flex md:flex-col gap-3 w-full md:w-auto">
                                    <button
                                        onClick={() => handleApproveFreelancer(approval.profileId)}
                                        className="flex-1 md:w-32 py-3 bg-coral text-white font-bold rounded-2xl hover:bg-coral/90 transition-all shadow-lg shadow-coral/20 flex items-center justify-center gap-2"
                                    >
                                        <Check size={18}/> 수락
                                    </button>
                                    <button
                                        onClick={() => handleRejectFreelancerClick(approval.profileId)}
                                        className="flex-1 md:w-32 py-3 bg-gray-100 text-gray-600 font-bold rounded-2xl hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Ban size={18}/> 거절
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderSettings = () => (
        <div className="max-w-2xl space-y-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">계정 설정</h2>

            {/* Profile Image Change */}
            <div className="flex flex-col items-center gap-4 mb-10 pb-8 border-b border-coral/5">
                <div className="relative group">
                    <div
                        className="w-32 h-32 bg-coral/10 rounded-full flex items-center justify-center border-4 border-ivory shadow-inner overflow-hidden">
                        <img
                            src={profileImageSrc}
                            alt="Profile"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleProfileImageChange}
                        accept="image/*"
                        className="hidden"
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-0 right-0 p-2.5 bg-coral text-white rounded-full shadow-lg hover:scale-110 transition-all"
                    >
                        <Edit2 size={18}/>
                    </button>
                </div>
                <p className="text-sm font-medium text-gray-500">프로필 사진 변경</p>
                <button
                    type="button"
                    onClick={handleSetDefaultProfileImage}
                    className="text-sm font-bold text-coral hover:underline"
                >
                    기본 이미지로 설정
                </button>
            </div>

            <div className="space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-500 ml-1">이름</label>
                    <input
                        type="text"
                        value={settingsForm.name}
                        onChange={(e) => setSettingsForm(prev => ({...prev, name: e.target.value}))}
                        className="w-full px-6 py-4 bg-ivory rounded-2xl border-2 border-transparent focus:border-coral outline-none transition-all"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-500 ml-1">이메일</label>
                    <input
                        type="email"
                        value={settingsForm.email}
                        disabled
                        className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-2 border-transparent text-gray-400 cursor-not-allowed"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-500 ml-1">전화번호</label>
                    <input
                        type="tel"
                        value={settingsForm.phone}
                        onChange={(e) => setSettingsForm(prev => ({...prev, phone: formatPhoneNumber(e.target.value)}))}
                        className="w-full px-6 py-4 bg-ivory rounded-2xl border-2 border-transparent focus:border-coral outline-none transition-all"
                    />
                </div>

                <div className="space-y-4">
                    <label className="text-sm font-bold text-gray-500 ml-1">활동 지역</label>
                    <div className="grid grid-cols-2 gap-4">
                        <select
                            value={selectedCity}
                            onChange={(e) => {
                                setSelectedCity(e.target.value);
                                setSelectedDistrict('');
                            }}
                            className="w-full px-6 py-4 bg-ivory rounded-2xl border-2 border-transparent focus:border-coral outline-none transition-all appearance-none cursor-pointer"
                        >
                            <option value="">시/도 선택</option>
                            {REGIONS.map(region => (
                                <option key={region.name} value={region.name}>{region.name}</option>
                            ))}
                        </select>
                        <select
                            value={selectedDistrict}
                            onChange={(e) => setSelectedDistrict(e.target.value)}
                            disabled={!selectedCity}
                            className="w-full px-6 py-4 bg-ivory rounded-2xl border-2 border-transparent focus:border-coral outline-none transition-all appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <option value="">시/군/구 선택</option>
                            {REGIONS.find(r => r.name === selectedCity)?.districts.map(district => (
                                <option key={district} value={district}>{district}</option>
                            ))}
                        </select>
                    </div>
                    <p className="text-xs text-gray-400 ml-1">활동 지역은 계정 설정에서 수정하면 프리랜서 프로필에도 바로 반영됩니다.</p>
                </div>

                <div className="pt-2">
                    <button
                        onClick={handleChangePassword}
                        className="text-sm font-bold text-coral hover:underline flex items-center gap-1"
                    >
                        비밀번호 변경
                    </button>
                </div>

                <div className="pt-4">
                    <button
                        onClick={handleSaveChanges}
                        disabled={settingsSaving}
                        className="w-full py-4 bg-coral text-white font-bold rounded-2xl hover:bg-coral/90 transition-all shadow-lg shadow-coral/20 disabled:opacity-70"
                    >
                        {settingsSaving ? '저장 중...' : '변경사항 저장하기'}
                    </button>
                </div>
            </div>

            <div className="pt-12 border-t border-coral/10">
                <button
                    onClick={handleWithdraw}
                    className="text-gray-400 hover:text-red-500 font-medium flex items-center gap-2 transition-colors"
                >
                    회원 탈퇴하기
                </button>
            </div>
        </div>
    );

    const learningItems = [
        {id: 'activity', label: '수강 관리', icon: Heart},
        {id: 'my_requests', label: '클래스 요청 관리', icon: BookOpen},
        {id: 'reviews', label: '나의 리뷰', icon: MessageSquare},
        {id: 'pick', label: 'Pick', icon: Star},
        {id: 'following', label: '팔로잉', icon: Users},
    ];

    const teachingItems = [
        {id: 'freelancer_dashboard', label: '수익 대시보드', icon: TrendingUp},
        {id: 'freelancer_classes', label: '내 클래스 관리', icon: LayoutDashboard},
        {id: 'freelancer_students', label: '수강생 관리', icon: CheckCircle},
        {id: 'freelancer_profile', label: '프로필 관리', icon: User},
    ];

    const adminItems = [
        {id: 'admin_home', label: '관리자 홈', icon: Shield},
        {id: 'admin_users', label: '사용자 관리', icon: Users},
        {id: 'admin_reports', label: '신고/콘텐츠 관리', icon: AlertCircle},
        {id: 'admin_approvals', label: '프리랜서 승인', icon: BadgeCheck},
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                {/* Sidebar */}
                <aside className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-[40px] p-8 shadow-sm border border-coral/5 text-center">
                        <div
                            className="w-24 h-24 bg-coral/10 rounded-full mx-auto mb-4 flex items-center justify-center border-4 border-ivory shadow-inner overflow-hidden">
                            <img
                                src={profileImageSrc}
                                alt="Profile"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="flex items-center justify-center gap-1 mb-1">
                            <h2 className="text-xl font-bold text-gray-900">
                                {displayName}
                            </h2>
                            {userRole !== 'ROLE_USER' && <BadgeCheck size={20} className="text-coral"/>}
                        </div>
                        <p className="text-sm text-gray-400">{userRoleLabel}</p>
                    </div>

                    <nav className="bg-white rounded-[40px] p-4 shadow-sm border border-coral/5 overflow-hidden">
                        <div className="space-y-6">
                            {/* Learning Section */}
                            <div>
                                <h3 className="px-4 mb-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">배우는
                                    포근</h3>
                                <div className="space-y-1">
                                    {learningItems.map((item) => (
                                        <button
                                            key={item.id}
                                            onClick={() => handleMenuChange(item.id as MenuType)}
                                            className={cn(
                                                "w-full flex items-center justify-between p-4 rounded-2xl transition-all group",
                                                activeMenu === item.id
                                                    ? "bg-coral/10 text-coral font-bold"
                                                    : "text-gray-600 hover:bg-ivory"
                                            )}
                                        >
                      <span className="flex items-center gap-3">
                        <item.icon size={20}
                                   className={cn(activeMenu === item.id ? "text-coral" : "text-gray-400 group-hover:text-coral")}/>
                          {item.label}
                      </span>
                                            <ChevronRight size={18}
                                                          className={cn(activeMenu === item.id ? "text-coral" : "text-gray-300")}/>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Teaching Section (Freelancer Only) */}
                            {userRole === 'ROLE_FREELANCER' && (
                                <div>
                                    <h3 className="px-4 mb-2 text-[10px] font-bold text-coral uppercase tracking-wider">나누는
                                        포근</h3>
                                    <div className="space-y-1">
                                        {teachingItems.map((item) => (
                                            <button
                                                key={item.id}
                                                onClick={() => handleMenuChange(item.id as MenuType)}
                                                className={cn(
                                                    "w-full flex items-center justify-between p-4 rounded-2xl transition-all group",
                                                    activeMenu === item.id
                                                        ? "bg-coral text-white font-bold shadow-lg shadow-coral/20"
                                                        : "text-gray-600 hover:bg-coral/5 hover:text-coral"
                                                )}
                                            >
                        <span className="flex items-center gap-3">
                          <item.icon size={20}
                                     className={cn(activeMenu === item.id ? "text-white" : "text-gray-400 group-hover:text-coral")}/>
                            {item.label}
                        </span>
                                                <ChevronRight size={18}
                                                              className={cn(activeMenu === item.id ? "text-white" : "text-gray-300")}/>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Admin Section */}
                            {userRole === 'ROLE_ADMIN' && (
                                <div>
                                    <h3 className="px-4 mb-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">관리자
                                        메뉴</h3>
                                    <div className="space-y-1">
                                        {adminItems.map((item) => (
                                            <button
                                                key={item.id}
                                                onClick={() => handleMenuChange(item.id as MenuType)}
                                                className={cn(
                                                    "w-full flex items-center justify-between p-4 rounded-2xl transition-all group",
                                                    activeMenu === item.id
                                                        ? "bg-gray-900 text-white font-bold"
                                                        : "text-gray-600 hover:bg-ivory"
                                                )}
                                            >
                        <span className="flex items-center gap-3">
                          <item.icon size={20}
                                     className={cn(activeMenu === item.id ? "text-white" : "text-gray-400 group-hover:text-gray-900")}/>
                            {item.label}
                        </span>
                                                <ChevronRight size={18}
                                                              className={cn(activeMenu === item.id ? "text-white" : "text-gray-300")}/>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="pt-2 border-t border-coral/5">
                                <button
                                    onClick={() => handleMenuChange('settings')}
                                    className={cn(
                                        "w-full flex items-center justify-between p-4 rounded-2xl transition-all group",
                                        activeMenu === 'settings'
                                            ? "bg-coral/10 text-coral font-bold"
                                            : "text-gray-600 hover:bg-ivory"
                                    )}
                                >
                  <span className="flex items-center gap-3">
                    <Settings size={20}
                              className={cn(activeMenu === 'settings' ? "text-coral" : "text-gray-400 group-hover:text-coral")}/>
                    계정 설정
                  </span>
                                    <ChevronRight size={18}
                                                  className={cn(activeMenu === 'settings' ? "text-coral" : "text-gray-300")}/>
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center justify-between p-4 text-gray-600 hover:bg-ivory rounded-2xl transition-all"
                                >
                                    <span className="flex items-center gap-3"><LogOut size={20}/> 로그아웃</span>
                                    <ChevronRight size={18}/>
                                </button>
                            </div>
                        </div>
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="lg:col-span-3 min-h-[600px] space-y-8">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeMenu}
                            initial={{opacity: 0, x: 20}}
                            animate={{opacity: 1, x: 0}}
                            exit={{opacity: 0, x: -20}}
                            transition={{duration: 0.2}}
                        >
                            {detailLoading && (
                                <div className="mb-6 rounded-2xl bg-ivory px-4 py-3 text-sm text-gray-500">
                                    회원 정보를 불러오는 중입니다.
                                </div>
                            )}
                            {detailError && (
                                <div className="mb-6 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-500">
                                    {detailError}
                                </div>
                            )}
                            {activeMenu === 'activity' && renderActivity()}
                            {activeMenu === 'my_requests' && <MyRequestManage/>}
                            {activeMenu === 'reviews' && renderReviews()}
                            {activeMenu === 'pick' && renderPick()}
                            {activeMenu === 'following' && renderFollowing()}
                            {activeMenu === 'freelancer_dashboard' && renderFreelancerDashboard()}
                            {activeMenu === 'freelancer_classes' && renderFreelancerClasses()}
                            {activeMenu === 'freelancer_students' && renderEnrollmentManagement()}
                            {activeMenu === 'freelancer_profile' && renderFreelancerProfile()}
                            {activeMenu === 'admin_home' && renderAdminHome()}
                            {activeMenu === 'admin_users' && renderAdminUsers()}
                            {activeMenu === 'admin_reports' && renderAdminReports()}
                            {activeMenu === 'admin_approvals' && renderAdminApprovals()}
                            {activeMenu === 'settings' && renderSettings()}
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>

            {/* Review Modal */}
            <ReviewModal
                isOpen={isReviewModalOpen}
                onClose={() => setIsReviewModalOpen(false)}
                onSave={handleSaveReview}
                mode={reviewMode}
                initialData={selectedReviewData}
            />

            <AnimatePresence>
                {isPasswordModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{opacity: 0}}
                            animate={{opacity: 1}}
                            exit={{opacity: 0}}
                            onClick={handleClosePasswordModal}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{opacity: 0, scale: 0.9, y: 20}}
                            animate={{opacity: 1, scale: 1, y: 0}}
                            exit={{opacity: 0, scale: 0.9, y: 20}}
                            className="relative w-full max-w-md bg-white rounded-[40px] p-10 shadow-2xl"
                        >
                            <button
                                onClick={handleClosePasswordModal}
                                className="absolute top-6 right-6 text-gray-400 hover:text-coral transition-colors"
                            >
                                <X size={24}/>
                            </button>

                            <h2 className="text-2xl font-bold text-gray-900 mb-2">비밀번호 변경</h2>
                            <p className="text-gray-500 mb-8">현재 비밀번호와 다른 8자 이상의 새 비밀번호를 입력해주세요.</p>

                            <div className="space-y-4">
                                <input
                                    type="password"
                                    value={passwordForm.currentPassword}
                                    onChange={(e) => setPasswordForm(prev => ({
                                        ...prev,
                                        currentPassword: e.target.value
                                    }))}
                                    className="w-full px-6 py-4 bg-ivory rounded-2xl border-2 border-transparent focus:border-coral outline-none transition-all"
                                    placeholder="현재 비밀번호"
                                />
                                <input
                                    type="password"
                                    value={passwordForm.newPassword}
                                    onChange={(e) => setPasswordForm(prev => ({...prev, newPassword: e.target.value}))}
                                    className="w-full px-6 py-4 bg-ivory rounded-2xl border-2 border-transparent focus:border-coral outline-none transition-all"
                                    placeholder="새 비밀번호"
                                />
                                <input
                                    type="password"
                                    value={passwordForm.confirmPassword}
                                    onChange={(e) => setPasswordForm(prev => ({
                                        ...prev,
                                        confirmPassword: e.target.value
                                    }))}
                                    className="w-full px-6 py-4 bg-ivory rounded-2xl border-2 border-transparent focus:border-coral outline-none transition-all"
                                    placeholder="새 비밀번호 확인"
                                />
                                <button
                                    onClick={handleSubmitPasswordChange}
                                    disabled={passwordSaving}
                                    className="w-full py-5 bg-coral text-white font-bold rounded-3xl hover:bg-coral/90 transition-all shadow-xl shadow-coral/20 text-lg mt-4 disabled:opacity-70"
                                >
                                    {passwordSaving ? '변경 중...' : '비밀번호 변경하기'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isRejectModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{opacity: 0}}
                            animate={{opacity: 1}}
                            exit={{opacity: 0}}
                            onClick={() => setIsRejectModalOpen(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{opacity: 0, scale: 0.9, y: 20}}
                            animate={{opacity: 1, scale: 1, y: 0}}
                            exit={{opacity: 0, scale: 0.9, y: 20}}
                            className="relative w-full max-w-md bg-white rounded-[40px] p-10 shadow-2xl"
                        >
                            <button
                                onClick={() => setIsRejectModalOpen(false)}
                                className="absolute top-6 right-6 text-gray-400 hover:text-coral transition-colors"
                            >
                                <X size={24}/>
                            </button>

                            <h2 className="text-2xl font-bold text-gray-900 mb-2">수강 신청 거절</h2>
                            <p className="text-gray-500 mb-8">거절 사유를 입력해주세요. 신청자에게 전달됩니다.</p>

                            <div className="space-y-4">
                <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="w-full px-6 py-4 bg-ivory rounded-2xl border-2 border-transparent focus:border-coral outline-none transition-all min-h-[120px] resize-none"
                    placeholder="예: 해당 시간대에 이미 정원이 초과되었습니다."
                />

                                <button
                                    onClick={handleConfirmReject}
                                    className="w-full py-5 bg-red-500 text-white font-bold rounded-3xl hover:bg-red-600 transition-all shadow-xl shadow-red-500/30 text-lg mt-4"
                                >
                                    거절 완료
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Student Cancel Request Modal */}
            <AnimatePresence>
                {isCancelRequestModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{opacity: 0}}
                            animate={{opacity: 1}}
                            exit={{opacity: 0}}
                            onClick={() => setIsCancelRequestModalOpen(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{opacity: 0, scale: 0.9, y: 20}}
                            animate={{opacity: 1, scale: 1, y: 0}}
                            exit={{opacity: 0, scale: 0.9, y: 20}}
                            className="relative w-full max-w-md bg-white rounded-[40px] p-10 shadow-2xl"
                        >
                            <button
                                onClick={() => setIsCancelRequestModalOpen(false)}
                                className="absolute top-6 right-6 text-gray-400 hover:text-coral transition-colors"
                            >
                                <X size={24}/>
                            </button>

                            <h2 className="text-2xl font-bold text-gray-900 mb-6">취소 사유 입력</h2>
                            <p className="text-sm text-gray-500 mb-6">
                                수강 취소를 원하시는 사유를 입력해주세요. <br/>
                                프리랜서 확인 후 취소 처리가 진행됩니다.
                            </p>

                            <textarea
                                value={studentCancelReason}
                                onChange={(e) => setStudentCancelReason(e.target.value)}
                                placeholder="취소 사유를 입력해주세요."
                                className="w-full p-6 bg-ivory border-2 border-transparent focus:border-coral rounded-3xl outline-none transition-all min-h-[150px] resize-none mb-8"
                            ></textarea>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => setIsCancelRequestModalOpen(false)}
                                    className="flex-1 py-4 bg-gray-100 text-gray-500 font-bold rounded-2xl hover:bg-gray-200 transition-all"
                                >
                                    닫기
                                </button>
                                <button
                                    onClick={handleConfirmCancelRequest}
                                    className="flex-1 py-4 bg-coral text-white font-bold rounded-2xl hover:bg-coral/90 transition-all shadow-lg shadow-coral/20"
                                >
                                    취소 요청
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            {/* Approval Reject Modal */}
            <AnimatePresence>
                {isApprovalRejectModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{opacity: 0}}
                            animate={{opacity: 1}}
                            exit={{opacity: 0}}
                            onClick={() => setIsApprovalRejectModalOpen(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{opacity: 0, scale: 0.9, y: 20}}
                            animate={{opacity: 1, scale: 1, y: 0}}
                            exit={{opacity: 0, scale: 0.9, y: 20}}
                            className="relative w-full max-w-lg bg-white rounded-[40px] p-10 shadow-2xl"
                        >
                            <button
                                onClick={() => setIsApprovalRejectModalOpen(false)}
                                className="absolute top-6 right-6 text-gray-400 hover:text-coral transition-colors"
                            >
                                <X size={24}/>
                            </button>

                            <h2 className="text-2xl font-bold text-gray-900 mb-2">프리랜서 요청 반려</h2>
                            <p className="text-gray-500 mb-8">반려 사유를 입력해주세요. 해당 사유는 신청자에게 전달됩니다.</p>

                            <div className="space-y-4">
                <textarea
                    value={approvalRejectReason}
                    onChange={(e) => setApprovalRejectReason(e.target.value)}
                    className="w-full px-6 py-4 bg-ivory rounded-2xl border-2 border-transparent focus:border-coral outline-none transition-all min-h-[150px] resize-none"
                    placeholder="반려 사유를 상세히 적어주세요."
                />
                                <div className="flex gap-4 pt-4">
                                    <button
                                        onClick={() => setIsApprovalRejectModalOpen(false)}
                                        className="flex-1 py-4 bg-gray-100 text-gray-600 font-bold rounded-2xl hover:bg-gray-200 transition-all"
                                    >
                                        취소
                                    </button>
                                    <button
                                        onClick={handleConfirmApprovalReject}
                                        className="flex-1 py-4 bg-coral text-white font-bold rounded-2xl hover:bg-coral/90 transition-all shadow-lg shadow-coral/20"
                                    >
                                        반려하기
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Class Delete Confirm Modal */}
            <AnimatePresence>
                {isDeleteConfirmModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{opacity: 0}}
                            animate={{opacity: 1}}
                            exit={{opacity: 0}}
                            onClick={() => setIsDeleteConfirmModalOpen(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{opacity: 0, scale: 0.9, y: 20}}
                            animate={{opacity: 1, scale: 1, y: 0}}
                            exit={{opacity: 0, scale: 0.9, y: 20}}
                            className="relative w-full max-w-md bg-white rounded-[40px] p-10 shadow-2xl text-center"
                        >
                            <div
                                className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                <AlertCircle size={40}/>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">클래스 삭제</h2>
                            <p className="text-gray-500 mb-8 leading-relaxed">
                                이 클래스를 삭제하시겠습니까? <br/>
                                삭제된 클래스는 복구할 수 없습니다.
                            </p>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setIsDeleteConfirmModalOpen(false)}
                                    className="flex-1 py-4 bg-gray-100 text-gray-500 font-bold rounded-2xl hover:bg-gray-200 transition-all"
                                >
                                    취소
                                </button>
                                <button
                                    onClick={handleConfirmDeleteClass}
                                    className="flex-1 py-4 bg-red-500 text-white font-bold rounded-2xl hover:bg-red-600 transition-all shadow-lg shadow-red-200"
                                >
                                    삭제하기
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Toast Notification */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{opacity: 0, y: 50, x: '-50%'}}
                        animate={{opacity: 1, y: 0, x: '-50%'}}
                        exit={{opacity: 0, y: 50, x: '-50%'}}
                        className={cn(
                            "fixed bottom-10 left-1/2 z-[200] px-8 py-4 rounded-2xl shadow-2xl font-bold text-white flex items-center gap-3 min-w-[300px] justify-center",
                            toast.type === 'success' ? "bg-gray-900" : "bg-red-500"
                        )}
                    >
                        {toast.type === 'success' ? <Check size={20} className="text-green-400"/> :
                            <AlertCircle size={20}/>}
                        {toast.message}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
