import React, { useState } from 'react';
import { Search, ChevronDown, MessageCircle, HelpCircle, BookOpen, CreditCard, User, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { useNavigate } from 'react-router-dom';

type Category = 'ALL' | 'CLASS' | 'PAYMENT' | 'FREELANCER' | 'ACCOUNT';

interface FAQItem {
  id: string;
  category: Category;
  question: string;
  answer: string;
}

const FAQ_DATA: FAQItem[] = [
  {
    id: '1',
    category: 'CLASS',
    question: '클래스 수강 신청은 어떻게 하나요?',
    answer: '원하시는 클래스 상세 페이지에서 [수강 신청하기] 버튼을 클릭하시면 됩니다. 오프라인 클래스의 경우 장소와 시간을 확인해 주세요.'
  },
  {
    id: '2',
    category: 'PAYMENT',
    question: '결제 취소 및 환불 규정이 궁금해요.',
    answer: '클래스 시작 3일 전까지는 100% 환불이 가능합니다. 1일 전까지는 50% 환불되며, 당일 취소는 환불이 어렵습니다. 자세한 내용은 이용약관을 참조해 주세요.'
  },
  {
    id: '3',
    category: 'FREELANCER',
    question: '프리랜서(전문가) 등록 조건이 있나요?',
    answer: '자신의 재능을 나누고 싶은 분이라면 누구나 신청 가능합니다! 마이페이지에서 [프리랜서 등록]을 통해 경력과 포트폴리오를 제출해 주시면 관리자 승인 후 활동하실 수 있습니다.'
  },
  {
    id: '4',
    category: 'ACCOUNT',
    question: '비밀번호를 잊어버렸어요.',
    answer: '로그인 페이지 하단의 [비밀번호 찾기]를 통해 가입하신 이메일로 임시 비밀번호를 발송해 드립니다.'
  },
  {
    id: '5',
    category: 'CLASS',
    question: '준비물이 필요한 클래스인가요?',
    answer: '각 클래스 상세 페이지의 [준비물] 섹션에 필요한 항목이 기재되어 있습니다. 별도의 준비물이 없는 경우 전문가가 모두 준비해 드립니다.'
  },
  {
    id: '6',
    category: 'PAYMENT',
    question: '결제 수단은 어떤 것들이 있나요?',
    answer: '신용카드, 체크카드, 계좌이체, 카카오페이, 네이버페이 등 다양한 간편 결제 수단을 지원합니다.'
  },
  {
    id: '7',
    category: 'FREELANCER',
    question: '수익 정산은 언제 이루어지나요?',
    answer: '클래스가 종료된 후 수강생의 구매 확정이 완료되면 영업일 기준 3일 이내에 등록하신 계좌로 정산 금액이 입금됩니다.'
  },
  {
    id: '8',
    category: 'ACCOUNT',
    question: '회원 탈퇴는 어떻게 하나요?',
    answer: '마이페이지 > 계정 설정 하단의 [회원 탈퇴하기] 버튼을 통해 탈퇴하실 수 있습니다. 탈퇴 시 모든 활동 내역이 삭제되니 주의해 주세요.'
  }
];

const CATEGORIES = [
  { id: 'ALL', label: '전체', icon: HelpCircle },
  { id: 'CLASS', label: '수강/클래스', icon: BookOpen },
  { id: 'PAYMENT', label: '결제/환불', icon: CreditCard },
  { id: 'FREELANCER', label: '프리랜서', icon: ShieldCheck },
  { id: 'ACCOUNT', label: '계정', icon: User },
];

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState<Category>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);
  const navigate = useNavigate();

  const filteredFaqs = FAQ_DATA.filter(item => {
    const matchesCategory = activeCategory === 'ALL' || item.category === activeCategory;
    const matchesSearch = item.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleAccordion = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-ivory pb-20">
      {/* Header Section */}
      <div className="bg-white pt-20 pb-16 border-b border-coral/10">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-gray-900 mb-4"
          >
            무엇을 도와드릴까요?
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gray-500 mb-10"
          >
            궁금하신 내용을 검색해 보시거나 카테고리를 선택해 주세요.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="relative max-w-2xl mx-auto"
          >
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-coral" size={24} />
            <input 
              type="text" 
              placeholder="궁금한 내용을 입력해 주세요"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-16 pr-8 py-5 bg-ivory rounded-[32px] border-2 border-transparent focus:border-coral outline-none transition-all text-lg shadow-inner"
            />
          </motion.div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-12">
        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id as Category)}
              className={cn(
                "flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all border-2",
                activeCategory === cat.id 
                  ? "bg-coral border-coral text-white shadow-lg shadow-coral/20" 
                  : "bg-white border-transparent text-gray-500 hover:border-coral/20 hover:text-coral"
              )}
            >
              <cat.icon size={18} />
              {cat.label}
            </button>
          ))}
        </div>

        {/* FAQ List */}
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq) => (
                <motion.div
                  key={faq.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white rounded-3xl border border-coral/10 overflow-hidden shadow-sm"
                >
                  <button
                    onClick={() => toggleAccordion(faq.id)}
                    className="w-full flex items-center justify-between p-6 text-left hover:bg-ivory/30 transition-colors"
                  >
                    <span className="font-bold text-gray-900 pr-8">{faq.question}</span>
                    <motion.div
                      animate={{ rotate: openId === faq.id ? 180 : 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="text-coral shrink-0"
                    >
                      <ChevronDown size={24} />
                    </motion.div>
                  </button>
                  
                  <AnimatePresence>
                    {openId === faq.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                      >
                        <div className="px-6 pb-6 pt-2 text-gray-600 leading-relaxed border-t border-coral/5 mx-6">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20"
              >
                <HelpCircle size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 font-medium">검색 결과가 없습니다.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-24 text-center bg-white rounded-[40px] p-12 border border-coral/10 shadow-sm"
        >
          <div className="w-16 h-16 bg-coral/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <MessageCircle className="text-coral" size={32} />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">원하는 답을 찾지 못하셨나요?</h3>
          <p className="text-gray-500 mb-8">포근 고객센터는 언제나 여러분의 목소리를 기다리고 있습니다.</p>
          <button 
            onClick={() => navigate('/chat')}
            className="px-10 py-4 bg-coral text-white font-bold rounded-2xl hover:bg-coral/90 transition-all shadow-lg shadow-coral/20 flex items-center gap-2 mx-auto"
          >
            1:1 문의하기
          </button>
        </motion.div>
      </div>
    </div>
  );
}
