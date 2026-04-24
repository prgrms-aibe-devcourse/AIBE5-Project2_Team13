import React, {useState, useEffect, useRef} from 'react';
import {useParams, useNavigate, Link} from 'react-router-dom';
import apiClient from '../api/axios';
import {ClassItem} from '@/src/constants';
import {
    MessageCircle, CreditCard, ChevronLeft, Star, Share2, Heart, MapPin,
    Clock, Users, BadgeCheck, ShieldCheck, CheckCircle2, X, AlertCircle,
    UserPlus, UserCheck, ChevronDown, ChevronUp, HelpCircle, Info, ListChecks,
    DollarSign, Map as MapIcon
} from 'lucide-react';
import {CATEGORIES} from '@/src/constants';
import {motion, AnimatePresence} from 'motion/react';
import {cn} from '@/src/lib/utils';
import {useEnrollments} from '../context/EnrollmentContext';
import {useReports} from '../context/ReportContext';
import {useClasses} from '../context/ClassContext';
import {useFollow} from '../context/FollowContext';
import {ReviewItem} from '@/src/constants';
import {getAccessToken} from '../lib/auth';
import {useWish} from '../context/WishContext';
import {useAuth} from '@/src/context/AuthContext';
import {
    getFreelancerProfileByFreelancerId,
    getMyFreelancerProfile,
    type FreelancerProfileDetailResponse
} from '@/src/api/freelancerProfile';
import {applyClassOrder} from '@/src/api/classOrder';
import {getClassReviews} from '@/src/api/review';
import {DEFAULT_PROFILE_IMAGE_URL} from '@/src/lib/profileImage';

const TABS = [
    {id: 'description', label: '클래스 소개'},//명칭 클래스 등록란과 통일 : 서비스 설명->클래스 소개
    {id: 'curriculum', label: '커리큘럼'},
    {id: 'expert', label: '전문가 정보'},
    {id: 'location', label: '장소'},
    {id: 'faq', label: 'FAQ'},
];

export default function ClassDetail() {
    const {id} = useParams();
    const navigate = useNavigate();
    const {user} = useAuth();
    const {enrollments, applyForClass, refreshEnrollments} = useEnrollments();
    const {addReport} = useReports();
    const {classes} = useClasses();
    const {toggleFollow, isFollowing: checkFollowing, followLoading} = useFollow();
    const {isWished, syncWishStatus, toggleWish} = useWish();
    const [detailItem, setDetailItem] = useState<(ClassItem & { detailImages?: string[] }) | null>(null);

    const [wishLoading, setWishLoading] = useState(false);
    const [isFollowing, setIsFollowing] = useState(false);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [reportReason, setReportReason] = useState('');
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
    const [applyLoading, setApplyLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('description');
    const [openFaq, setOpenFaq] = useState<number | null>(0);
    const [myFreelancerId, setMyFreelancerId] = useState<number | null>(null);
    const [freelancerProfile, setFreelancerProfile] = useState<FreelancerProfileDetailResponse | null>(null);

    // 현재 로그인한 사람과 클래스 작성자가 같은지 체크
    // detailItem이 null일 수도 있으니까 ?.를 사용해서 안전하게 체크해요
    const isOwner = user?.email === detailItem?.freelancerEmail;

    // Refs for scroll sync
    const sectionRefs = {
        description: useRef<HTMLDivElement>(null),
        curriculum: useRef<HTMLDivElement>(null),
        expert: useRef<HTMLDivElement>(null),
        location: useRef<HTMLDivElement>(null),
        faq: useRef<HTMLDivElement>(null),
    };

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({message, type});
        setTimeout(() => setToast(null), 3000);
    };

    const [allReviews, setAllReviews] = useState<ReviewItem[]>([]);

    const itemFromContext = classes.find(c => c.id === id);

    useEffect(() => {
        if (!id) {
            setAllReviews([]);
            return;
        }

        let isMounted = true;

        const loadReviews = async () => {
            try {
                const reviews = await getClassReviews(id);
                if (isMounted) {
                    setAllReviews(reviews);
                }
            } catch (error) {
                if (isMounted) {
                    setAllReviews([]);
                }
            }
        };

        loadReviews();

        return () => {
            isMounted = false;
        };
    }, [id]);

    useEffect(() => {
        const observerOptions = {
            root: null,
            rootMargin: '-100px 0px -70% 0px',
            threshold: 0,
        };

        const observerCallback = (entries: IntersectionObserverEntry[]) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    setActiveTab(entry.target.id);
                }
            });
        };

        const observer = new IntersectionObserver(observerCallback, observerOptions);

        Object.values(sectionRefs).forEach((ref) => {
            if (ref.current) observer.observe(ref.current);
        });

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (itemFromContext) {
            setDetailItem(itemFromContext);
        }

        const fetchClass = async () => {
            if (!id) return;
            try {
                const response = await apiClient.get(`/classes/${id}`);
                const apiClass = response.data;
                //이미지 파일이 헤더에 들어가게
                const detailImages = Array.isArray(apiClass.images)
                    ? apiClass.images
                        .map((image: { fileUrl?: string | null }) => image.fileUrl)
                        .filter((fileUrl: string | null | undefined): fileUrl is string => !!fileUrl)
                    : [];
                setDetailItem({
                    id: String(apiClass.id),
                    title: apiClass.title,
                    freelancer: apiClass.freelancerName,
                    freelancerEmail: apiClass.freelancerEmail ?? '',  // 본인 여부 판단용
                    freelancerId: String(apiClass.freelancerId),
                    price: apiClass.price,
                    category: apiClass.categoryName,
                    image: apiClass.representativeImageUrl || detailImages[0] || '/pogeun.png',
                    rating: apiClass.rating ?? 0,
                    reviews: apiClass.reviews ?? 0,
                    isOffline: !apiClass.isOnline,
                    location: apiClass.isOnline ? undefined : apiClass.location,
                    startAt: apiClass.startAt,
                    endAt: apiClass.endAt,
                    currentVolume: apiClass.currentVolume ?? 0,
                    maxCapacity: apiClass.maxCapacity,
                    curriculum: apiClass.curriculum,
                    description: apiClass.description,
                    status: apiClass.status,
                    createdAt: apiClass.createdAt ?? new Date().toISOString(),
                    updatedAt: apiClass.updatedAt,
                    detailImages,
                });
            } catch (error) {
                console.error('클래스 상세 조회 실패:', error);
                setDetailItem(null);
            }
        };

        fetchClass();
    }, [id, itemFromContext]);

    useEffect(() => {
        const token = getAccessToken();
        if (!token || !id) return;

        syncWishStatus(id).catch(() => {
        });
    }, [id, syncWishStatus]);

    useEffect(() => {
        if (user?.role !== 'FREELANCER') {
            setMyFreelancerId(null);
            return;
        }

        let isMounted = true;

        getMyFreelancerProfile()
            .then((myProfile) => {
                if (isMounted) {
                    setMyFreelancerId(myProfile.freelancerId ?? null);
                }
            })
            .catch(() => {
                if (isMounted) {
                    setMyFreelancerId(null);
                }
            });

        return () => {
            isMounted = false;
        };
    }, [user?.role]);

    useEffect(() => {
        const freelancerId = detailItem?.freelancerId;
        if (!freelancerId) {
            setFreelancerProfile(null);
            return;
        }

        let isMounted = true;

        getFreelancerProfileByFreelancerId(Number(freelancerId))
            .then((profile) => {
                if (isMounted) {
                    setFreelancerProfile(profile);
                }
            })
            .catch(() => {
                if (isMounted) {
                    setFreelancerProfile(null);
                }
            });

        return () => {
            isMounted = false;
        };
    }, [detailItem?.freelancerId]);

    if (!detailItem) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center">
                <p className="text-gray-500 mb-4">클래스 정보를 찾을 수 없습니다.</p>
                <button onClick={() => navigate('/browse')} className="text-coral font-bold">목록으로 돌아가기</button>
            </div>
        );
    }

    const item = detailItem;
    const isOwnClassInquiryTarget = myFreelancerId !== null && Number(item.freelancerId) === myFreelancerId;
// [기능 설명: 특정 클래스 ID와 일치하며, 취소되거나 거절되지 않은 유효한 수강 신청 내역을 찾습니다.] [작성 이유: 이미 수강 중이거나 신청 중인 클래스를 식별하여 중복 신청을 방지하거나 UI 상태를 동기화하기 위해 작성함]
    const currentEnrollment = enrollments.find(
        e => e.classId === item.id && e.status !== 'CANCELLED' && e.status !== 'REJECTED'
    );
    const status = currentEnrollment?.status;
    const isClosed = item.status === 'CLOSE'; //모집마감

    const categoryName = CATEGORIES.find(c => c.id === item.category)?.name || '미술·공예';

    const formatSchedule = (start?: string, end?: string) => {
        if (!start && !end) return '협의';
        const startDate = start ? new Date(start).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }) : '-';
        const endDate = end ? new Date(end).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }) : '-';
        return `${startDate} ~ ${endDate}`;
    };

    const formatDate = (date?: string) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('ko-KR', {year: 'numeric', month: '2-digit', day: '2-digit'});
    };

    const scrollToSection = (id: string) => {
        const ref = sectionRefs[id as keyof typeof sectionRefs];
        if (ref.current) {
            const offset = 120; // Height of sticky header/tabs
            const bodyRect = document.body.getBoundingClientRect().top;
            const elementRect = ref.current.getBoundingClientRect().top;
            const elementPosition = elementRect - bodyRect;
            const offsetPosition = elementPosition - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    };

    const handleShare = () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url).then(() => {
            showToast('링크가 클립보드에 복사되었습니다!');
        });
    };

    //클래스 '신청하기' 버튼 눌렀을 때
    const handleApply = async () => {
        // 1. 검증 로직을 무조건 맨 위로! (불필요한 API 호출 방지)
        if (isOwner) {
            alert('본인이 작성한 클래스는 신청할 수 없습니다.');
            return;
        }

        if (currentEnrollment) {
            showToast('이미 신청한 클래스입니다.', 'error');
            return;
        }

        if (!requireLogin()) return; // 로그인 체크
        if (!id || applyLoading) return;

        setApplyLoading(true);

        try {
            // 2. 중요! applyClassOrder를 쓰는 대신 apiClient를 직접 쓰거나,
            // applyClassOrder 내부에서 apiClient를 쓰도록 고쳐야 합니다.

            // 방법 A: apiClient를 직접 사용 (가장 안전함)
            const orderId = await applyClassOrder({classBoardId: Number(id)});

            // 3. 기존 로직 그대로 유지
            applyForClass(item.id, item.title, item.price, String(orderId));
            await refreshEnrollments();
            showToast('신청이 완료되었습니다');
            setTimeout(() => navigate('/profile/activity'), 1500);

        } catch (error: any) {
            // 401 에러가 여기서 잡히는지 확인하세요!
            console.error("신청 실패:", error);
            const message = error?.response?.data?.message;
            showToast(message || '신청 처리 중 오류가 발생했습니다.', 'error');
        } finally {
            setApplyLoading(false);
        }
    };

    const handleReport = () => {
        if (!reportReason.trim()) {
            showToast('신고 사유를 입력해주세요.', 'error');
            return;
        }
        addReport('CLASS', reportReason);
        showToast('신고가 접수되었습니다.');
        setIsReportModalOpen(false);
        setReportReason('');
    };

    const faqs = (item as any).faqs || [
        {q: '초보자도 수강할 수 있나요?', a: '네, 완전 기초부터 맞춤형으로 알려드립니다. 걱정 말고 신청해주세요!'},
        {q: '수업은 어떤 프로그램으로 진행되나요?', a: '오프라인 대면 수업으로 진행되며, 필요한 재료는 모두 제공해 드립니다.'},
        {q: '일정 변경은 가능한가요?', a: '수업 시작 3일 전까지는 자유롭게 변경 가능합니다. 그 이후는 채팅으로 문의주세요.'},
    ];

    const rawCurriculum = (item as any).curriculum;
    const requireLogin = (): boolean => {
        if (!getAccessToken()) {
            alert('로그인이 필요한 서비스입니다.');
            navigate('/login');
            return false;
        }
        return true;
    };

    const handleWishToggle = async () => {
        if (!requireLogin()) return;
        if (wishLoading) return;

        setWishLoading(true);
        try {
            await toggleWish(item.id);
        } catch {
            showToast('잠시 후 다시 시도해주세요.', 'error');
        } finally {
            setWishLoading(false);
        }
    };

    const isPicked = isWished(item.id);
    const curriculum = (() => {
        if (Array.isArray(rawCurriculum)) {
            return rawCurriculum;
        }
        if (typeof rawCurriculum === 'string') {
            const trimmed = rawCurriculum.trim();
            if (trimmed.startsWith('[')) {
                try {
                    const parsed = JSON.parse(trimmed);
                    if (Array.isArray(parsed)) {
                        return parsed;
                    }
                } catch {
                    // ignore JSON parse failure and fall back to line splitting
                }
            }
            // Split by double newlines to separate curriculum items
            const items = trimmed.split(/\n\s*\n/).filter(Boolean);
            if (items.length === 0 || items.length === 1) {
                // Fallback: if no double newlines or only one block, treat every 2 lines as one week
                const lines = trimmed.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
                const result = [];
                for (let i = 0; i < lines.length; i += 2) {
                    result.push({
                        week: Math.floor(i / 2) + 1,
                        title: lines[i] || `단계 ${Math.floor(i / 2) + 1}`,
                        desc: lines[i + 1] || lines[i] || '',
                    });
                }
                return result;
            }
            return items.map((item, index) => {
                const lines = item.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
                const title = lines[0] || `단계 ${index + 1}`;
                const desc = lines.slice(1).join('\n');
                return {
                    week: index + 1,
                    title,
                    desc: desc || title,
                };
            });
        }
        return [
            {week: 1, title: '기초 이해', desc: '도구의 사용법과 기초를 배웁니다.'},
            {week: 2, title: '심화 표현', desc: '다양한 기법을 익힙니다.'},
            {week: 3, title: '실습 진행', desc: '직접 작품을 만들어봅니다.'},
            {week: 4, title: '최종 완성', desc: '나만의 작품을 완성합니다.'},
        ];
    })();

    const displayReviews = allReviews;
    const averageRating =
        displayReviews.length > 0
            ? (displayReviews.reduce((sum, review) => sum + review.rating, 0) / displayReviews.length).toFixed(1)
            : '0.0';

    return (
        <div className="bg-white min-h-screen pb-20">
            {/* Breadcrumbs */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Link to="/" className="hover:text-coral">홈</Link>
                    <span>&gt;</span>
                    <Link to="/browse" className="hover:text-coral">{categoryName}</Link>
                    <span>&gt;</span>
                    <span className="text-gray-600 truncate max-w-[200px]">{item.title}</span>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                    {/* Main Content (Left) */}
                    <div className="lg:col-span-2 space-y-12">
                        {/* Main Image */}
                        <motion.div
                            initial={{opacity: 0, y: 20}}
                            animate={{opacity: 1, y: 0}}
                            className="aspect-[16/9] rounded-3xl overflow-hidden shadow-sm"
                        >
                            <img
                                src={item.image}
                                alt={item.title}
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                            />
                        </motion.div>

                        {/* Sticky Tabs */}
                        <div
                            className="sticky top-[72px] z-40 bg-white border-b border-gray-100 -mx-4 px-4 sm:mx-0 sm:px-0">
                            <div className="flex overflow-x-auto no-scrollbar">
                                {TABS.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => scrollToSection(tab.id)}
                                        className={cn(
                                            "flex-shrink-0 px-6 py-4 text-base font-bold transition-all border-b-2",
                                            activeTab === tab.id
                                                ? "text-coral border-coral"
                                                : "text-gray-400 border-transparent hover:text-gray-600"
                                        )}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Section: 클래스 소개 */}
                        <section id="description" ref={sectionRefs.description} className="scroll-mt-32">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">클래스 소개</h2>
                            <div className="prose prose-coral max-w-none text-gray-600 leading-relaxed space-y-4">
                                <p className="whitespace-pre-wrap">{(item as any).description || `${item.title} 클래스에 오신 것을 환영합니다! 포근한 분위기 속에서 즐겁게 새로운 취미를 시작해보세요.`}</p>
                                {/* 본문에 이미지 추가*/}
                                {!!(item as any).detailImages?.length && (
                                    <div className="space-y-6 mt-8">
                                        {(item as any).detailImages.map((imageUrl: string, index: number) => (
                                            <div key={`${imageUrl}-${index}`}
                                                 className="rounded-3xl overflow-hidden border border-coral/10 bg-ivory/20">
                                                <img
                                                    src={imageUrl}
                                                    alt={`${item.title} 상세 이미지 ${index + 1}`}
                                                    className="w-full h-auto object-cover"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Section: 커리큘럼 */}
                        <section id="curriculum" ref={sectionRefs.curriculum} className="scroll-mt-32">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">커리큘럼</h2>
                            <div className="space-y-4">
                                {curriculum.map((step: any, i: number) => (
                                    <div key={i}
                                         className="flex gap-6 p-6 bg-ivory/30 rounded-3xl border border-coral/5 hover:bg-ivory/50 transition-all">
                                        <div
                                            className="w-10 h-10 bg-coral/10 text-coral rounded-full flex items-center justify-center font-bold shrink-0">
                                            {i + 1}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 mb-1">{i + 1}주차: {step.title}</h4>
                                            <p className="text-base text-gray-500">{step.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Section: 전문가 정보 */}
                        <section id="expert" ref={sectionRefs.expert} className="scroll-mt-32">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">전문가 정보</h2>
                            <div className="flex items-center gap-6">
                                <Link to={`/freelancer/${item.freelancerId || 'f1'}`}>
                                    <img
                                        src={freelancerProfile?.memberImageUrl || DEFAULT_PROFILE_IMAGE_URL}
                                        alt={item.freelancer}
                                        className="w-20 h-20 rounded-full object-cover border-2 border-coral/10 shadow-sm"
                                        referrerPolicy="no-referrer"
                                    />
                                </Link>
                                <div>
                                    <div className="flex items-center gap-4 mb-1">
                                        <div className="flex items-center gap-2">
                                            <Link to={`/freelancer/${item.freelancerId || 'f1'}`}
                                                  className="text-xl font-bold text-gray-900 hover:text-coral transition-colors">
                                                {item.freelancer}
                                            </Link>
                                            <BadgeCheck size={18} className="text-coral"/>
                                        </div>
                                        {/* 본인 클래스면 팔로우 버튼 숨김 */}
                                        {user?.email !== (item as any).freelancerEmail && (
                                            <button
                                                onClick={() => toggleFollow(item.freelancerId || 'f1')}
                                                disabled={followLoading}
                                                className={cn(
                                                    "px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-60",
                                                    checkFollowing(item.freelancerId || 'f1')
                                                        ? "bg-coral/10 text-coral border border-coral/20"
                                                        : "bg-coral text-white shadow-md shadow-coral/20 hover:bg-coral/90"
                                                )}
                                            >
                                                {checkFollowing(item.freelancerId || 'f1') ? (
                                                    <>
                                                        <Heart size={14} className="fill-coral"/>
                                                        팔로잉 중
                                                    </>
                                                ) : (
                                                    <>
                                                        <Heart size={14}/>
                                                        팔로우
                                                    </>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                    <p className="text-gray-500 text-base">
                                        {freelancerProfile?.bio || (item as any).expertIntro || '전문가님의 노하우를 담아 친절하게 알려드려요.'}
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* Section: 장소 */}
                        <section id="location" ref={sectionRefs.location} className="scroll-mt-32">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">진행 장소</h2>
                            <div className="bg-ivory/30 rounded-3xl p-6 border border-coral/5 flex items-center gap-4">
                                <div
                                    className="w-12 h-12 bg-coral/10 text-coral rounded-2xl flex items-center justify-center shrink-0">
                                    <MapPin size={24}/>
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900">{item.isOffline === false ? '온라인' : (item.location || '오프라인 (장소 협의)')}</h4>
                                    <p className="text-base text-gray-500">{item.isOffline === false ? '화상 미팅을 통해 진행됩니다.' : '자세한 참여 방법은 결제 후 안내됩니다.'}</p>
                                </div>
                            </div>
                        </section>

                        {/* Section: FAQ */}
                        <section id="faq" ref={sectionRefs.faq} className="scroll-mt-32">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">자주 묻는 질문</h2>
                            <div className="space-y-3">
                                {faqs.map((faq: any, i: number) => (
                                    <div key={i} className="border border-gray-100 rounded-2xl overflow-hidden">
                                        <button
                                            onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                            className="w-full flex items-center justify-between p-5 text-left bg-white hover:bg-gray-50 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="text-coral font-bold">Q.</span>
                                                <span className="font-bold text-gray-900 text-[15px]">{faq.q}</span>
                                            </div>
                                            {openFaq === i ? <ChevronUp size={18} className="text-gray-400"/> :
                                                <ChevronDown size={18} className="text-gray-400"/>}
                                        </button>
                                        <AnimatePresence>
                                            {openFaq === i && (
                                                <motion.div
                                                    initial={{height: 0, opacity: 0}}
                                                    animate={{height: 'auto', opacity: 1}}
                                                    exit={{height: 0, opacity: 0}}
                                                    className="overflow-hidden bg-gray-50"
                                                >
                                                    <div
                                                        className="p-5 text-[15px] text-gray-600 border-t border-gray-100 flex gap-3">
                                                        <span className="text-gray-400 font-bold">A.</span>
                                                        <p>{faq.a}</p>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Section: 리뷰 */}
                        <section id="reviews" className="scroll-mt-32 pt-8 border-t border-gray-100">
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-2xl font-bold text-gray-900">리뷰({displayReviews.length})</h2>
                                <div className="flex items-center gap-1 text-coral">
                                    <Star size={20} className="fill-coral"/>
                                    <span className="font-bold text-lg">{averageRating}</span>
                                </div>
                            </div>

                            <div className="space-y-8">
                                {displayReviews.slice(0, 3).map(review => (
                                    <div key={review.id}
                                         className="pb-8 border-b border-gray-100 last:border-0 last:pb-0">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-gray-900">{review.author}</span>
                                                    <div className="flex gap-0.5">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star key={i} size={14}
                                                                  className={cn(i < review.rating ? "fill-coral text-coral" : "text-gray-200")}/>
                                                        ))}
                                                    </div>
                                                </div>
                                                <span className="text-xs text-gray-400">{review.date}</span>
                                            </div>
                                        </div>
                                        <p className="text-gray-600 leading-relaxed text-base">{review.content}</p>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => setIsReviewModalOpen(true)}
                                className="w-full mt-8 py-4 bg-ivory text-gray-500 font-bold rounded-2xl hover:bg-coral/5 hover:text-coral transition-all text-sm"
                            >
                                리뷰 더보기
                            </button>
                        </section>
                    </div>

                    {/* Sidebar (Right) */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 space-y-6">
                            <div className="bg-white rounded-[32px] p-8 shadow-xl border border-coral/5">
                                <div className="mb-6">
                                    <span className="text-coral text-[15px] font-bold mb-2 block">{categoryName}</span>
                                    <h1 className="text-2xl font-bold text-gray-900 mb-2 leading-tight">{item.title}</h1>
                                    <div className="flex items-center gap-1">
                                        <Star size={16} className="fill-coral text-coral"/>
                                        <span className="font-bold text-gray-900">{averageRating}</span>
                                        <span
                                            className="text-gray-400 text-[15px] ml-1">({displayReviews.length}개의 평가)</span>
                                    </div>
                                </div>

                                <div className="mb-8">
                                    <div className="flex items-baseline gap-2 mb-4">
                                        <span className="text-gray-400 text-sm">결제 금액</span>
                                        <span
                                            className="text-3xl font-bold text-gray-900">{item.price.toLocaleString()}원</span>
                                    </div>

                                    <div className="bg-ivory/50 rounded-2xl p-4 space-y-3">
                                        <div className="text-[15px] text-gray-500">
                                            <div className="flex items-center gap-3">
                                                <Clock size={14} className="text-gray-400"/>
                                                <span>모집 기간:</span>
                                            </div>
                                            <div className="ml-7 mt-1 text-gray-700">
                                                {formatSchedule(item.startAt, item.endAt)}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 text-[15px] text-gray-500">
                                            <Users size={14} className="text-gray-400"/>
                                            <span>모집 인원: {item.currentVolume ?? 0} / {item.maxCapacity ?? '-'}명</span>
                                        </div>
                                        <div
                                            className="flex items-center gap-3 text-[15px] text-gray-500">
                                            <MapPin size={14} className="text-gray-400"/>
                                            <span>지역: {item.isOffline === false ? '온라인' : (item.location ?? '-')}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <button
                                        onClick={
                                            isOwner || !!currentEnrollment
                                                ? () => navigate('/profile/freelancer/classes')
                                                : handleApply
                                        }
                                        disabled={!isOwner && !currentEnrollment && (applyLoading || isClosed)}
                                        className={cn(
                                            "w-full py-4 font-bold rounded-2xl transition-all text-lg",
                                            isOwner || !!currentEnrollment
                                                ? "bg-gray-300 text-gray-500 shadow-none hover:bg-gray-300"
                                                : "bg-coral text-white hover:bg-coral/90 shadow-lg shadow-coral/20",
                                            !isOwner && !currentEnrollment && "disabled:bg-gray-300 disabled:text-gray-500 disabled:shadow-none disabled:cursor-not-allowed"
                                        )}
                                    >
                                        {applyLoading ? '처리 중...'
                                            : isOwner ? '내 클래스'
                                                : currentEnrollment ? '신청 완료'
                                                    : isClosed ? '모집 마감'
                                                        : '신청하기'}
                                    </button>
                                    <div className="grid grid-cols-3 gap-2">
                                        <button
                                            // 클래스 상세 문의는 수업 프리랜서 회원 PK로 직접 채팅방 생성/재사용을 요청합니다.
                                            onClick={() => navigate(`/chat?targetMemberId=${item.freelancerId}`)}
                                            disabled={isOwnClassInquiryTarget}
                                            className="col-span-1 py-3 bg-white border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-all text-[15px] flex flex-col items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <MessageCircle size={16}/>
                                            문의하기
                                        </button>
                                        <button
                                            onClick={handleWishToggle}
                                            disabled={wishLoading}
                                            className={cn(
                                                "col-span-1 py-3 border rounded-xl transition-all flex items-center justify-center disabled:opacity-60",
                                                isPicked ? "bg-coral/5 border-coral text-coral" : "bg-white border-gray-200 text-gray-400 hover:bg-gray-50"
                                            )}
                                        >
                                            <Heart size={20} className={isPicked ? "fill-coral" : ""}/>
                                        </button>
                                        <button
                                            onClick={handleShare}
                                            className="col-span-1 py-3 bg-white border border-gray-200 text-gray-400 rounded-xl hover:bg-gray-50 transition-all flex items-center justify-center"
                                        >
                                            <Share2 size={20}/>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Report Button */}
                            <button
                                onClick={() => setIsReportModalOpen(true)}
                                className="w-full flex items-center justify-center gap-2 text-gray-400 hover:text-coral transition-colors text-xs font-medium"
                            >
                                <AlertCircle size={14}/> 부적절한 클래스 신고하기
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Report Modal */}
            <AnimatePresence>
                {isReportModalOpen && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                        <motion.div
                            initial={{opacity: 0}}
                            animate={{opacity: 1}}
                            exit={{opacity: 0}}
                            onClick={() => setIsReportModalOpen(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{opacity: 0, scale: 0.9, y: 20}}
                            animate={{opacity: 1, scale: 1, y: 0}}
                            exit={{opacity: 0, scale: 0.9, y: 20}}
                            className="relative w-full max-w-md bg-white rounded-[40px] p-10 shadow-2xl"
                        >
                            <button
                                onClick={() => setIsReportModalOpen(false)}
                                className="absolute top-6 right-6 text-gray-400 hover:text-coral transition-colors"
                            >
                                <X size={24}/>
                            </button>

                            <h2 className="text-2xl font-bold text-gray-900 mb-6">신고하기</h2>
                            <textarea
                                value={reportReason}
                                onChange={(e) => setReportReason(e.target.value)}
                                placeholder="신고 사유를 입력해주세요."
                                className="w-full p-6 bg-ivory border-2 border-transparent focus:border-coral rounded-3xl outline-none transition-all min-h-[150px] resize-none mb-8"
                            ></textarea>
                            <div className="flex gap-4">
                                <button onClick={() => setIsReportModalOpen(false)}
                                        className="flex-1 py-4 bg-gray-100 text-gray-500 font-bold rounded-2xl">취소
                                </button>
                                <button onClick={handleReport}
                                        className="flex-1 py-4 bg-coral text-white font-bold rounded-2xl shadow-lg shadow-coral/20">신고
                                    제출
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Review Modal */}
            <AnimatePresence>
                {isReviewModalOpen && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                        <motion.div
                            initial={{opacity: 0}}
                            animate={{opacity: 1}}
                            exit={{opacity: 0}}
                            onClick={() => setIsReviewModalOpen(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{opacity: 0, scale: 0.9, y: 20}}
                            animate={{opacity: 1, scale: 1, y: 0}}
                            exit={{opacity: 0, scale: 0.9, y: 20}}
                            className="relative w-full max-w-2xl bg-white rounded-[40px] p-8 md:p-10 shadow-2xl max-h-[80vh] overflow-hidden flex flex-col"
                        >
                            <button
                                onClick={() => setIsReviewModalOpen(false)}
                                className="absolute top-6 right-6 text-gray-400 hover:text-coral transition-colors z-10"
                            >
                                <X size={24}/>
                            </button>

                            <div className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">전체 리뷰</h2>
                                <div className="flex items-center gap-2 text-coral">
                                    <div className="flex gap-0.5">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} size={16} className="fill-coral text-coral"/>
                                        ))}
                                    </div>
                                    <span className="font-bold text-lg">{averageRating}</span>
                                    <span
                                        className="text-gray-400 text-sm font-normal">({displayReviews.length}개의 리뷰)</span>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto pr-2 space-y-8 custom-scrollbar">
                                {displayReviews.map(review => (
                                    <div key={review.id}
                                         className="pb-8 border-b border-gray-100 last:border-0 last:pb-0">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-gray-900">{review.author}</span>
                                                    <div className="flex gap-0.5">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star key={i} size={14}
                                                                  className={cn(i < review.rating ? "fill-coral text-coral" : "text-gray-200")}/>
                                                        ))}
                                                    </div>
                                                </div>
                                                <span className="text-xs text-gray-400">{review.date}</span>
                                            </div>
                                        </div>
                                        <p className="text-gray-600 leading-relaxed text-base">{review.content}</p>
                                    </div>
                                ))}
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
                        {toast.type === 'success' ? <CheckCircle2 size={20} className="text-green-400"/> :
                            <AlertCircle size={20}/>}
                        {toast.message}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
