import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import { X, Upload, Sparkles, CheckCircle, AlertCircle, Camera, Image as ImageIcon, ArrowLeft, RefreshCcw, ShieldCheck, Palette } from 'lucide-react';
import { usePublishedData } from '../contexts/PublishedDataContext';
import { objectToArray } from '../utils/publishedData';
import type { Product } from '../types';
import LazyImage from './LazyImage';
import { requestCameraPermission } from '../utils/permissionManager';

interface DressColorMatcherProps {
  isOpen: boolean;
  onClose: () => void;
  currentProduct?: Product;
}

interface ColorInfo {
  hex: string;
  name: string;
  percentage: number;
}

interface MatchedProduct {
  product: Product;
  matchPercentage: number;
  matchingColors: string[];
}

const colorMap: { [key: string]: string } = {
  red: '#EF4444',
  blue: '#3B82F6',
  green: '#10B981',
  yellow: '#F59E0B',
  black: '#000000',
  white: '#FFFFFF',
  gray: '#6B7280',
  grey: '#6B7280',
  pink: '#EC4899',
  purple: '#A855F7',
  orange: '#F97316',
  brown: '#92400E',
  navy: '#1E3A8A',
  beige: '#D4C5B9',
  cream: '#FFFDD0',
  maroon: '#800000',
  gold: '#FFD700',
  silver: '#C0C0C0',
  teal: '#14B8A6',
  cyan: '#06B6D4',
  lime: '#84CC16',
  indigo: '#6366F1',
};

const getColorName = (hex: string): string => {
  const distances = Object.entries(colorMap).map(([name, colorHex]) => {
    const r1 = parseInt(hex.substring(1, 3), 16);
    const g1 = parseInt(hex.substring(3, 5), 16);
    const b1 = parseInt(hex.substring(5, 7), 16);

    const r2 = parseInt(colorHex.substring(1, 3), 16);
    const g2 = parseInt(colorHex.substring(3, 5), 16);
    const b2 = parseInt(colorHex.substring(5, 7), 16);

    const distance = Math.sqrt(
      Math.pow(r1 - r2, 2) + Math.pow(g1 - g2, 2) + Math.pow(b1 - b2, 2)
    );

    return { name, distance };
  });

  distances.sort((a, b) => a.distance - b.distance);
  return distances[0].name;
};

export default function DressColorMatcher({ isOpen, onClose, currentProduct }: DressColorMatcherProps) {
  const { data: publishedData } = usePublishedData();
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [detectedColors, setDetectedColors] = useState<ColorInfo[]>([]);
  const [matchedProducts, setMatchedProducts] = useState<MatchedProduct[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'upload' | 'camera' | 'processing' | 'results'>('upload');
  const [cameraError, setCameraError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isOpen) {
      setUploadedImage(null);
      setDetectedColors([]);
      setMatchedProducts([]);
      setError(null);
      setCameraError(null);
      setStep('upload');
    } else {
      stopCamera();
    }
  }, [isOpen]);

  const startCamera = async () => {
    setCameraError(null);
    setIsProcessing(true);
    
    try {
      const result = await requestCameraPermission();
      
      if (result.granted) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } } 
          });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            setStep('camera');
          }
        } catch (err: any) {
          console.error('Error accessing camera:', err);
          let errorMsg = 'Could not access camera. ';
          
          if (err.name === 'NotReadableError') {
            errorMsg += 'Camera may be in use by another app. Please close it and try again.';
          } else if (err.name === 'OverconstrainedError') {
            errorMsg += 'Camera does not support required settings. Try a different camera.';
          } else {
            errorMsg += 'Please check your camera and permissions.';
          }
          
          setCameraError(errorMsg);
        }
      } else {
        setCameraError(result.error || 'Camera permission denied.');
      }
    } catch (err) {
      console.error('Error in startCamera:', err);
      setCameraError('An unexpected error occurred. Please try again.');
    }
    
    setIsProcessing(false);
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/png');
        setUploadedImage(dataUrl);
        stopCamera();
        processImage(dataUrl);
      }
    }
  };

  const processImage = (imageUrl: string) => {
    setIsProcessing(true);
    setError(null);
    setStep('processing');

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = async () => {
      const colors = extractColorsFromImage(img);
      setDetectedColors(colors);
      await matchProductsByColors(colors);
      setIsProcessing(false);
      setStep('results');
    };
    img.onerror = () => {
      setError('Failed to process image. Please try another one.');
      setIsProcessing(false);
      setStep('upload');
    };
    img.src = imageUrl;
  };

  const extractColorsFromImage = useCallback((imageElement: HTMLImageElement): ColorInfo[] => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return [];

    canvas.width = imageElement.width;
    canvas.height = imageElement.height;
    ctx.drawImage(imageElement, 0, 0);

    // Focus on center area but with larger focus zone
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const focusWidth = Math.floor(canvas.width * 0.8);  // Increased from 0.7 to 0.8
    const focusHeight = Math.floor(canvas.height * 0.8); // Increased from 0.7 to 0.8
    const startX = Math.floor(centerX - focusWidth / 2);
    const startY = Math.floor(centerY - focusHeight / 2);

    const imageData = ctx.getImageData(startX, startY, focusWidth, focusHeight);
    const pixels = imageData.data;
    const colorCounts: { [key: string]: number } = {};
    const pixelColors: Array<{ r: number; g: number; b: number; hex: string }> = [];
    let validPixelCount = 0;

    const edgeThreshold = 30; // Increased from 20 to exclude more background

    // First pass: collect valid pixels
    for (let i = 0; i < pixels.length; i += 4) {
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      const a = pixels[i + 3];

      if (a < 200) continue;

      const pixelIndex = i / 4;
      const x = pixelIndex % focusWidth;
      const y = Math.floor(pixelIndex / focusWidth);

      // Exclude edges to avoid background
      if (x < edgeThreshold || x > focusWidth - edgeThreshold ||
          y < edgeThreshold || y > focusHeight - edgeThreshold) {
        continue;
      }

      const brightness = (r + g + b) / 3;
      
      // Filter out very bright (near white) and very dark (near black) pixels
      if (brightness > 240 || brightness < 15) continue;

      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const saturation = max === 0 ? 0 : (max - min) / max;

      // Increased saturation threshold from 0.15 to 0.25 to focus on saturated colors (dress colors)
      if (saturation < 0.25) continue;

      const roundedR = Math.round(r / 10) * 10;
      const roundedG = Math.round(g / 10) * 10;
      const roundedB = Math.round(b / 10) * 10;
      const hex = `#${((1 << 24) + (roundedR << 16) + (roundedG << 8) + roundedB).toString(16).slice(1).toUpperCase()}`;

      colorCounts[hex] = (colorCounts[hex] || 0) + 1;
      pixelColors.push({ r: roundedR, g: roundedG, b: roundedB, hex });
      validPixelCount++;
    }

    // Filter out uniform background colors by analyzing color distribution
    const filteredColorCounts: { [key: string]: number } = {};
    
    for (const [hex, count] of Object.entries(colorCounts)) {
      const percentage = (count / validPixelCount) * 100;
      
      // Very dominant single colors are likely background
      if (percentage > 40) continue;
      
      // Keep colors that appear meaningfully (at least 1% of pixels)
      if (percentage >= 1) {
        filteredColorCounts[hex] = count;
      }
    }

    // If filtering removed all colors, fall back to original with higher threshold
    const finalColorCounts = Object.keys(filteredColorCounts).length > 0 
      ? filteredColorCounts 
      : colorCounts;

    const sortedColors = Object.entries(finalColorCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([hex, count]) => ({
        hex,
        name: getColorName(hex),
        percentage: Math.round((count / validPixelCount) * 100 * 100) / 100
      }))
      .filter(color => color.percentage > 1.5); // Reduced threshold from 2 to 1.5 after filtering

    return sortedColors;
  }, []);

  const matchProductsByColors = useCallback(async (colors: ColorInfo[]) => {
    if (!publishedData?.products) return;

    try {
      const allProducts = objectToArray<Product>(publishedData.products)
        .filter((p: Product) => {
          if (!p.in_stock || p.isVisible === false || !p.availableColors || p.availableColors.length === 0) {
            return false;
          }

          if (currentProduct && p.id === currentProduct.id) {
            return false;
          }

          return true;
        });

      const detectedColorNames = colors.map(c => c.name.toLowerCase());

      const matches: MatchedProduct[] = [];

      for (const product of allProducts) {
        const productColors = (product.availableColors || []).map(c => c.toLowerCase());
        const matchingColors = productColors.filter(pc =>
          detectedColorNames.includes(pc)
        );

        if (matchingColors.length > 0) {
          const matchPercentage = Math.round((matchingColors.length / productColors.length) * 100);
          matches.push({
            product,
            matchPercentage,
            matchingColors
          });
        }
      }

      matches.sort((a, b) => b.matchPercentage - a.matchPercentage);
      setMatchedProducts(matches.slice(0, 10));
    } catch (err) {
      console.error('Error matching products:', err);
      setError('Failed to find matching products');
    }
  }, [publishedData, currentProduct]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string;
        setUploadedImage(dataUrl);
        processImage(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  }, [processImage]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-end md:items-center justify-center p-0 sm:p-4">
      <div className="bg-white rounded-t-3xl md:rounded-3xl shadow-2xl max-w-4xl w-full h-[95vh] md:h-auto md:max-h-[90vh] overflow-hidden border-4 border-black flex flex-col">
        {/* Header */}
        <div className="bg-[#FFD1DC] p-4 md:p-6 flex items-center justify-between border-b-4 border-black shrink-0">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-10 h-10 md:w-14 md:h-14 bg-white rounded-xl flex items-center justify-center border-2 border-black">
              <Palette className="w-6 h-6 md:w-8 md:h-8 text-pink-500" />
            </div>
            <div>
              <h2 className="text-lg md:text-2xl font-black text-black">Dress Color Matcher</h2>
              <p className="text-black/70 text-[10px] md:text-sm font-bold">Find matching accessories for your outfit</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="bg-white text-black w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 transition-all border-2 border-black hover:scale-110"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-4 md:p-8 bg-white">
          {step === 'upload' && (
            <div className="max-w-md mx-auto space-y-8 py-6 md:py-12">
              <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-pink-50 rounded-full flex items-center justify-center mx-auto border-4 border-pink-100 relative">
                  <Sparkles className="absolute -top-1 -right-1 text-yellow-500 w-6 h-6" />
                  <Palette className="w-10 h-10 text-pink-500" />
                </div>
                <h3 className="text-2xl font-black text-gray-900">How to start?</h3>
                <p className="text-gray-500 font-medium">Take a photo of your dress or upload an existing image.</p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <button
                  onClick={startCamera}
                  className="group flex items-center gap-4 p-6 bg-white border-4 border-black rounded-2xl hover:bg-pink-50 transition-all shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1"
                >
                  <div className="w-14 h-14 bg-pink-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Camera className="w-8 h-8 text-pink-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-black text-lg">Use Camera</p>
                    <p className="text-sm text-gray-500 font-bold">Snap a quick photo</p>
                  </div>
                </button>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="group flex items-center gap-4 p-6 bg-white border-4 border-black rounded-2xl hover:bg-blue-50 transition-all shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1"
                >
                  <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Upload className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-black text-lg">Upload Photo</p>
                    <p className="text-sm text-gray-500 font-bold">Choose from gallery</p>
                  </div>
                </button>
              </div>
              
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />

              {cameraError && (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-red-500" />
                  <p className="text-red-600 text-sm font-bold">{cameraError}</p>
                </div>
              )}
            </div>
          )}

          {step === 'camera' && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="relative bg-black rounded-3xl overflow-hidden border-4 border-black aspect-square shadow-2xl">
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                <div className="absolute inset-0 border-[40px] border-black/30 pointer-events-none">
                  <div className="w-full h-full border-2 border-dashed border-white/50 rounded-lg flex items-center justify-center">
                    <div className="w-12 h-12 border-2 border-white rounded-full"></div>
                  </div>
                </div>
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4">
                  <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-full text-white text-[10px] font-bold border border-white/20">
                    Place dress color in the center
                  </div>
                  <button
                    onClick={capturePhoto}
                    className="w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 bg-white rounded-full border-8 border-gray-300 flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-2xl touch-none"
                  >
                    <div className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 bg-pink-500 rounded-full"></div>
                  </button>
                </div>
                <button
                  onClick={() => setStep('upload')}
                  className="absolute top-4 left-4 bg-black/50 text-white p-2 rounded-xl border border-white/20"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {step === 'processing' && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative">
                <div className="w-20 h-20 border-8 border-pink-100 border-t-pink-500 rounded-full animate-spin"></div>
                <Sparkles className="w-8 h-8 text-pink-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
              </div>
              <p className="text-xl font-black text-gray-900 mt-6">Analyzing your style...</p>
              <p className="text-gray-500 font-bold mt-2">Finding the perfect matches</p>
            </div>
          )}

          {step === 'results' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="text-lg font-black text-black uppercase tracking-widest">Your Dress</h3>
                  <div className="relative aspect-square rounded-2xl overflow-hidden border-4 border-black shadow-lg">
                    <img src={uploadedImage!} alt="Dress" className="w-full h-full object-cover" />
                    <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2">
                      {detectedColors.map((color, idx) => (
                        <div key={idx} className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full border-2 border-black flex items-center gap-2 shadow-md">
                          <div className="w-4 h-4 rounded-full border border-black/20" style={{ backgroundColor: color.hex }}></div>
                          <span className="text-[10px] font-black uppercase">{color.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => setStep('upload')}
                    className="w-full bg-white border-2 border-black py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-100"
                  >
                    <RefreshCcw className="w-4 h-4" /> Try Another
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-black text-black uppercase tracking-widest">Matches Found</h3>
                    <div className="bg-pink-100 text-pink-600 px-3 py-1 rounded-full text-xs font-black border-2 border-pink-200">
                      {matchedProducts.length} ITEMS
                    </div>
                  </div>

                  <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                    {matchedProducts.length === 0 ? (
                      <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center">
                        <AlertCircle className="w-10 h-10 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 font-bold">No perfect matches found.</p>
                      </div>
                    ) : (
                      matchedProducts.map(({ product, matchPercentage }) => (
                        <div key={product.id} className="group bg-white border-2 border-black rounded-2xl p-3 flex gap-4 hover:shadow-lg transition-all">
                          <div className="w-24 h-24 rounded-xl overflow-hidden border-2 border-gray-100 flex-shrink-0">
                            <LazyImage src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                          </div>
                          <div className="flex-1 flex flex-col justify-between py-1">
                            <div>
                              <div className="flex items-center justify-between">
                                <h4 className="font-black text-sm text-gray-900 line-clamp-1">{product.name}</h4>
                                <span className="text-[10px] font-black text-pink-500 bg-pink-50 px-2 py-0.5 rounded-full border border-pink-100">{matchPercentage}% MATCH</span>
                              </div>
                              <p className="text-pink-600 font-black text-sm mt-1">₹{product.price}</p>
                            </div>
                            <div className="flex gap-1 mt-2">
                              {product.availableColors?.slice(0, 5).map((c, i) => (
                                <div key={i} className="w-3 h-3 rounded-full border border-gray-100" style={{ backgroundColor: c }}></div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
