import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { db } from '../lib/firebase';
import { ref, get } from 'firebase/database';

interface Offer {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  is_active: boolean;
}

export default function OfferDialog() {
  const [offer, setOffer] = useState<Offer | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenShown, setHasBeenShown] = useState(false);
  const [popupEnabled, setPopupEnabled] = useState(true);

  useEffect(() => {
    fetchActiveOffer();
  }, []);

  const fetchActiveOffer = async () => {
    try {
      const settingsRef = ref(db, 'site_settings');
      const settingsSnapshot = await get(settingsRef);
      let isPopupEnabled = true;

      if (settingsSnapshot.exists()) {
        const data = settingsSnapshot.val();
        const settingsId = Object.keys(data)[0];
        const settings = data[settingsId];
        isPopupEnabled = settings.popup_enabled !== false;
        setPopupEnabled(isPopupEnabled);
      }

      if (!isPopupEnabled) {
        return;
      }

      const offersRef = ref(db, 'offers');
      const snapshot = await get(offersRef);

      if (snapshot.exists()) {
        const data = snapshot.val();
        let activeOffer: Offer | null = null;

        Object.keys(data).forEach(key => {
          if (data[key].is_active) {
            activeOffer = { id: key, ...data[key] };
          }
        });

        if (activeOffer) {
          const offerShown = sessionStorage.getItem(`offer_shown_${activeOffer.id}`);

          if (!offerShown) {
            setOffer(activeOffer);
            setTimeout(() => {
              setIsVisible(true);
            }, 2000);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching active offer:', error);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      if (offer) {
        sessionStorage.setItem(`offer_shown_${offer.id}`, 'true');
        setHasBeenShown(true);
      }
    }, 300);
  };

  if (!offer || hasBeenShown || !popupEnabled) return null;

  return (
    <>
      <div
        className={`fixed inset-0 bg-black transition-opacity duration-300 z-50 ${
          isVisible ? 'bg-opacity-50' : 'bg-opacity-0 pointer-events-none'
        }`}
        onClick={handleClose}
      />

      <div
        className={`fixed inset-x-0 bottom-0 sm:top-1/2 sm:left-1/2 sm:transform sm:-translate-x-1/2 sm:-translate-y-1/2 sm:inset-x-auto z-50 transition-all duration-300 ${
          isVisible ? 'translate-y-0 sm:scale-100 opacity-100' : 'translate-y-full sm:scale-95 opacity-0 pointer-events-none'
        }`}
      >
        <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl max-w-md w-full sm:mx-4 overflow-hidden border-4 border-black">
          <div className="relative">
            <button
              onClick={handleClose}
              className="absolute top-2 right-2 sm:top-3 sm:right-3 z-20 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-all hover:scale-110 active:scale-95 border-2 border-black"
            >
              <X className="w-5 h-5 text-black" />
            </button>

            {offer.image_url && (
              <div className="w-full h-40 sm:h-48 overflow-hidden bg-[#B5E5CF]">
                <img
                  src={offer.image_url}
                  alt={offer.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="p-4 sm:p-6 lg:p-8 bg-[#B5E5CF]">
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-xl flex items-center justify-center p-1.5 border-2 border-black">
                  <img
                    src="/logo.png"
                    alt="Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-black flex-1">
                  {offer.title}
                </h2>
              </div>

              <p className="text-sm sm:text-base text-black leading-relaxed mb-4 sm:mb-6 font-medium">
                {offer.description}
              </p>

              <button
                onClick={handleClose}
                className="w-full bg-black hover:bg-gray-800 text-white py-3 sm:py-3.5 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl active:scale-95 border-2 border-black"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
