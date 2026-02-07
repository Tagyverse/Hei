import { useState, useEffect } from 'react';
import { Heart, ShoppingCart } from 'lucide-react';
import { db } from '../lib/firebase';
import { ref, get } from 'firebase/database';
import type { Product } from '../types';
import { useCart } from '../contexts/CartContext';
import { useFavorites } from '../contexts/FavoritesContext';
import LazyImage from './LazyImage';
import { useCardDesign, getCardStyles } from '../hooks/useCardDesign';

interface MightYouLikeProps {
  onProductClick: (product: Product) => void;
  onCartClick: () => void;
}

export default function MightYouLike({ onProductClick, onCartClick }: MightYouLikeProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const { addToCart, isInCart } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { design } = useCardDesign('might_you_like');
  const cardStyles = getCardStyles(design);

  const itemsPerPage = 4;

  useEffect(() => {
    async function fetchProducts() {
      try {
        const productsRef = ref(db, 'products');
        const snapshot = await get(productsRef);

        if (snapshot.exists()) {
          const data = snapshot.val();
          const productsArray: Product[] = [];

          Object.keys(data).forEach(key => {
            if (data[key].might_you_like) {
              productsArray.push({ id: key, ...data[key] });
            }
          });

          productsArray.sort((a, b) => {
            const dateA = new Date(a.createdAt || 0).getTime();
            const dateB = new Date(b.createdAt || 0).getTime();
            return dateB - dateA;
          });

          setProducts(productsArray);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  if (loading || products.length === 0) {
    return null;
  }

  const visibleProducts = products.slice(currentIndex, currentIndex + itemsPerPage);

  return (
    <section className="relative py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8 sm:mb-10 lg:mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 px-4">
            Might You Like ❤️
          </h2>
        </div>

        <div className="relative">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {visibleProducts.map((product, index) => (
              <div
                key={product.id}
                onClick={() => onProductClick(product)}
                className={`group bg-white overflow-hidden transition-all duration-300 cursor-pointer ${cardStyles.container || 'border-2 border-transparent hover:border-teal-500'}`}
                style={{
                  animationDelay: `${index * 0.1}s`,
                  ...cardStyles.style,
                  transform: 'translateY(0)',
                }}
                onMouseEnter={(e) => {
                  if (cardStyles.hoverTransform) {
                    e.currentTarget.style.transform = cardStyles.hoverTransform;
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div
                  className="relative aspect-square overflow-hidden bg-gray-100"
                  style={cardStyles.imageStyle}
                >
                  <LazyImage
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover transition-all duration-500"
                  />

                  <div className="absolute top-3 right-3 flex flex-col gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(product.id);
                      }}
                      className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all ${
                        isFavorite(product.id)
                          ? 'bg-red-500 hover:bg-red-600'
                          : 'bg-white hover:bg-gray-100 opacity-0 group-hover:opacity-100'
                      }`}
                    >
                      <Heart className={`w-5 h-5 transition-all ${
                        isFavorite(product.id)
                          ? 'text-white fill-white'
                          : 'text-gray-700'
                      }`} />
                    </button>
                  </div>

                  {product.compare_at_price && (
                    <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1.5 text-xs font-bold shadow-lg">
                      SALE
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity"></div>
                </div>

                <div className="p-4 sm:p-5 border-t-4 border-gray-900">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 line-clamp-1">
                    {product.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 mb-3 line-clamp-2 leading-relaxed">
                    {product.description}
                  </p>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg sm:text-xl font-bold text-gray-900">
                        ₹{product.price.toFixed(2)}
                      </span>
                      {product.compare_at_price && (
                        <span className="text-xs sm:text-sm text-gray-400 line-through">
                          ₹{product.compare_at_price.toFixed(2)}
                        </span>
                      )}
                    </div>
                    {isInCart(product.id) ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onCartClick();
                        }}
                        className={`w-full bg-emerald-600 text-white py-2 sm:py-2.5 text-xs sm:text-sm font-semibold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-1.5 sm:gap-2 shadow-md ${cardStyles.button}`}
                      >
                        <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        Go to Cart
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(product);
                        }}
                        className={`w-full bg-gray-900 text-white py-2 sm:py-2.5 text-xs sm:text-sm font-semibold hover:bg-gray-700 transition-colors flex items-center justify-center gap-1.5 sm:gap-2 shadow-md ${cardStyles.button}`}
                      >
                        <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        Add to Cart
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {products.length > itemsPerPage && (
          <div className="flex justify-center items-center gap-2 mt-8">
            {Array.from({ length: Math.ceil(products.length / itemsPerPage) }).map((_, index) => {
              const pageIndex = index * itemsPerPage;
              return (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(pageIndex)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    currentIndex === pageIndex
                      ? 'bg-teal-500 scale-125 w-8'
                      : 'bg-teal-200 hover:bg-teal-300'
                  }`}
                />
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
