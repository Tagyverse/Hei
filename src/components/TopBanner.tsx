import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { ref, get } from 'firebase/database';

export default function TopBanner() {
  const [bannerContent, setBannerContent] = useState({
    text: '🎉 Grand Opening Sale! Get 20% OFF on all items!',
    isVisible: true,
    backgroundColor: '#f59e0b'
  });

  useEffect(() => {
    async function loadBanner() {
      try {
        const [bannerSnapshot, visibilitySnapshot] = await Promise.all([
          get(ref(db, 'site_content/top_banner')),
          get(ref(db, 'default_sections_visibility/marquee'))
        ]);

        let content = bannerContent;
        if (bannerSnapshot.exists()) {
          const data = bannerSnapshot.val();
          if (data.value) {
            content = data.value;
          }
        }

        if (visibilitySnapshot.exists()) {
          content = { ...content, isVisible: visibilitySnapshot.val() && content.isVisible };
        }

        setBannerContent(content);
      } catch (error) {
        console.error('Error loading top banner:', error);
      }
    }

    loadBanner();
  }, []);

  if (!bannerContent.isVisible) {
    return null;
  }

  return (
    <div
      className="text-white py-2 overflow-hidden"
      style={{ backgroundColor: bannerContent.backgroundColor }}
    >
      <div className="animate-marquee whitespace-nowrap inline-block">
        <span className="text-sm font-semibold mx-8">{bannerContent.text}</span>
        <span className="text-sm font-semibold mx-8">{bannerContent.text}</span>
        <span className="text-sm font-semibold mx-8">{bannerContent.text}</span>
        <span className="text-sm font-semibold mx-8">{bannerContent.text}</span>
      </div>
    </div>
  );
}
