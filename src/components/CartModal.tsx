'use client';

import { createPortal } from 'react-dom';
import { X, Plus, Minus, Trash2, CreditCard } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useModalScroll } from '../hooks/useModalScroll';
import LazyImage from './LazyImage';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
}

export default function CartModal({ isOpen, onClose, onCheckout }: CartModalProps) {
  const { items, updateQuantity, removeFromCart, subtotal, shippingCharge, taxAmount, total, getItemPrice, updateCartItem, taxSettings } = useCart();

  useModalScroll(isOpen);

  if (!isOpen) return null;

  const modalContent = (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />

      {/* Modal */}
      <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-end sm:justify-center">
        <div className="bg-white border-4 border-black w-full sm:w-full sm:max-w-2xl h-[90dvh] sm:h-[85dvh] overflow-hidden flex flex-col animate-slide-up rounded-t-3xl sm:rounded-3xl">
          <div className="flex-shrink-0 pt-2 pb-4 px-4 sm:px-6 border-b-4 border-black bg-[#B5E5CF] rounded-t-3xl">
            <div className="w-12 h-1.5 bg-black rounded-full mx-auto mb-4"></div>

            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-black">Shopping Cart</h2>
                <p className="text-black font-medium text-sm">
                  {items.length === 0 ? 'Your cart is empty' : `${items.length} ${items.length === 1 ? 'item' : 'items'} in cart`}
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full flex items-center justify-center border-2 border-black hover:bg-white transition-all hover:scale-110 bg-white"
              >
                <X className="w-5 h-5 text-black" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-white" style={{ overscrollBehavior: 'contain' }}>
            {items.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-black font-medium text-lg">Add some products to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.cart_item_id} className="flex gap-4 bg-[#B5E5CF] rounded-2xl p-4 border-2 border-black hover:shadow-lg transition-all">
                    <LazyImage
                      src={item.image_url}
                      alt={item.name}
                      className="w-24 h-24 object-cover rounded-xl border-2 border-black"
                    />
                    <div className="flex-1 flex flex-col">
                      <h3 className="font-bold text-black mb-1 text-lg">{item.name}</h3>

                      {(item.sizes && item.sizes.length > 0 || item.colors && item.colors.length > 0) && (
                        <div className="flex gap-2 mb-2">
                          {item.sizes && item.sizes.length > 0 && (
                            <select
                              value={item.selectedSize || ''}
                              onChange={(e) => updateCartItem(item.cart_item_id!, e.target.value, item.selectedColor)}
                              className="text-xs bg-white text-black px-2 py-1 rounded-full font-bold border-2 border-black focus:outline-none focus:ring-2 focus:ring-black"
                            >
                              <option value="">Size</option>
                              {item.sizes.map((size, idx) => (
                                <option key={idx} value={size}>{size}</option>
                              ))}
                            </select>
                          )}
                          {item.colors && item.colors.length > 0 && (
                            <select
                              value={item.selectedColor || ''}
                              onChange={(e) => updateCartItem(item.cart_item_id!, item.selectedSize, e.target.value)}
                              className="text-xs bg-white text-black px-2 py-1 rounded-full font-bold border-2 border-black focus:outline-none focus:ring-2 focus:ring-black"
                            >
                              <option value="">Color</option>
                              {item.colors.map((color, idx) => (
                                <option key={idx} value={color}>{color}</option>
                              ))}
                            </select>
                          )}
                        </div>
                      )}

                      <p className="text-xl font-bold text-black mb-3">
                        {'₹'}{(getItemPrice(item) * item.quantity).toFixed(2)}
                      </p>

                      <div className="flex items-center gap-2 mt-auto">
                        <button
                          onClick={() => updateQuantity(item.cart_item_id!, item.quantity - 1)}
                          className="w-9 h-9 bg-white rounded-lg flex items-center justify-center border-2 border-black hover:bg-gray-100 transition-colors"
                        >
                          <Minus className="w-4 h-4 text-black" />
                        </button>
                        <span className="w-12 text-center font-bold text-black text-lg">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.cart_item_id!, item.quantity + 1)}
                          className="w-9 h-9 bg-white rounded-lg flex items-center justify-center border-2 border-black hover:bg-gray-100 transition-colors"
                        >
                          <Plus className="w-4 h-4 text-black" />
                        </button>
                        <button
                          onClick={() => removeFromCart(item.cart_item_id!)}
                          className="ml-auto w-9 h-9 bg-white rounded-lg flex items-center justify-center border-2 border-black hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-black" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {items.length > 0 && (
            <div className="bg-white p-4 sm:p-6 border-t-4 border-black flex-shrink-0">
              {subtotal < 2000 && (
                <div className="mb-4 p-3 bg-[#B5E5CF] rounded-xl border-2 border-black">
                  <p className="text-sm font-bold text-black mb-1">
                    {'Add ₹'}{(2000 - subtotal).toFixed(2)}{' more for FREE shipping!'}
                  </p>
                  <div className="w-full bg-white rounded-full h-2 border-2 border-black">
                    <div
                      className="bg-black h-full rounded-full transition-all duration-300"
                      style={{ width: `${Math.min((subtotal / 2000) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              )}
              {subtotal >= 2000 && (
                <div className="mb-4 p-3 bg-[#B5E5CF] rounded-xl border-2 border-black">
                  <p className="text-sm font-bold text-black text-center">
                    {"You've unlocked FREE shipping!"}
                  </p>
                </div>
              )}
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-black">
                  <span className="text-base font-medium">Subtotal</span>
                  <span className="font-bold">{'₹'}{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-black">
                  <span className="text-base font-medium">Shipping</span>
                  <span className="font-bold">
                    {shippingCharge === 0 && subtotal >= 2000 ? 'FREE' : `₹${shippingCharge.toFixed(2)}`}
                  </span>
                </div>
                {taxSettings?.is_enabled && !taxSettings?.include_in_price && taxAmount > 0 && (
                  <div className="flex items-center justify-between text-black">
                    <span className="text-base font-medium">{taxSettings.tax_label} ({taxSettings.tax_percentage}%)</span>
                    <span className="font-bold">{'₹'}{taxAmount.toFixed(2)}</span>
                  </div>
                )}
                {taxSettings?.is_enabled && taxSettings?.include_in_price && items.length > 0 && (
                  <div className="flex items-center justify-between text-black text-sm">
                    <span className="font-medium">Inclusive of {taxSettings.tax_label} ({taxSettings.tax_percentage}%)</span>
                    <span className="font-bold">{'₹'}{(subtotal - (subtotal / (1 + taxSettings.tax_percentage / 100))).toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t-2 border-black pt-2 flex items-center justify-between">
                  <span className="text-xl font-bold text-black">Total</span>
                  <span className="text-3xl font-bold text-black">{'₹'}{total.toFixed(2)}</span>
                </div>
              </div>
              <button
                onClick={() => {
                  onCheckout();
                  onClose();
                }}
                className="w-full bg-[#B5E5CF] text-black py-4 rounded-xl font-bold text-lg hover:bg-white transition-colors border-2 border-black flex items-center justify-center gap-2"
              >
                <CreditCard className="w-5 h-5" />
                Proceed to Checkout
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );

  return createPortal(modalContent, document.body);
}
