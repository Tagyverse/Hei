import { useState, useEffect } from 'react';
import { X, Gift, Copy, Check } from 'lucide-react';
import { db } from '../lib/firebase';
import { ref, get, update } from 'firebase/database';
import { useAuth } from '../contexts/AuthContext';
import type { Coupon } from '../types';

export default function WelcomeCouponDialog() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [welcomeCoupon, setWelcomeCoupon] = useState<Coupon | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const checkAndShowWelcomeCoupon = async () => {
      if (!user) return;

      try {
        const userRef = ref(db, `users/${user.uid}`);
        const userSnapshot = await get(userRef);

        if (userSnapshot.exists()) {
          const userData = userSnapshot.val();

          if (!userData.welcome_coupon_shown) {
            const couponsRef = ref(db, 'coupons');
            const couponsSnapshot = await get(couponsRef);

            if (couponsSnapshot.exists()) {
              const coupons = couponsSnapshot.val();
              const welcomeCouponEntry = Object.entries(coupons).find(
                ([_, coupon]: [string, any]) =>
                  coupon.is_active &&
                  (coupon.code.toUpperCase().includes('WELCOME') ||
                    coupon.code.toUpperCase().includes('NEW') ||
                    coupon.description?.toLowerCase().includes('new user') ||
                    coupon.description?.toLowerCase().includes('welcome'))
              );

              if (welcomeCouponEntry) {
                const [couponId, couponData] = welcomeCouponEntry;
                setWelcomeCoupon({ id: couponId, ...couponData } as Coupon);
                setIsOpen(true);
              }
            }
          }
        } else {
          await update(userRef, {
            welcome_coupon_shown: false,
            created_at: new Date().toISOString()
          });
        }
      } catch (error) {
        console.error('Error checking welcome coupon:', error);
      }
    };

    checkAndShowWelcomeCoupon();
  }, [user]);

  const handleClose = async () => {
    if (user && welcomeCoupon) {
      try {
        const userRef = ref(db, `users/${user.uid}`);
        await update(userRef, {
          welcome_coupon_shown: true,
          welcome_coupon_code: welcomeCoupon.code,
          welcome_coupon_shown_at: new Date().toISOString()
        });
      } catch (error) {
        console.error('Error updating user welcome coupon status:', error);
      }
    }
    setIsOpen(false);
  };

  const handleCopy = () => {
    if (welcomeCoupon) {
      navigator.clipboard.writeText(welcomeCoupon.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isOpen || !welcomeCoupon) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose}></div>

      <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl max-w-md mx-auto w-full border-t-4 border-black animate-slide-up max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-[#B5E5CF] p-6 relative border-b-4 border-black rounded-t-3xl flex-shrink-0">
          <div className="w-12 h-1.5 bg-black rounded-full mx-auto mb-4"></div>
          <button
            onClick={handleClose}
            className="absolute top-6 right-6 w-10 h-10 bg-white rounded-full flex items-center justify-center border-2 border-black hover:bg-gray-100 transition-all hover:scale-110"
          >
            <X className="w-5 h-5 text-black" />
          </button>
        </div>

        <div className="text-center p-8 bg-white overflow-y-auto flex-1">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 border-3 border-black">
            <Gift className="w-10 h-10 text-black" />
          </div>

          <h2 className="text-3xl font-bold text-black mb-3">Welcome Gift!</h2>
          <p className="text-black mb-6">
            As a thank you for joining us, here's a special discount just for you!
          </p>

          {welcomeCoupon.description && (
            <p className="text-sm text-black mb-4 italic font-medium">
              {welcomeCoupon.description}
            </p>
          )}

          <div className="bg-white rounded-2xl p-6 mb-6 border-3 border-black">
            <p className="text-sm font-semibold text-black mb-2">Your Coupon Code</p>
            <div className="flex items-center justify-center gap-3">
              <div className="bg-[#B5E5CF] px-6 py-3 rounded-xl border-2 border-black">
                <p className="text-2xl font-bold text-black tracking-wider">
                  {welcomeCoupon.code}
                </p>
              </div>
              <button
                onClick={handleCopy}
                className="p-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors border-2 border-black"
                title="Copy code"
              >
                {copied ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <Copy className="w-5 h-5" />
                )}
              </button>
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-center gap-2 text-sm text-black">
                <span className="font-semibold">Discount:</span>
                <span className="font-bold">
                  {welcomeCoupon.discount_type === 'percentage'
                    ? `${welcomeCoupon.discount_value}% OFF`
                    : `₹${welcomeCoupon.discount_value} OFF`}
                </span>
              </div>

              {welcomeCoupon.min_purchase && (
                <p className="text-xs text-black">
                  Min. purchase: ₹{welcomeCoupon.min_purchase}
                </p>
              )}

              {welcomeCoupon.valid_until && (
                <p className="text-xs text-black">
                  Valid until: {new Date(welcomeCoupon.valid_until).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={handleClose}
            className="w-full py-3 bg-[#B5E5CF] text-black rounded-xl font-bold hover:bg-white transition-all border-2 border-black"
          >
            Start Shopping
          </button>

          <p className="text-xs text-black mt-4 font-medium">
            Use this code at checkout to get your discount
          </p>
        </div>
      </div>
    </div>
  );
}
