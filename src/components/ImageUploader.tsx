import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Image as ImageIcon, 
  Link as LinkIcon, 
  Trash2, 
  CheckCircle2, 
  RefreshCw, 
  Sparkles, 
  X,
  Camera,
  Layers
} from 'lucide-react';

export interface ImageUploaderProps {
  value: string;
  onChange: (urlOrDataUrl: string) => void;
  label?: string;
  required?: boolean;
  className?: string;
  helperText?: string;
  maxDimension?: number; // default 1600
  quality?: number; // default 0.82
  showPresets?: boolean;
}

// Curated luxury safari photography collection
const SAFARI_PRESET_IMAGES = [
  {
    title: 'Serengeti Migration',
    category: 'Wildlife',
    url: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80'
  },
  {
    title: 'Maasai Mara Lion Pride',
    category: 'Big Cats',
    url: 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=1200&q=80'
  },
  {
    title: 'Amboseli Elephants & Kili',
    category: 'Landscape',
    url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1200&q=80'
  },
  {
    title: 'Luxury Tented Suite',
    category: 'Lodges',
    url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80'
  },
  {
    title: 'Zanzibar Turquoise Coast',
    category: 'Beach',
    url: 'https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?auto=format&fit=crop&w=1200&q=80'
  },
  {
    title: 'Mountain Gorilla Forest',
    category: 'Primates',
    url: 'https://images.unsplash.com/photo-1544979590-37e9b47eb705?auto=format&fit=crop&w=1200&q=80'
  },
  {
    title: 'Savannah Sunset Sundowner',
    category: 'Safari Life',
    url: 'https://images.unsplash.com/photo-1534567153574-2b12153a87f0?auto=format&fit=crop&w=1200&q=80'
  },
  {
    title: 'Cheetah on Termite Mound',
    category: 'Predators',
    url: 'https://images.unsplash.com/photo-1547721064-da6cfb341d50?auto=format&fit=crop&w=1200&q=80'
  }
];

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  value,
  onChange,
  label = 'Feature Image / Media Asset',
  required = false,
  className = '',
  helperText,
  maxDimension = 1600,
  quality = 0.82,
  showPresets = true
}) => {
  const [mode, setMode] = useState<'upload' | 'url' | 'presets'>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [inputUrl, setInputUrl] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [fileDetails, setFileDetails] = useState<{ name: string; size: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Compress & optimize image via HTML5 Canvas before persisting
  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (.jpg, .png, .webp).');
      return;
    }

    // Limit raw upload to 25MB
    if (file.size > 25 * 1024 * 1024) {
      setErrorMsg('File exceeds 25MB limit. Please choose a smaller image.');
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);

    const reader = new FileReader();
    reader.onerror = () => {
      setIsProcessing(false);
      setErrorMsg('Failed to read image file.');
    };

    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => {
        setIsProcessing(false);
        setErrorMsg('Failed to load image contents.');
      };

      img.onload = () => {
        try {
          let { width, height } = img;

          // Scale down proportionally if larger than maxDimension
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            // Fallback to raw data url if canvas context unavailable
            onChange(e.target?.result as string);
            setIsProcessing(false);
            return;
          }

          // Render with image smoothing
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);

          // Export as compressed WebP or JPEG
          const outputFormat = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
          const dataUrl = canvas.toDataURL(outputFormat, quality);

          // Calculate approximate size in KB
          const approxKb = Math.round((dataUrl.length * 3) / 4 / 1024);
          setFileDetails({
            name: file.name,
            size: `${width}×${height}px · ${approxKb} KB`
          });

          onChange(dataUrl);
          setIsProcessing(false);
        } catch (err) {
          console.error("Canvas optimization error:", err);
          // Fallback to original read
          onChange(e.target?.result as string);
          setIsProcessing(false);
        }
      };

      img.src = e.target?.result as string;
    };

    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleUrlApply = () => {
    if (!inputUrl.trim()) return;
    onChange(inputUrl.trim());
    setInputUrl('');
    setFileDetails(null);
  };

  const handleRemove = () => {
    onChange('');
    setFileDetails(null);
    setErrorMsg(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`space-y-2.5 ${className}`}>
      {/* Header with Mode Tabs */}
      <div className="flex items-center justify-between">
        <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500">
          <span className="flex items-center gap-1.5">
            <Camera className="w-3.5 h-3.5 text-[#C5A880]" />
            {label} {required && <span className="text-amber-500">*</span>}
          </span>
        </label>

        {/* Mode Selector */}
        <div className="flex items-center gap-1 bg-stone-100 p-0.5 rounded-none border border-stone-200">
          <button
            type="button"
            onClick={() => setMode('upload')}
            className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1 ${
              mode === 'upload'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <Upload className="w-2.5 h-2.5" /> Upload File
          </button>
          <button
            type="button"
            onClick={() => setMode('url')}
            className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1 ${
              mode === 'url'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <LinkIcon className="w-2.5 h-2.5" /> Image URL
          </button>
          {showPresets && (
            <button
              type="button"
              onClick={() => setMode('presets')}
              className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1 ${
                mode === 'presets'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              <Sparkles className="w-2.5 h-2.5 text-[#C5A880]" /> Safari Presets
            </button>
          )}
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Upload Zone / URL Input / Presets */}
      {mode === 'upload' && !value && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed p-6 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-[#C5A880] bg-[#FAF7F2]'
              : 'border-stone-300 hover:border-[#C5A880] bg-[#FAF7F2]/60 hover:bg-[#FAF7F2]'
          }`}
        >
          {isProcessing ? (
            <div className="flex flex-col items-center justify-center space-y-2 py-2">
              <RefreshCw className="w-6 h-6 text-[#C5A880] animate-spin" />
              <p className="text-xs font-bold text-stone-800">Optimizing & Encoding Image...</p>
              <p className="text-[10px] text-stone-500">Auto-compressing for ultra-fast loading</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-[#FAF7F2] border border-[#C5A880]/40 flex items-center justify-center text-[#C5A880]">
                <Upload className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-stone-800">
                  Click to select photo or drag and drop here
                </p>
                <p className="text-[10px] text-stone-500">
                  PNG, JPG, WebP up to 25MB (Auto-compressed to web format)
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {mode === 'url' && !value && (
        <div className="space-y-2 bg-[#FAF7F2] p-3 border border-stone-200">
          <p className="text-[10px] font-bold uppercase text-stone-500">Paste Direct Image URL</p>
          <div className="flex gap-2">
            <input
              type="url"
              placeholder="https://images.unsplash.com/photo-..."
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              className="flex-1 bg-white border border-stone-300 px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-[#C5A880]"
            />
            <button
              type="button"
              onClick={handleUrlApply}
              disabled={!inputUrl.trim()}
              className="px-4 py-2 bg-[#1C2421] text-white hover:bg-[#C5A880] hover:text-[#1C2421] text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer"
            >
              Apply
            </button>
          </div>
        </div>
      )}

      {mode === 'presets' && !value && (
        <div className="bg-[#FAF7F2] p-3 border border-stone-200 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase text-stone-600 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#C5A880]" /> Premium Safari Stock Library
            </p>
            <span className="text-[9px] text-stone-400">One-click select</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {SAFARI_PRESET_IMAGES.map((preset) => (
              <button
                key={preset.title}
                type="button"
                onClick={() => onChange(preset.url)}
                className="group relative text-left border border-stone-200 overflow-hidden hover:border-[#C5A880] transition-all cursor-pointer shadow-2xs"
              >
                <div className="h-20 w-full overflow-hidden bg-stone-200">
                  <img
                    src={preset.url}
                    alt={preset.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
                <div className="p-1.5 bg-white">
                  <p className="text-[10px] font-semibold text-stone-800 truncate">{preset.title}</p>
                  <p className="text-[8px] uppercase tracking-wider text-stone-400">{preset.category}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Active Image Preview Card */}
      {value && (
        <div className="relative border border-stone-200 bg-white p-3 space-y-2.5 shadow-2xs">
          <div className="relative h-44 sm:h-52 w-full overflow-hidden bg-stone-100 group border border-stone-100">
            <img
              src={value}
              alt="Media Preview"
              className="w-full h-full object-cover"
              onError={(e) => {
                // Handle broken link
                (e.target as HTMLElement).setAttribute('src', 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80');
              }}
            />
            <div className="absolute top-2 right-2 flex items-center gap-1.5">
              <span className="bg-black/70 backdrop-blur-xs text-white text-[9px] px-2 py-0.5 uppercase tracking-wider font-bold flex items-center gap-1">
                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" /> Active Asset
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 text-xs">
            <div className="space-y-0.5 truncate pr-2">
              <p className="text-[11px] font-semibold text-stone-800 truncate">
                {fileDetails?.name || (value.startsWith('data:') ? 'Custom Uploaded File' : value)}
              </p>
              {fileDetails && (
                <p className="text-[10px] text-stone-500 font-mono">
                  {fileDetails.size}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border border-stone-300 text-stone-700 hover:border-[#C5A880] hover:text-[#1C2421] transition-colors cursor-pointer flex items-center gap-1"
                title="Change Image"
              >
                <RefreshCw className="w-3 h-3 text-[#C5A880]" /> Change
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer flex items-center gap-1"
                title="Remove Image"
              >
                <Trash2 className="w-3 h-3 text-rose-500" /> Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {errorMsg && (
        <div className="text-[11px] text-rose-600 flex items-center gap-1">
          <X className="w-3 h-3" /> {errorMsg}
        </div>
      )}

      {/* Helper text */}
      {helperText && (
        <p className="text-[10px] text-stone-500">{helperText}</p>
      )}
    </div>
  );
};
