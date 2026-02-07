import React, { useState, useEffect } from 'react';
import { X, Sparkles } from 'lucide-react';
import { db } from '../lib/firebase';
import { ref, get } from 'firebase/database';
import type { Product } from '../types';
import LazyImage from './LazyImage';
import VirtualTryOn from './VirtualTryOn';

interface TryOnProductListProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TryOnProductList({ isOpen, onClose }: TryOnProductListProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showTryOn, setShowTryOn] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadTryOnProducts();
    }
  }, [isOpen]);

  const loadTryOnProducts = async () => {
    try {
      setLoading(true);
      const productsRef = ref(db, 'products');
      const snapshot = await get(productsRef);

      if (snapshot.exists()) {
        const data = snapshot.val();
        const tryOnProducts = Object.entries(data)
          .map(([id, prod]: [string, any]) => ({
            id,
            ...prod,
          }))
          .filter((p: Product) =>
            p.try_on_enabled &&
            p.in_stock &&
            (p.isVisible !== false)
          );

        setProducts(tryOnProducts);
      }
    } catch (error) {
      console.error('Error loading try-on products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTryOn = (product: Product) => {
    setSelectedProduct(product);
    setShowTryOn(true);
  };

  if (!isOpen) return null;

  return (
    <>
      <VirtualTryOn
        isOpen={showTryOn}
        onClose={() => {
          setShowTryOn(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct!}
      />

      <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white bg-opacity-20 rounded-full p-3">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Virtual Try-On Products</h2>
                <p className="text-white text-opacity-90 text-sm">
                  Select a product to try it on virtually
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
                  <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600 font-semibold">Loading products...</p>
                </div>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-8 max-w-md mx-auto">
                  <Sparkles className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-800 mb-2">No Try-On Products Yet</h3>
                  <p className="text-gray-600">
                    We're working on adding virtual try-on capability to our products. Check back soon!
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:border-blue-300 group cursor-pointer"
                    onClick={() => handleTryOn(product)}
                  >
                    <div className="relative">
                      <LazyImage
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <div className="bg-white text-blue-600 px-6 py-2 rounded-full font-bold shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                          Try It On
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-gray-800 mb-2 line-clamp-2">{product.name}</h3>
                      <p className="text-lg font-bold text-blue-600">₹{product.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
