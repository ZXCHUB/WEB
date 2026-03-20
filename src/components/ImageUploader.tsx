import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Upload, X, RotateCcw } from 'lucide-react';

interface ImageUploaderProps {
  value: string;
  onChange: (base64: string) => void;
  label: string;
  maxWidth: number;
  maxHeight: number;
  aspectHint?: string;
}

export default function ImageUploader({
  value, onChange, label, maxWidth, maxHeight, aspectHint
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [imgEl, setImgEl] = useState<HTMLImageElement | null>(null);
  const [scale, setScale] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [quality, setQuality] = useState(0.85);

  const render = useCallback((img: HTMLImageElement, s: number, ox: number, oy: number, q: number) => {
    const canvas = document.createElement('canvas');
    canvas.width = maxWidth;
    canvas.height = maxHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const scaledW = img.naturalWidth * s;
    const scaledH = img.naturalHeight * s;
    const dx = (maxWidth - scaledW) / 2 + ox;
    const dy = (maxHeight - scaledH) / 2 + oy;
    ctx.drawImage(img, dx, dy, scaledW, scaledH);
    onChange(canvas.toDataURL('image/jpeg', q));
  }, [maxWidth, maxHeight, onChange]);

  useEffect(() => {
    if (imgEl) render(imgEl, scale, offsetX, offsetY, quality);
  }, [scale, offsetX, offsetY, quality, imgEl, render]);

  const handleFile = (f: File) => {
    if (f.size > 10 * 1024 * 1024) { alert('Max file size is 10MB'); return; }
    setFile(f);
    setScale(1); setOffsetX(0); setOffsetY(0); setQuality(0.85);
    const url = URL.createObjectURL(f);
    const img = new Image();
    img.onload = () => { setImgEl(img); render(img, 1, 0, 0, 0.85); URL.revokeObjectURL(url); };
    img.src = url;
  };

  const handleClear = () => {
    setFile(null); setImgEl(null); onChange('');
    setScale(1); setOffsetX(0); setOffsetY(0);
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-zinc-400 flex items-center gap-2">
        <Upload className="w-4 h-4" />
        {label}
        {aspectHint && <span className="text-zinc-600 text-xs">({aspectHint})</span>}
      </label>

      <div className="flex items-center gap-3">
        <button type="button" onClick={() => inputRef.current?.click()}
          className="flex items-center gap-2 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors border border-zinc-700 text-sm"
        >
          <Upload className="w-4 h-4" />
          {file ? 'Change Image' : 'Upload from PC'}
        </button>
        {(file || value) && (
          <button type="button" onClick={handleClear} className="p-2 text-zinc-500 hover:text-red-400 transition-colors">
            <X className="w-4 h-4" />
          </button>
        )}
        <input ref={inputRef} type="file" accept="image/*" className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ''; }}
        />
      </div>

      {file && imgEl && (
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 space-y-4">
          <div className="overflow-hidden rounded-lg border border-zinc-700 bg-zinc-950 w-full"
            style={{ aspectRatio: `${maxWidth} / ${maxHeight}`, maxHeight: 200 }}
          >
            {value && <img src={value} alt="Preview" className="w-full h-full object-cover" />}
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-xs text-zinc-400">Scale</span>
                <span className="text-xs text-zinc-500">{scale.toFixed(2)}x</span>
              </div>
              <input type="range" min="0.05" max="4" step="0.01" value={scale}
                onChange={e => setScale(parseFloat(e.target.value))} className="w-full accent-red-500" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-zinc-400">Offset X</span>
                  <span className="text-xs text-zinc-500">{offsetX}px</span>
                </div>
                <input type="range" min={-maxWidth} max={maxWidth} step="2" value={offsetX}
                  onChange={e => setOffsetX(parseInt(e.target.value))} className="w-full accent-red-500" />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-zinc-400">Offset Y</span>
                  <span className="text-xs text-zinc-500">{offsetY}px</span>
                </div>
                <input type="range" min={-maxHeight} max={maxHeight} step="2" value={offsetY}
                  onChange={e => setOffsetY(parseInt(e.target.value))} className="w-full accent-red-500" />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-xs text-zinc-400">Quality</span>
                <span className="text-xs text-zinc-500">{Math.round(quality * 100)}%</span>
              </div>
              <input type="range" min="0.3" max="1" step="0.05" value={quality}
                onChange={e => setQuality(parseFloat(e.target.value))} className="w-full accent-red-500" />
            </div>
          </div>

          <button type="button"
            onClick={() => { setScale(1); setOffsetX(0); setOffsetY(0); setQuality(0.85); }}
            className="flex items-center gap-2 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded-lg text-sm transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
        </div>
      )}

      {!file && value && value.startsWith('http') && (
        <div className="h-16 w-16 rounded-lg overflow-hidden border border-zinc-800">
          <img src={value} alt="Current" className="w-full h-full object-cover" />
        </div>
      )}
    </div>
  );
}
