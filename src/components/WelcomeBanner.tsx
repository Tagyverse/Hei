import { useState, useEffect } from 'react';
import { Instagram, Mail, Facebook, Twitter, MessageCircle, Linkedin, Youtube, AtSign, Link as LinkIcon } from 'lucide-react';
import { db } from '../lib/firebase';
import { ref, get } from 'firebase/database';

interface SocialLink {
  id: string;
  platform: string;
  url: string;
  icon: string;
  order: number;
}

const PLATFORM_ICONS = {
  instagram: Instagram,
  facebook: Facebook,
  twitter: Twitter,
  email: Mail,
  whatsapp: MessageCircle,
  linkedin: Linkedin,
  youtube: Youtube,
  tiktok: AtSign,
  custom: LinkIcon
};

export default function WelcomeBanner() {
  const [bannerContent, setBannerContent] = useState({
    title: 'Welcome to Pixie Blooms!',
    subtitle: 'Discover our exclusive collection of handcrafted hair accessories',
    isVisible: true
  });

  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const bannerRef = ref(db, 'site_content/welcome_banner');
        const bannerSnapshot = await get(bannerRef);
        if (bannerSnapshot.exists()) {
          const data = bannerSnapshot.val();
          if (data.value) {
            setBannerContent(data.value);
          }
        }

        const socialRef = ref(db, 'social_links');
        const socialSnapshot = await get(socialRef);
        if (socialSnapshot.exists()) {
          const data = socialSnapshot.val();
          const linksArray = Object.entries(data).map(([id, link]: [string, any]) => ({
            id,
            ...link
          }));
          setSocialLinks(linksArray.sort((a, b) => a.order - b.order));
        } else {
          setSocialLinks([
            {
              id: 'default_instagram',
              platform: 'instagram',
              url: 'https://www.instagram.com/pixieblooms',
              icon: 'instagram',
              order: 0
            },
            {
              id: 'default_email',
              platform: 'email',
              url: 'mailto:pixieblooms2512@gmail.com',
              icon: 'email',
              order: 1
            }
          ]);
        }
      } catch (error) {
        console.error('Error loading banner data:', error);
      }
    }

    loadData();
  }, []);

  if (!bannerContent.isVisible) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-pink-50 via-purple-50 to-teal-50 border-b border-teal-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <p className="text-xs sm:text-sm text-gray-600 font-medium">
            {bannerContent.title} - {bannerContent.subtitle}
          </p>
          {socialLinks.length > 0 && (
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500 hidden sm:inline">Follow Us:</span>
              <div className="flex items-center gap-2">
                {socialLinks.map((link) => {
                  const Icon = PLATFORM_ICONS[link.icon as keyof typeof PLATFORM_ICONS] || LinkIcon;
                  return (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-7 h-7 rounded-full bg-white border border-teal-200 flex items-center justify-center hover:bg-teal-500 hover:text-white hover:border-teal-500 transition-all duration-300 group"
                      aria-label={link.platform}
                    >
                      <Icon className="w-3.5 h-3.5 text-gray-600 group-hover:text-white" />
                    </a>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
