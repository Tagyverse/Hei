import { useState, useEffect, useRef } from 'react';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  onClick?: () => void;
}

export default function LazyImage({ src, alt, className = '', onClick }: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!imgRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '150px',
        threshold: 0.01,
      }
    );

    observer.observe(imgRef.current);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div ref={imgRef} className={`${className} relative overflow-hidden`}>
      {!isLoaded && isInView && (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer bg-[length:200%_100%]" />
      )}
      {isInView ? (
        <img
          src={src}
          alt={alt}
          className={`${className} transition-all duration-500 ease-out ${
            !isLoaded
              ? 'opacity-0 scale-95 blur-sm'
              : 'opacity-100 scale-100 blur-0'
          }`}
          loading="lazy"
          onLoad={() => setIsLoaded(true)}
          onClick={onClick}
        />
      ) : (
        <div className={`${className} bg-gray-200`} />
      )}
    </div>
  );
}
