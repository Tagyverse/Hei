import { ShoppingCart, Heart } from 'lucide-react';
import { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { ref, get } from 'firebase/database';
import { useCart } from '../contexts/CartContext';
import { useFavorites } from '../contexts/FavoritesContext';
import LazyImage from './LazyImage';
import type { Category, Product } from '../types';
import { useCardDesign, getCardStyles } from '../hooks/useCardDesign';

interface FeaturedCategoriesProps {
  onNavigate: (page: 'shop', categoryId?: string) => void;
  onAddToCart: (product: Product) => void;
  onCartClick: () => void;
  onProductClick: (product: Product) => void;
}

interface CategoryWithProducts {
  category: Category;
  products: Product[];
}

export default function FeaturedCategories({ onNavigate, onAddToCart, onCartClick, onProductClick }: FeaturedCategoriesProps) {
  const [categoriesWithProducts, setCategoriesWithProducts] = useState<CategoryWithProducts[]>([]);
  const [loading, setLoading] = useState(true);
  const { isInCart } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { design } = useCardDesign('shop_by_category');
  const cardStyles = getCardStyles(design);

  useEffect(() => {
    async function fetchFeaturedCategoriesWithProducts() {
      try {
        const categoriesRef = ref(db, 'categories');
        const productsRef = ref(db, 'products');

        const [categoriesSnapshot, productsSnapshot] = await Promise.all([
          get(categoriesRef),
          get(productsRef)
        ]);

        if (categoriesSnapshot.exists() && productsSnapshot.exists()) {
          const categoriesData = categoriesSnapshot.val();
          const productsData = productsSnapshot.val();

          const categoriesArray: Category[] = Object.entries(categoriesData).map(([id, cat]: [string, any]) => ({
            id,
            ...cat,
          }));

          const productsArray: Product[] = Object.entries(productsData).map(([id, prod]: [string, any]) => ({
            id,
            ...prod,
          }));

          const featuredCategories = categoriesArray.filter(cat => cat.featured === true);

          const categoriesWithProds: CategoryWithProducts[] = featuredCategories.map(category => ({
            category,
            products: productsArray.filter(product => {
              const belongsToCategory = product.category_ids && product.category_ids.length > 0
                ? product.category_ids.includes(category.id)
                : product.category_id === category.id;
              return belongsToCategory && product.in_stock;
            })
          }));

          setCategoriesWithProducts(categoriesWithProds.filter(item => item.products.length > 0));
        }
      } catch (error) {
        console.error('Error fetching featured categories:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchFeaturedCategoriesWithProducts();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8 bg-white">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="animate-pulse relative bg-gray-300 py-6">
            <div className="absolute inset-0 bg-black/40"></div>
            <div
              className="overflow-x-auto overflow-y-visible scrollbar-hide scroll-smooth pl-8 sm:pl-10 lg:pl-12 relative z-10"
              style={{
                scrollBehavior: 'smooth',
                WebkitOverflowScrolling: 'touch'
              }}
            >
              <div className="flex gap-4 pr-12 sm:pr-16 lg:pr-20">
                {/* Category Info Skeleton */}
                <div className="flex-shrink-0 w-48 flex flex-col items-center" style={{ minHeight: '280px' }}>
                  <div className="flex flex-col items-center justify-center h-full py-6">
                    <div className="w-20 h-20 bg-gray-400 mb-3" style={{ borderRadius: '10px' }}></div>
                    <div className="h-6 bg-gray-400 rounded w-32 mb-2"></div>
                    <div className="h-4 bg-gray-400 rounded w-40 mb-4"></div>
                    <div className="h-10 bg-gray-400 rounded-full w-24"></div>
                  </div>
                </div>
                {/* Products skeleton */}
                {[...Array(5)].map((_, j) => (
                  <div key={j} className="flex-shrink-0 w-40 h-64 bg-white/90 rounded-2xl border-2 border-gray-200"></div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (categoriesWithProducts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-8 bg-white">
      {categoriesWithProducts.map(({ category, products }) => (
        <div
          key={category.id}
          className="animate-fade-in relative py-6"
          style={{
            backgroundImage: category.image_url ? `url("${category.image_url}")` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundColor: category.image_url ? 'transparent' : '#f3f4f6'
          }}
        >
          {/* Semi-transparent overlay */}
          <div className="absolute inset-0 bg-black/40"></div>

          <div
            className="overflow-x-auto overflow-y-visible scrollbar-hide scroll-smooth pl-8 sm:pl-10 lg:pl-12 relative z-10"
            style={{
              scrollBehavior: 'smooth',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            <div className="flex gap-4 pr-12 sm:pr-16 lg:pr-20 pb-2">
              {/* Category Info */}
              <div className="flex-shrink-0 w-48 flex flex-col items-center text-center" style={{ minHeight: '280px' }}>
                <div className="flex flex-col items-center justify-center h-full py-6 px-4">
                  {category.image_url ? (
                    <img
                      src={category.image_url}
                      alt={category.name}
                      className="w-20 h-20 object-cover mb-3 border-2 border-white"
                      style={{ borderRadius: '10px' }}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gray-200 border-2 border-white mb-3 flex items-center justify-center" style={{ borderRadius: '10px' }}>
                      <span className="text-2xl">📦</span>
                    </div>
                  )}
                  <h3 className="text-white font-bold text-lg mb-2">{category.name}</h3>
                  <p className="text-white/80 text-sm mb-4 px-2">{category.description}</p>
                  <button
                    onClick={() => onNavigate('shop', category.id)}
                    className="px-8 py-2 border border-white/50 rounded-full text-sm font-medium text-white hover:bg-white/10 transition-colors backdrop-blur-sm"
                  >
                    More
                  </button>
                </div>
              </div>

              {/* Products */}
              {products.map((product, index) => (
                  <div
                    key={product.id}
                    onClick={() => onProductClick(product)}
                    className={`flex-shrink-0 w-40 bg-white overflow-hidden transition-all duration-300 group snap-start cursor-pointer ${cardStyles.container || 'rounded-2xl border-2 border-gray-200 hover:border-teal-400'}`}
                    style={{
                      animationDelay: `${index * 50}ms`,
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
                      className="relative h-40 overflow-hidden bg-gray-100"
                      style={cardStyles.imageStyle}
                    >
                      <LazyImage
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading={index > 3 ? "lazy" : "eager"}
                      />

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(product.id);
                        }}
                        className={`absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all ${
                          isFavorite(product.id)
                            ? 'bg-red-50 border-red-300'
                            : 'bg-white border-white/80 opacity-0 group-hover:opacity-100'
                        }`}
                      >
                        <Heart className={`w-3.5 h-3.5 transition-all ${
                          isFavorite(product.id)
                            ? 'text-red-500 fill-red-500'
                            : 'text-teal-600'
                        }`} />
                      </button>

                      {product.compare_at_price && (
                        <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-0.5 rounded text-xs font-bold">
                          SALE
                        </div>
                      )}
                    </div>

                    <div className="p-3">
                      <h3 className="text-sm font-medium text-gray-900 mb-1 line-clamp-2 leading-tight">{product.name}</h3>

                      <div className="flex items-baseline gap-1 mb-2">
                        <span className="text-base font-semibold text-gray-900">₹{product.price}</span>
                        {product.compare_at_price && product.compare_at_price > 0 && (
                          <span className="text-xs text-gray-400 line-through">
                            ₹{product.compare_at_price}
                          </span>
                        )}
                      </div>

                      {isInCart(product.id) ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onCartClick();
                          }}
                          className={`w-full bg-emerald-500 text-white py-2 text-xs font-semibold hover:bg-emerald-600 transition-all border-2 border-emerald-600 ${cardStyles.button}`}
                        >
                          In Cart
                        </button>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onAddToCart(product);
                          }}
                          className={`w-full bg-teal-600 text-white py-2 text-xs font-semibold hover:bg-teal-700 transition-all border-2 border-teal-700 ${cardStyles.button}`}
                        >
                          Add to Cart
                        </button>
                      )}
                    </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
