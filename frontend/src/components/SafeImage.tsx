import React, { useState } from 'react';

/**
 * 🖼️ 이미지 로드 실패 시 자동으로 '이미지 없음' 대체 이미지를 표시하는 공통 컴포넌트
 *
 * 사용 방법 (img 태그를 SafeImage로 교체):
 *
 *   // 기존
 *   <img src={fileUrl} alt="프로필" className="w-16 h-16 rounded-xl" />
 *
 *   // 변경
 *   <SafeImage src={fileUrl} alt="프로필" className="w-16 h-16 rounded-xl" />
 *
 * 어떤 경우에 대체 이미지가 표시되나요?
 * - 파일 서버(D:\fileDownLoadServer\)에 실제 파일이 없을 때
 * - 네트워크 오류로 이미지를 받아오지 못할 때
 * - fileUrl이 null / undefined / 빈 문자열일 때
 * - 서버에서 404 / 500 응답을 받을 때
 *
 * 대체 이미지 경로: /no-image.svg (frontend/public/no-image.svg)
 */

const NO_IMAGE = '/no-image.svg';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string | null;
  alt: string;
  fallback?: string; // 기본값: /no-image.svg — 특정 화면에서 다른 이미지로 바꾸고 싶을 때 사용
}

export default function SafeImage({
  src,
  alt,
  fallback = NO_IMAGE,
  onError,
  ...props
}: SafeImageProps) {
  // 이미 한 번 에러가 나면 무한 루프 방지를 위해 fallback으로 고정
  const [errored, setErrored] = useState(false);

  // src가 없거나 빈 문자열이면 바로 fallback 표시
  const imgSrc = !src || src.trim() === '' ? fallback : errored ? fallback : src;

  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    if (!errored) {
      setErrored(true); // 한 번만 처리 (fallback도 실패할 경우 무한 루프 방지)
    }
    onError?.(e); // 부모에서 onError를 추가로 처리하고 싶을 때 위임
  };

  return (
    <img
      src={imgSrc}
      alt={alt}
      onError={handleError}
      {...props}
    />
  );
}
