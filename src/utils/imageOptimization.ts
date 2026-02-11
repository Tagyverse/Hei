export interface ImageCompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  maxSizeMB?: number;
}

export async function compressImage(
  file: File,
  options: ImageCompressionOptions = {}
): Promise<Blob> {
  const {
    maxWidth = 1200,
    maxHeight = 1200,
    quality = 0.8,
  } = options;

  const isPNG = file.type === 'image/png';

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            if (width > maxWidth) {
              height = (height * maxWidth) / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = (width * maxHeight) / height;
              height = maxHeight;
            }
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d', { alpha: isPNG });
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        if (!isPNG) {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          isPNG ? 'image/png' : 'image/jpeg',
          quality
        );
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Generate optimized srcSet for Cloudinary images
export const generateOptimizedSrcSet = (url: string) => {
  if (!url || !url.includes('cloudinary')) return url;
  
  const sizes = [320, 640, 960, 1280];
  return sizes
    .map(size => {
      const optimizedUrl = url.includes('upload')
        ? url.replace('/upload/', `/upload/w_${size},q_auto,f_auto,c_scale/`)
        : url;
      return `${optimizedUrl} ${size}w`;
    })
    .join(', ');
};

// Optimize Cloudinary URL with auto format and quality
export const getOptimizedImageUrl = (url: string, width?: number) => {
  if (!url || !url.includes('cloudinary')) return url;
  
  const w = width || 800;
  return url.includes('upload')
    ? url.replace('/upload/', `/upload/w_${w},q_auto,f_auto,c_scale/`)
    : url;
};

// Create lazy load observer for images
export const setupLazyLoadImages = () => {
  if (!('IntersectionObserver' in window)) return;

  const imageElements = document.querySelectorAll('img[data-src]');
  
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        const dataSrc = img.getAttribute('data-src');
        const dataSrcSet = img.getAttribute('data-srcset');
        
        if (dataSrc) {
          img.src = dataSrc;
          img.classList.add('loaded');
        }
        if (dataSrcSet) {
          img.srcset = dataSrcSet;
        }
        
        imageObserver.unobserve(img);
      }
    });
  }, {
    rootMargin: '50px',
    threshold: 0.01
  });

  imageElements.forEach(img => imageObserver.observe(img));
  return imageObserver;
};

// Preload critical images
export const preloadCriticalImages = (urls: string[]) => {
  urls.forEach(url => {
    if (document.querySelector(`link[href="${url}"]`)) return;
    
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = getOptimizedImageUrl(url, 1280);
    document.head.appendChild(link);
  });
};

// Get WebP with fallback
export const getWebPImage = (url: string) => ({
  webp: getOptimizedImageUrl(url, 800).replace('/upload/', '/upload/f_webp/'),
  jpg: getOptimizedImageUrl(url, 800)
});
