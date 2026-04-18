import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pencil, Trash2, AlertCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { useRequests } from '../context/RequestContext';
import { RequestItem } from '../constants';

/**
 * 마이페이지 > 클래스 요청 관리 화면
 * - 본인이 작성한 요청 클래스 목록 표출
 * - 수정 버튼: 수정 화면으로 이동
 * - 삭제 버튼: 확인 모달 → 소프트 삭제
 */
export default function MyRequestManage() {
  const navigate = useNavigate();
  const { fetchMyRequests, deleteRequest } = useRequests();

  const [myRequests,    setMyRequests]    = useState<RequestItem[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [deleteTarget,  setDeleteTarget]  = useState<RequestItem | null>(null); // 삭제 확인 모달 대상
  const [deleting,      setDeleting]      = useState(false);

  // 마운트 시 내 요청 클래스 목록 조회
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const list = await fetchMyRequests();
      setMyRequests(list);
      setLoading(false);
    };
    load();
  }, []);

  // ── 삭제 처리 ─────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return;

    setDeleting(true);
    const success = await deleteRequest(deleteTarget.id);
    setDeleting(false);

    if (success) {
      setMyRequests(prev => prev.filter(r => r.id !== deleteTarget.id));
      setDeleteTarget(null);
    } else {
      alert('삭제에 실패했습니다. 다시 시도해주세요.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48 text-gray-400">
        목록을 불러오는 중...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">내 요청 클래스</h2>
        <span className="text-sm text-gray-400">총 {myRequests.length}건</span>
      </div>

      {myRequests.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg mb-2">작성한 요청 클래스가 없어요.</p>
          <button
            onClick={() => navigate('/requests/write')}
            className="mt-4 px-6 py-3 bg-coral text-white font-bold rounded-2xl hover:bg-coral/90 transition-all"
          >
            요청 글쓰기
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {myRequests.map(item => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between gap-4">

                {/* 클래스 정보 */}
                <div
                  className="flex-1 cursor-pointer"
                  onClick={() => navigate(`/request/${item.id}`)}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-coral bg-coral/10 px-2 py-0.5 rounded-lg">
                      {item.category}
                    </span>
                    <span className="text-xs text-gray-400">{item.date}</span>
                  </div>
                  <h3 className="font-bold text-gray-900 text-[16px] mb-1 hover:text-coral transition-colors">
                    {item.title}
                  </h3>
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <span>{item.lessonType}</span>
                    <span>·</span>
                    <span>{item.reward.toLocaleString()}원</span>
                    {item.startAt && (
                      <>
                        <span>·</span>
                        <span>{item.startAt} ~ {item.endAt}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* 수정 / 삭제 버튼 */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => navigate(`/requests/edit/${item.id}`)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-ivory text-gray-600 font-bold rounded-xl hover:bg-coral/10 hover:text-coral transition-all text-sm"
                  >
                    <Pencil size={14} />
                    수정
                  </button>
                  <button
                    onClick={() => setDeleteTarget(item)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-ivory text-gray-600 font-bold rounded-xl hover:bg-red-50 hover:text-red-500 transition-all text-sm"
                  >
                    <Trash2 size={14} />
                    삭제
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* 삭제 확인 모달 */}
      <AnimatePresence>
        {deleteTarget && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteTarget(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-white rounded-[40px] p-10 shadow-2xl text-center"
            >
              <button
                onClick={() => setDeleteTarget(null)}
                className="absolute top-6 right-6 text-gray-400 hover:text-coral"
              >
                <X size={24} />
              </button>
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle size={32} className="text-red-400" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">요청 클래스를 삭제할까요?</h2>
              <p className="text-sm text-gray-500 mb-2 font-bold line-clamp-2">
                "{deleteTarget.title}"
              </p>
              <p className="text-sm text-gray-400 mb-8">삭제한 요청 클래스는 복구할 수 없습니다.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="flex-1 py-4 bg-gray-100 text-gray-500 font-bold rounded-2xl"
                >
                  취소
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 py-4 bg-red-500 text-white font-bold rounded-2xl disabled:opacity-50"
                >
                  {deleting ? '삭제 중...' : '삭제'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
