import { useState, useEffect } from 'react';
import { ShoppingBag, X } from 'lucide-react';
import { db } from '../lib/firebase';
import { ref, get } from 'firebase/database';
import { Product } from '../types';

const generateRandomIndianNumber = (): string => {
  const lastDigit = Math.floor(Math.random() * 10);
  return `+91********${lastDigit}`;
};

const getRandomDelay = () => {
  return Math.floor(Math.random() * 10000) + 8000;
};

export default function PurchaseNotification() {
  const [products, setProducts] = useState<Product[]>([]);
  const [notification, setNotification] = useState<{
    phone: string;
    product: string;
  } | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [popupEnabled, setPopupEnabled] = useState(false);

  useEffect(() => {
    checkPopupSetting();
  }, []);

  const checkPopupSetting = async () => {
    try {
      const settingsRef = ref(db, 'site_settings');
      const settingsSnapshot = await get(settingsRef);

      if (settingsSnapshot.exists()) {
        const data = settingsSnapshot.val();
        const settingsId = Object.keys(data)[0];
        const settings = data[settingsId];
        const isEnabled = settings.popup_enabled !== false;
        setPopupEnabled(isEnabled);

        if (isEnabled) {
          fetchProducts();
        }
      }
    } catch (error) {
      console.error('Error checking popup setting:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const productsRef = ref(db, 'products');
      const snapshot = await get(productsRef);

      if (snapshot.exists()) {
        const data = snapshot.val();
        const productsData: Product[] = [];

        Object.keys(data).forEach(key => {
          if (data[key].in_stock) {
            productsData.push({ id: key, ...data[key] });
          }
        });

        setProducts(productsData.slice(0, 20));
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  useEffect(() => {
    if (products.length === 0 || !popupEnabled) return;

    const showNotification = () => {
      const randomProduct = products[Math.floor(Math.random() * products.length)];
      const phone = generateRandomIndianNumber();

      setNotification({
        phone,
        product: randomProduct.name,
      });
      setIsVisible(true);

      setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => {
          setNotification(null);
        }, 500);
      }, 5000);
    };

    const initialDelay = setTimeout(() => {
      showNotification();

      const interval = setInterval(() => {
        showNotification();
      }, getRandomDelay());

      return () => clearInterval(interval);
    }, getRandomDelay());

    return () => clearTimeout(initialDelay);
  }, [products, popupEnabled]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      setNotification(null);
    }, 500);
  };

  if (!notification || !popupEnabled) return null;

  return (
    <div
      className={`fixed top-24 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-500 ${
        isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
      }`}
    >
      <div className="bg-white shadow-2xl rounded-lg border border-gray-200 px-5 py-3 flex items-center gap-3 min-w-[320px] max-w-[400px]">
        <div className="bg-green-100 rounded-full p-2">
          <ShoppingBag className="w-5 h-5 text-green-600" />
        </div>

        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-900">
            {notification.phone}
          </p>
          <p className="text-xs text-gray-600">
            just bought <span className="font-medium">{notification.product}</span>
          </p>
        </div>

        <button
          onClick={handleClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
