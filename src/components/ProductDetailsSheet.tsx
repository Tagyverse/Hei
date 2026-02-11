'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ShoppingCart, ChevronLeft, ChevronRight, Heart, Copy, Check } from 'lucide-react';
import { useModalScroll } from '../hooks/useModalScroll';
import type { Product } from '../types';
import { useCart } from '../contexts/CartContext';
import { useFavorites } from '../contexts/FavoritesContext';
import LazyImage from './LazyImage';

interface ProductDetailsSheetProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onCartClick: () => void;
}

export default function ProductDetailsSheet({ product, isOpen, onClose, onCartClick }: ProductDetailsSheetProps) {
  useModalScroll(isOpen);
  const { addToCart, isInCart } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    if (product) {
      setCurrentImageIndex(0);
      setQuantity(1);
      setSelectedSize(product.default_size || '');
      setSelectedColor(product.default_color || '');
    }
  }, [product]);

  if (!isOpen || !product) return null;

  const allImages = [
    product.image_url || '/placeholder.svg',
    ...(product.gallery_images && Array.isArray(product.gallery_images) 
      ? product.gallery_images.filter(img => img && typeof img === 'string')
      : [])
  ].filter(Boolean);

  const currentImage = allImages[currentImageIndex] || '/placeholder.svg';
  const comparePrice = product.compare_at_price && product.compare_at_price > 0 ? product.compare_at_price : product.price;
  const currentPrice = product.price < comparePrice ? product.price : comparePrice;
  const hasDiscount = comparePrice > product.price;
  const discountPercentage = hasDiscount ? Math.round(((comparePrice - product.price) / comparePrice) * 100) : 0;

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedSize || undefined, selectedColor || undefined);
    onCartClick();
    onClose();
  };

  const handleCopyLink = () => {
    const shareUrl = window.location.href;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  const modalContent = (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[9998] bg-black/50 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <div className="w-full max-w-2xl max-h-[90dvh] overflow-y-auto bg-white rounded-2xl shadow-2xl border-4 border-black" style={{ overscrollBehavior: 'contain' }}>
          {/* Header */}
          <div className="sticky top-0 z-20 bg-gradient-to-r from-teal-50 to-mint-50 px-4 sm:px-6 py-4 flex items-center justify-between border-b-4 border-black">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 truncate">{product.name}</h2>
            <button
              onClick={onClose}
              className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center bg-white hover:bg-gray-100 transition-all border-2 border-black"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-black" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6 space-y-6">
            {/* Image Gallery */}
            <div className="space-y-3">
              <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden border-4 border-black aspect-square">
                <LazyImage
                  src={currentImage}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />

                {allImages.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full transition-all border-2 border-black"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="w-5 h-5 text-black" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full transition-all border-2 border-black"
                      aria-label="Next image"
                    >
                      <ChevronRight className="w-5 h-5 text-black" />
                    </button>
                    <div className="absolute bottom-3 right-3 bg-black/70 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      {currentImageIndex + 1} / {allImages.length}
                    </div>
                  </>
                )}

                {hasDiscount && (
                  <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                    -{discountPercentage}%
                  </div>
                )}
              </div>

              {allImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-3 transition-all ${
                        idx === currentImageIndex ? 'border-black' : 'border-gray-300'
                      }`}
                    >
                      <LazyImage src={img} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Price Section */}
            <div className="bg-gradient-to-r from-teal-50 to-mint-50 p-4 rounded-xl border-4 border-black">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-gray-900">{'₹'}{currentPrice?.toFixed(2)}</span>
                {hasDiscount && (
                  <span className="text-lg text-gray-500 line-through">{'₹'}{product.price?.toFixed(2)}</span>
                )}
              </div>
              {product.description && (
                <p className="text-sm text-gray-700 mt-3">{product.description}</p>
              )}
            </div>

            {/* Options */}
            {(product.sizes && product.sizes.length > 0 || product.colors && product.colors.length > 0) && (
              <div className="space-y-4">
                {product.sizes && product.sizes.length > 0 && (
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">Size</label>
                    <div className="flex flex-wrap gap-2">
                      {product.sizes.map((size) => (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={`px-4 py-2 rounded-lg border-3 font-semibold transition-all ${
                            selectedSize === size
                              ? 'bg-black text-white border-black'
                              : 'bg-white text-black border-gray-300 hover:border-black'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {product.colors && product.colors.length > 0 && (
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">Color</label>
                    <div className="flex flex-wrap gap-2">
                      {product.colors.map((color) => (
                        <button
                          key={color}
                          onClick={() => setSelectedColor(color)}
                          className={`px-4 py-2 rounded-lg border-3 font-semibold transition-all ${
                            selectedColor === color
                              ? 'bg-black text-white border-black'
                              : 'bg-white text-black border-gray-300 hover:border-black'
                          }`}
                        >
                          {color}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Quantity Selector */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Quantity</label>
              <div className="flex items-center gap-4 bg-gray-100 p-2 rounded-lg border-3 border-black w-fit">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 bg-white hover:bg-gray-200 rounded-lg font-bold transition-colors"
                >
                  {'−'}
                </button>
                <span className="text-lg font-bold text-gray-900 w-8 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 py-2 bg-white hover:bg-gray-200 rounded-lg font-bold transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => toggleFavorite(product.id)}
                className={`py-3 rounded-xl font-bold border-3 transition-all flex items-center justify-center gap-2 ${
                  isFavorite(product.id)
                    ? 'bg-red-500 text-white border-red-600 hover:bg-red-600'
                    : 'bg-white text-gray-900 border-black hover:bg-gray-100'
                }`}
              >
                <Heart className={`w-5 h-5 ${isFavorite(product.id) ? 'fill-current' : ''}`} />
                <span className="hidden sm:inline">Wishlist</span>
              </button>

              <button
                onClick={handleAddToCart}
                className={`py-3 rounded-xl font-bold border-3 transition-all flex items-center justify-center gap-2 ${
                  isInCart(product.id)
                    ? 'bg-orange-500 text-white border-orange-600 hover:bg-orange-600'
                    : 'bg-emerald-500 text-white border-emerald-600 hover:bg-emerald-600'
                }`}
              >
                <ShoppingCart className="w-5 h-5" />
                {isInCart(product.id) ? 'Update Cart' : 'Add to Cart'}
              </button>
            </div>

            {/* Share Section */}
            <div className="bg-blue-50 p-4 rounded-xl border-4 border-black">
              <button
                onClick={handleCopyLink}
                className="w-full flex items-center justify-center gap-2 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-bold transition-colors"
              >
                {copySuccess ? (
                  <>
                    <Check className="w-5 h-5" />
                    Link Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5" />
                    Share Product Link
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  return createPortal(modalContent, document.body);
}
