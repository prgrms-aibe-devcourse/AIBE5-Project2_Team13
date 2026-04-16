import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  MessageCircle, ChevronLeft, Share2, Heart, MapPin, 
  Clock, Users, BadgeCheck, CheckCircle2, X, AlertCircle, 
  ChevronDown, ChevronUp, Send, Calendar, DollarSign
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { useRequests } from '../context/RequestContext';
import { useReports } from '../context/ReportContext';

const TABS = [
  { id: 'request-info', label: '요청 내용' },
  { id: 'location', label: '희망 장소' },
  { id: 'faq', label: 'FAQ' },
];

export default function RequestDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { requests } = useRequests();
  const { addReport } = useReports();

  // 현재 로그인한 사용자 이메일 (localStorage에서 가져옴)
  const currentUserEmail = localStorage.getItem('userEmail') ?? '';

  /**
   * 로그인 여부를 확인하고, 비로그인이면 alert 후 로그인 페이지로 이동합니다.
   * 버튼 클릭 시점마다 localStorage를 직접 읽어서 최신 상태를 확인합니다.
   * 로그인 상태면 true를 반환해서 이후 동작을 실행합니다.
   */
  const requireLogin = (): boolean => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      alert('로그인이 필요한 서비스입니다.');
      navigate('/login');
      return false;
    }
    return true;
  };

  const [isPicked, setIsPicked] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isSelfModalOpen, setIsSelfModalOpen] = useState(false); // 본인 문의 방지 모달
  const [reportReason, setReportReason] = useState('');
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const [activeTab, setActiveTab] = useState('request-info');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const sectionRefs = {
    'request-info': useRef<HTMLDivElement>(null),
    location: useRef<HTMLDivElement>(null),
    faq: useRef<HTMLDivElement>(null),
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // item을 useEffect 보다 먼저 선언 (useEffect 의존성으로 사용하기 위해)
  const item = requests.find(r => r.id === id);

  // ✅ useEffect를 조건부 return 이전에 위치
  // React 규칙: Hook은 조건부 return 이전에 항상 실행되어야 합니다.
  // item이 없을 때 내부에서 skip 처리하여 Hook 순서를 고정합니다.
  useEffect(() => {
    if (!item) return; // item이 없으면 Observer 등록만 skip

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
  }, [item]);

  if (!item) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-gray-500 mb-4">요청 정보를 찾을 수 없습니다.</p>
        <button onClick={() => navigate('/requests')} className="text-coral font-bold">목록으로 돌아가기</button>
      </div>
    );
  }

  // item.category에 이미 categoryName(한글)이 저장되어 있으므로 그대로 사용
  const categoryName = item.category || '기타';

  const scrollToSection = (id: string) => {
    const ref = sectionRefs[id as keyof typeof sectionRefs];
    if (ref.current) {
      const offset = 120;
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
    navigator.clipboard.writeText(window.location.href).then(() => {
      showToast('링크가 복사되었습니다!');
    });
  };

  const handleReport = () => {
    if (!reportReason.trim()) {
      showToast('신고 사유를 입력해주세요.', 'error');
      return;
    }
    addReport('USER', reportReason);
    showToast('신고가 접수되었습니다.');
    setIsReportModalOpen(false);
    setReportReason('');
  };

  const faqs = [
    { q: '제안을 보내면 바로 매칭되나요?', a: '요청자가 제안을 확인한 후 채팅을 통해 상세 내용을 조율하게 됩니다.' },
    { q: '희망 금액보다 높게 제안해도 되나요?', a: '네, 제공 가능한 서비스 수준에 맞춰 적정 금액을 제안하실 수 있습니다.' },
  ];

  return (
    <div className="bg-white min-h-screen pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Link to="/" className="hover:text-coral">홈</Link>
          <span>&gt;</span>
          <Link to="/requests" className="hover:text-coral">클래스 요청</Link>
          <span>&gt;</span>
          <span className="text-gray-600 truncate max-w-[200px]">{item.title}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Main Content (Left) */}
          <div className="lg:col-span-2 space-y-12">
            {/* 이미지 영역 제거 — 요청 클래스는 이미지 등록 기능 없음 */}

            <div className="sticky top-[72px] z-40 bg-white border-b border-gray-100 -mx-4 px-4 sm:mx-0 sm:px-0">
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

            {/* Section: 요청 내용 */}
            <section id="request-info" ref={sectionRefs['request-info']} className="scroll-mt-32">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">요청 내용</h2>
              <div className="bg-ivory/30 rounded-3xl p-8 border border-coral/5 space-y-6">
                <div className="prose prose-coral max-w-none text-gray-600 leading-relaxed">
                  <p className="whitespace-pre-wrap">{item.content}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-coral/10">
                  {/* 희망 시작/종료 일시 — 등록 시 입력한 값을 표시 */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-coral shadow-sm">
                      <Calendar size={20} />
                    </div>
                    <div>
                      <p className="text-[13px] text-gray-400">희망 시작 일시</p>
                      <p className="text-base font-bold text-gray-900">{item.startAt || '협의 가능'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-coral shadow-sm">
                      <Calendar size={20} />
                    </div>
                    <div>
                      <p className="text-[13px] text-gray-400">희망 종료 일시</p>
                      <p className="text-base font-bold text-gray-900">{item.endAt || '협의 가능'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-coral shadow-sm">
                      <Users size={20} />
                    </div>
                    <div>
                      <p className="text-[13px] text-gray-400">수업 방식</p>
                      <p className="text-base font-bold text-gray-900">{item.lessonType || '협의 가능'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section: 장소 */}
            <section id="location" ref={sectionRefs.location} className="scroll-mt-32">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">희망 장소</h2>
              <div className="bg-ivory/30 rounded-3xl p-6 border border-coral/5 flex items-center gap-4">
                <div className="w-12 h-12 bg-coral/10 text-coral rounded-2xl flex items-center justify-center shrink-0">
                  <MapPin size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">1:1 대화 협의</h4>
                  <p className="text-sm text-gray-500">채팅으로 문의하기를 통해 요청자와 직접 장소를 조율해보세요.</p>
                </div>
              </div>
            </section>

            {/* Section: FAQ */}
            <section id="faq" ref={sectionRefs.faq} className="scroll-mt-32">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">자주 묻는 질문</h2>
              <div className="space-y-3">
                {faqs.map((faq, i) => (
                  <div key={i} className="border border-gray-100 rounded-2xl overflow-hidden">
                    <button 
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full flex items-center justify-between p-5 text-left bg-white hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-coral font-bold">Q.</span>
                        <span className="font-bold text-gray-900 text-[15px]">{faq.q}</span>
                      </div>
                      {openFaq === i ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
                    </button>
                    <AnimatePresence>
                      {openFaq === i && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden bg-gray-50"
                        >
                          <div className="p-5 text-[15px] text-gray-600 border-t border-gray-100 flex gap-3">
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
          </div>

          {/* Sidebar (Right) */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <div className="bg-white rounded-[32px] p-8 shadow-xl border border-coral/5">
                <div className="mb-6">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-coral text-sm font-bold">{categoryName}</span>
                    <span className="text-xs text-gray-400">{item.date}</span>
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-4 leading-tight">{item.title}</h1>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                      <Users size={16} />
                    </div>
                    <span className="font-bold text-gray-900 text-[15px]">{item.author}</span>
                  </div>
                </div>

                <div className="mb-8">
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-gray-400 text-sm">희망 금액</span>
                    <span className="text-3xl font-bold text-gray-900">{item.reward.toLocaleString()}원</span>
                  </div>
                  
                  <div className="bg-ivory/50 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center gap-3 text-[15px] text-gray-500">
                      <Users size={14} className="text-gray-400" />
                      <span>수업 방식: {item.lessonType || '협의'}</span>
                    </div>
                    <div className="flex items-center gap-3 text-[15px] text-gray-500">
                      <MapPin size={14} className="text-gray-400" />
                      <span>장소: 협의</span>
                    </div>
                    <div className="flex items-center gap-3 text-[15px] text-gray-500">
                      <Calendar size={14} className="text-gray-400" />
                      <span>시작: {item.startAt || '협의'}</span>
                    </div>
                    <div className="flex items-center gap-3 text-[15px] text-gray-500">
                      <Calendar size={14} className="text-gray-400" />
                      <span>종료: {item.endAt || '협의'}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {/* 채팅 버튼 — 비로그인이면 로그인 유도, 본인 글이면 모달 */}
                  <button
                    onClick={() => {
                      if (!requireLogin()) return;
                      if (item.requesterEmail && currentUserEmail && item.requesterEmail === currentUserEmail) {
                        setIsSelfModalOpen(true);
                      } else {
                        alert('채팅 기능은 현재 구현 중입니다.');
                      }
                    }}
                    className="w-full py-4 bg-coral text-white font-bold rounded-2xl hover:bg-coral/90 transition-all shadow-lg shadow-coral/20 text-lg"
                  >
                    채팅으로 문의하기
                  </button>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => {
                        if (!requireLogin()) return;
                        setIsPicked(!isPicked);
                      }}
                      className={cn(
                        "py-3 border rounded-xl transition-all flex items-center justify-center gap-2 font-bold text-[15px]",
                        isPicked ? "bg-coral/5 border-coral text-coral" : "bg-white border-gray-200 text-gray-400 hover:bg-gray-50"
                      )}
                    >
                      <Heart size={18} className={isPicked ? "fill-coral" : ""} />
                      Pick
                    </button>
                    <button 
                      onClick={handleShare}
                      className="py-3 bg-white border border-gray-200 text-gray-400 rounded-xl hover:bg-gray-50 transition-all flex items-center justify-center gap-2 font-bold text-[15px]"
                    >
                      <Share2 size={18} />
                      공유하기
                    </button>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => {
                  if (!requireLogin()) return;
                  setIsReportModalOpen(true);
                }}
                className="w-full flex items-center justify-center gap-2 text-gray-400 hover:text-coral transition-colors text-xs font-medium"
              >
                <AlertCircle size={14} /> 부적절한 요청 신고하기
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 본인 문의 방지 모달 */}
      <AnimatePresence>
        {isSelfModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSelfModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-white rounded-[40px] p-10 shadow-2xl text-center"
            >
              <div className="w-16 h-16 bg-coral/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle size={32} className="text-coral" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">본인에게 문의는 불가능 해요!</h2>
              <p className="text-sm text-gray-500 mb-8">본인이 작성한 요청 클래스입니다.</p>
              <button
                onClick={() => setIsSelfModalOpen(false)}
                className="w-full py-4 bg-coral text-white font-bold rounded-2xl"
              >
                확인
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Report Modal */}
      <AnimatePresence>
        {isReportModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsReportModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[40px] p-10 shadow-2xl"
            >
              <button 
                onClick={() => setIsReportModalOpen(false)}
                className="absolute top-6 right-6 text-gray-400 hover:text-coral transition-colors"
              >
                <X size={24} />
              </button>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-6">신고하기</h2>
              <textarea 
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                placeholder="신고 사유를 입력해주세요."
                className="w-full p-6 bg-ivory border-2 border-transparent focus:border-coral rounded-3xl outline-none transition-all min-h-[150px] resize-none mb-8"
              ></textarea>
              <div className="flex gap-4">
                <button onClick={() => setIsReportModalOpen(false)} className="flex-1 py-4 bg-gray-100 text-gray-500 font-bold rounded-2xl">취소</button>
                <button onClick={handleReport} className="flex-1 py-4 bg-coral text-white font-bold rounded-2xl shadow-lg shadow-coral/20">신고 제출</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 50, x: '-50%' }}
            className={cn(
              "fixed bottom-10 left-1/2 z-[200] px-8 py-4 rounded-2xl shadow-2xl font-bold text-white flex items-center gap-3 min-w-[300px] justify-center",
              toast.type === 'success' ? "bg-gray-900" : "bg-red-500"
            )}
          >
            {toast.type === 'success' ? <CheckCircle2 size={20} className="text-green-400" /> : <AlertCircle size={20} />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
