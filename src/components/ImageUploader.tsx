import React, { useRef, useState } from 'react';
import { Upload, X, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface ImageUploaderProps {
  value: string;
  onChange: (base64: string) => void;
  label: string;
  maxWidth: number;
  maxHeight: number;
  aspectHint?: string; // e.g. "16:9" or "1:1"
  previewClass?: string;
}

const compressImage = (
  file: File,
  maxWidth: number,
  maxHeight: number,
  quality: number,
  offsetX: number,
  offsetY: number,
  scale: number
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = maxWidth;
        canvas.height = maxHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) { reject(new Error('No canvas context')); return; }

        // Calculate scaled dimensions
        const scaledW = img.width * scale;
        const scaledH = img.height * scale;

        // Center + offset
        const dx = (maxWidth - scaledW) / 2 + offsetX;
        const dy = (maxHeight - scaledH) / 2 + offsetY;

        ctx.drawImage(img, dx, dy, scaledW, scaledH);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
};

export default function ImageUploader({
  value, onChange, label, maxWidth, maxHeight, aspectHint, previewClass
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [scale, setScale] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [quality, setQuality] = useState(0.85);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFile = async (f: File) => {
    if (f.size > 10 * 1024 * 1024) { alert('Max file size is 10MB'); return; }
    setFile(f);
    setScale(1); setOffsetX(0); setOffsetY(0);
    // Auto-apply with defaults
    const base64 = await compressImage(f, maxWidth, maxHeight, quality, 0, 0, 1);
    onChange(base64);
  };

  const handleApply = async () => {
    if (!file) return;
    setIsProcessing(true);
    const base64 = await compressImage(file, maxWidth, maxHeight, quality, offsetX, offsetY, scale);
    onChange(base64);
    setIsProcessing(false);
  };

  const handleClear = () => {
    setFile(null);
    onChange('');
    setScale(1); setOffsetX(0); setOffsetY(0);
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-zinc-400 flex items-center gap-2">
        <Upload className="w-4 h-4" /> {label}
        {aspectHint && <span className="text-zinc-600 text-xs">({aspectHint})</span>}
      </label>

      {/* Upload button */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex items-center gap-2 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors border border-zinc-700 text-sm"
        >
          <Upload className="w-4 h-4" />
          {file ? 'Change Image' : 'Upload from PC'}
        </button>
        {value && (
          <button type="button" onClick={handleClear} className="p-2 text-zinc-500 hover:text-red-400 transition-colors">
            <X className="w-4 h-4" />
          </button>
        )}
        <input ref={inputRef} type="file" accept="image/*" className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ''; }}
        />
      </div>

      {/* Preview + controls — only show when file selected */}
      {file && (
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 space-y-4">
          {/* Preview */}
          <div className="relative overflow-hidden rounded-lg border border-zinc-700 bg-zinc-950"
            style={{ width: '100%', aspectRatio: `${maxWidth}/${maxHeight}`, maxHeight: 220 }}
          >
            {value && <img src={value} alt="Preview" className="w-full h-full object-cover" />}
          </div>

          {/* Controls */}
          <div className="grid grid-cols-1 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs text-zinc-400 flex items-center gap-1"><ZoomIn className="w-3 h-3" /> Scale</label>
                <span className="text-xs text-zinc-500">{scale.toFixed(2)}x</span>
              </div>
              <input type="range" min="0.1" max="3" step="0.01" value={scale}
                onChange={e => setScale(parseFloat(e.target.value))}
                className="w-full accent-red-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-zinc-400">Offset X</label>
                  <span className="text-xs text-zinc-500">{offsetX}px</span>
                </div>
                <input type="range" min={-maxWidth} max={maxWidth} step="1" value={offsetX}
                  onChange={e => setOffsetX(parseInt(e.target.value))}
                  className="w-full accent-red-500"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-zinc-400">Offset Y</label>
                  <span className="text-xs text-zinc-500">{offsetY}px</span>
                </div>
                <input type="range" min={-maxHeight} max={maxHeight} step="1" value={offsetY}
                  onChange={e => setOffsetY(parseInt(e.target.value))}
                  className="w-full accent-red-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs text-zinc-400">Quality</label>
                <span className="text-xs text-zinc-500">{Math.round(quality * 100)}%</span>
              </div>
              <input type="range" min="0.3" max="1" step="0.05" value={quality}
                onChange={e => setQuality(parseFloat(e.target.value))}
                className="w-full accent-red-500"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={handleApply} disabled={isProcessing}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
            >
              {isProcessing ? 'Processing...' : 'Apply'}
            </button>
            <button type="button"
              onClick={() => { setScale(1); setOffsetX(0); setOffsetY(0); setQuality(0.85); handleApply(); }}
              className="flex items-center gap-2 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded-lg text-sm transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
          </div>
        </div>
      )}

      {/* If value is a URL (not base64), show small preview */}
      {!file && value && value.startsWith('http') && (
        <div className="h-16 w-16 rounded-lg overflow-hidden border border-zinc-800">
          <img src={value} alt="Current" className="w-full h-full object-cover" />
        </div>
      )}
    </div>
  );
}
