import React, { useState } from 'react';

const NO_IMAGE = '/no-image.svg';

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
  loading = 'lazy',
  decoding = 'async',
  onError,
  ...rest
}: SafeImageProps) {
  const [errored, setErrored] = useState(false);
  const imgSrc = !src || src.trim() === '' ? fallback : errored ? fallback : src;

  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    if (!errored) {
      setErrored(true);

      if (warnOnError) {
        console.warn(`[SafeImage] 이미지 로드 실패: ${src}`);
      }

      e.currentTarget.src = fallback;
    }

    onError?.(e);
  };

// 이미지 소스, 대체 텍스트, 로딩 및 디코딩 설정, 에러 핸들링 등을 포함하여 표준 img 요소를 렌더링합니다.
  return (
    <img
      src={imgSrc}
      alt={alt}
      loading={loading}
      decoding={decoding}
      onError={handleError}
      {...rest}
    />
  );
}
