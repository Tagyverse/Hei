import { useState, useEffect, useRef } from 'react';
import { X, Upload, Download, RotateCcw, ZoomIn, ZoomOut, ArrowLeft } from 'lucide-react';
import { usePublishedData } from '../contexts/PublishedDataContext';
import { objectToArray } from '../utils/publishedData';
import { Product, TryOnModel } from '../types';

interface VirtualTryOnProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product | null;
  onBack?: () => void;
}

export default function VirtualTryOn({ isOpen, onClose, product, onBack }: VirtualTryOnProps) {
  const { data: publishedData } = usePublishedData();
  const [userImage, setUserImage] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<TryOnModel | null>(null);
  const [models, setModels] = useState<TryOnModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const productImageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (publishedData?.try_on_models) {
      const modelsArray = objectToArray<TryOnModel>(publishedData.try_on_models);
      setModels(modelsArray);
      if (modelsArray.length > 0 && !selectedModel) {
        setSelectedModel(modelsArray[0]);
      }
    }
  }, [publishedData]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDownload = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 800;
    canvas.height = 1000;

    const bgImage = new Image();
    bgImage.crossOrigin = 'anonymous';
    bgImage.src = selectedModel?.image_url || '';

    bgImage.onload = () => {
      ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);

      if (product && productImageRef.current) {
        const productImg = productImageRef.current;
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        ctx.save();
        ctx.translate(centerX + position.x, centerY + position.y);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.scale(scale, scale);
        ctx.drawImage(
          productImg,
          -productImg.width / 2,
          -productImg.height / 2
        );
        ctx.restore();
      }

      const link = document.createElement('a');
      link.download = 'virtual-try-on.png';
      link.href = canvas.toDataURL();
      link.click();
    };
  };

  const handleReset = () => {
    setScale(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                onClick={onBack}
                className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div>
              <h2 className="text-2xl font-bold text-white">Virtual Try-On</h2>
              <p className="text-purple-100 text-sm">See how {product?.name || 'it'} looks on you!</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Model Selection */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Choose Model</h3>
              <div className="grid grid-cols-2 gap-3">
                {models.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => setSelectedModel(model)}
                    className={`relative rounded-xl overflow-hidden border-2 transition-all ${
                      selectedModel?.id === model.id
                        ? 'border-purple-500 ring-2 ring-purple-200'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <img
                      src={model.image_url}
                      alt={model.name}
                      className="w-full h-32 object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                      <p className="text-white text-xs font-medium">{model.name}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Try-On Canvas */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Try It On</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setScale(Math.min(scale + 0.1, 3))}
                    className="bg-purple-100 hover:bg-purple-200 text-purple-700 p-2 rounded-lg transition-colors"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setScale(Math.max(scale - 0.1, 0.5))}
                    className="bg-purple-100 hover:bg-purple-200 text-purple-700 p-2 rounded-lg transition-colors"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleReset}
                    className="bg-purple-100 hover:bg-purple-200 text-purple-700 p-2 rounded-lg transition-colors"
                    title="Reset"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleDownload}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Download className="w-5 h-5" />
                    <span>Save</span>
                  </button>
                </div>
              </div>

              <div
                className="relative bg-gray-100 rounded-2xl overflow-hidden"
                style={{ height: '500px' }}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                {selectedModel && (
                  <img
                    src={selectedModel.image_url}
                    alt={selectedModel.name}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                )}

                {product && product.try_on_image_url && (
                  <img
                    ref={productImageRef}
                    src={product.try_on_image_url}
                    alt={product.name}
                    crossOrigin="anonymous"
                    className="absolute cursor-move"
                    style={{
                      transform: `translate(${position.x}px, ${position.y}px) rotate(${rotation}deg) scale(${scale})`,
                      left: '50%',
                      top: '50%',
                      marginLeft: '-50px',
                      marginTop: '-50px',
                      width: '100px',
                      height: 'auto',
                      pointerEvents: isDragging ? 'none' : 'auto',
                    }}
                    onMouseDown={handleMouseDown}
                    draggable={false}
                  />
                )}

                <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm rounded-xl p-3">
                  <p className="text-sm text-gray-600 text-center">
                    Drag the product to position it. Use controls to zoom and rotate.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
