import React, { useState } from 'react';

/**
 * 🖼️ 이미지 로드 실패 시 자동으로 '이미지 없음' 대체 이미지를 표시하는 공통 컴포넌트
 *
 * ✅ img 태그의 모든 속성(className, style, onClick, referrerPolicy 등)을 그대로 사용 가능합니다.
 *    React.ImgHTMLAttributes<HTMLImageElement>를 상속하기 때문입니다.
 *
 * 사용 예:
 *   <SafeImage src={fileUrl} alt="프로필" className="w-16 h-16 rounded-xl" />
 *   <SafeImage src={imgUrl} alt="포트폴리오" className="w-full" referrerPolicy="no-referrer" />
 *   <SafeImage src={url} alt="이미지" fallback="/custom-fallback.png" />
 *
 * 콘솔 에러 억제 전략:
 * - src가 null/빈 문자열 → 요청 자체를 보내지 않고 바로 fallback 표시 → 에러 없음
 * - 404/네트워크 에러 → onError에서 fallback으로 교체 + errored 플래그로 무한 루프 방지
 */

const NO_IMAGE = '/no-image.svg';

/**
 * SafeImageProps
 *
 * React.ImgHTMLAttributes<HTMLImageElement>를 그대로 상속하므로
 * className, style, onClick, referrerPolicy 등 img의 모든 속성을 사용할 수 있습니다.
 *
 * 추가 전용 props:
 * - fallback    : 이미지 로드 실패 시 표시할 대체 이미지 경로 (기본: /no-image.svg)
 * - warnOnError : true면 로드 실패 시 console.warn 출력 (기본: false — 완전 무음)
 *
 * 주의: src는 null을 허용합니다. alt는 필수입니다.
 */
type SafeImageProps = Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> & {
  src?: string | null;
  alt: string;
  fallback?: string;
  warnOnError?: boolean;
};

export default function SafeImage({
  src,
  alt,
  fallback = NO_IMAGE,
  warnOnError = false,
  onError,
  ...rest  // className, style, onClick, referrerPolicy 등 img의 모든 나머지 속성
}: SafeImageProps) {

  const [errored, setErrored] = useState(false);

  // src가 없거나 빈 문자열이면 요청 자체를 보내지 않고 바로 fallback 표시
  // → 브라우저가 404 요청을 보내지 않아 콘솔 에러가 생기지 않음
  const imgSrc = !src || src.trim() === '' ? fallback : errored ? fallback : src;

  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    if (!errored) {
      setErrored(true);

      if (warnOnError) {
        console.warn(`[SafeImage] 이미지 로드 실패: ${src}`);
      }

      // React state 업데이트 전 깜빡임 방지 — DOM을 직접 바꿔서 즉시 교체
      e.currentTarget.src = fallback;
    }

    // 부모에서 onError를 추가로 처리하고 싶을 때 위임
    onError?.(e);
  };

  return (
    <img
      src={imgSrc}
      alt={alt}
      onError={handleError}
      {...rest}
    />
  );
}
