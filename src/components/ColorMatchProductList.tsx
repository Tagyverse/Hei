import React, { useState, useEffect } from 'react';
import { X, Sparkles, Upload, CheckCircle } from 'lucide-react';
import { db } from '../lib/firebase';
import { ref, get } from 'firebase/database';
import type { Product } from '../types';
import LazyImage from './LazyImage';
import DressColorMatcher from './DressColorMatcher';

interface ColorMatchProductListProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ColorMatchProductList({ isOpen, onClose }: ColorMatchProductListProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showColorMatcher, setShowColorMatcher] = useState(false);
  const [allAvailableColors, setAllAvailableColors] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      loadColorMatchProducts();
    }
  }, [isOpen]);

  const loadColorMatchProducts = async () => {
    try {
      setLoading(true);
      const productsRef = ref(db, 'products');
      const snapshot = await get(productsRef);

      if (snapshot.exists()) {
        const data = snapshot.val();
        const colorMatchProducts = Object.entries(data)
          .map(([id, prod]: [string, any]) => ({
            id,
            ...prod,
          }))
          .filter((p: Product) =>
            p.availableColors &&
            p.availableColors.length > 0 &&
            p.in_stock &&
            (p.isVisible !== false)
          );

        setProducts(colorMatchProducts);

        const allColors = new Set<string>();
        colorMatchProducts.forEach((p: Product) => {
          p.availableColors?.forEach(color => allColors.add(color));
        });
        setAllAvailableColors(Array.from(allColors));
      }
    } catch (error) {
      console.error('Error loading color match products:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <DressColorMatcher
        isOpen={showColorMatcher}
        onClose={() => setShowColorMatcher(false)}
        availableColors={allAvailableColors}
      />

      <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
          <div className="bg-gradient-to-r from-pink-500 via-rose-500 to-purple-500 p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white bg-opacity-20 rounded-full p-3">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Color Match Products</h2>
                <p className="text-white text-opacity-90 text-sm">
                  Products available for color matching
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="bg-white bg-opacity-20 backdrop-blur-sm text-white p-2 rounded-full hover:bg-opacity-30 transition-all duration-200"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="overflow-y-auto max-h-[calc(90vh-8rem)] p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600 font-semibold">Loading products...</p>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <button
                    onClick={() => setShowColorMatcher(true)}
                    className="w-full bg-gradient-to-r from-pink-500 via-rose-500 to-purple-500 text-white py-6 px-8 rounded-2xl font-bold hover:shadow-xl transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-3 group"
                  >
                    <Upload className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
                    <span>Upload Your Dress Photo to Find Matches</span>
                  </button>
                  <p className="text-center text-gray-500 text-sm mt-3">
                    Our AI will analyze your dress colors and show you perfectly matching accessories
                  </p>
                </div>

                {products.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-8 max-w-md mx-auto">
                      <Sparkles className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-gray-800 mb-2">No Color Match Products Yet</h3>
                      <p className="text-gray-600">
                        We're working on adding color information to our products. Check back soon!
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <h3 className="text-lg font-bold text-gray-800 mb-4">
                      Available Products ({products.length})
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {products.map((product) => (
                        <div
                          key={product.id}
                          className="bg-white border-2 border-pink-200 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:border-pink-400 hover:shadow-pink-200"
                        >
                          <div className="relative">
                            <LazyImage
                              src={product.image_url}
                              alt={product.name}
                              className="w-full h-48 object-cover"
                            />
                            <div className="absolute top-2 left-2">
                              <div className="bg-pink-500 text-white px-2.5 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1.5">
                                <CheckCircle className="w-3.5 h-3.5" />
                                Color Match Available
                              </div>
                            </div>
                          </div>
                          <div className="p-4">
                            <h3 className="font-bold text-gray-800 mb-2 line-clamp-2">{product.name}</h3>
                            <p className="text-lg font-bold text-pink-600 mb-2">₹{product.price}</p>
                            <div className="space-y-2">
                              <p className="text-xs font-semibold text-gray-600">Available Colors:</p>
                              <div className="flex flex-wrap gap-1">
                                {product.availableColors?.slice(0, 3).map((color, idx) => (
                                  <span
                                    key={idx}
                                    className="bg-pink-100 text-pink-700 px-2 py-1 rounded-full text-xs font-semibold capitalize"
                                  >
                                    {color}
                                  </span>
                                ))}
                                {product.availableColors && product.availableColors.length > 3 && (
                                  <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-semibold">
                                    +{product.availableColors.length - 3}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
