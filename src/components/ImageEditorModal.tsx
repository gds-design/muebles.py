"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  X, ZoomIn, ZoomOut, RotateCw, RotateCcw, 
  Sparkles, Check, Sun, Contrast, Sliders, RefreshCw 
} from "lucide-react";

interface ImageEditorModalProps {
  isOpen: boolean;
  imageSrc: string; // Base64 or object URL
  onSave: (editedImageBase64: string) => void;
  onClose: () => void;
}

export default function ImageEditorModal({ isOpen, imageSrc, onSave, onClose }: ImageEditorModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  // Editing states
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);

  // Filters
  const [brightness, setBrightness] = useState(0); // -100 to 100
  const [contrast, setContrast] = useState(0); // -100 to 100
  const [sharpness, setSharpness] = useState(0); // 0 to 5 (nitidez)

  // Drag states
  const touchStartRef = useRef({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  const touchStartDistRef = useRef(0);
  const touchStartScaleRef = useRef(1);
  const isPinchingRef = useRef(false);

  // Reset editor state when image changes
  useEffect(() => {
    if (isOpen && imageSrc) {
      const img = new Image();
      img.src = imageSrc;
      img.onload = () => {
        imageRef.current = img;
        resetAdjustments(img);
      };
    }
  }, [isOpen, imageSrc]);

  // Redraw canvas whenever states change
  useEffect(() => {
    if (isOpen && imageRef.current) {
      renderCanvas();
    }
  }, [isOpen, scale, rotation, offsetX, offsetY, brightness, contrast, sharpness]);

  const resetAdjustments = (img = imageRef.current) => {
    if (!img) return;
    setRotation(0);
    setOffsetX(0);
    setOffsetY(0);
    setBrightness(0);
    setContrast(0);
    setSharpness(0);
    
    // Fit image to 400x400 display area initially
    const initScale = Math.min(400 / img.width, 400 / img.height, 1);
    setScale(initScale);
  };

  const renderCanvas = () => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw white background (default standard for e-commerce)
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    // Center translations + offsets
    ctx.translate(canvas.width / 2 + offsetX, canvas.height / 2 + offsetY);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(scale, scale);
    
    // Draw centered image
    ctx.drawImage(img, -img.width / 2, -img.height / 2);
    ctx.restore();

    // Apply brightness, contrast and sharpness filters
    if (brightness !== 0 || contrast !== 0 || sharpness !== 0) {
      let imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      imgData = applyBrightnessContrast(imgData, brightness, contrast);
      if (sharpness > 0) {
        imgData = applySharpnessFilter(ctx, imgData, sharpness);
      }
      ctx.putImageData(imgData, 0, 0);
    }
  };

  // Brightness and Contrast Pixel adjustments
  const applyBrightnessContrast = (imgData: ImageData, bright: number, cont: number) => {
    const d = imgData.data;
    const factor = (259 * (cont + 255)) / (255 * (259 - cont));
    
    for (let i = 0; i < d.length; i += 4) {
      let r = d[i] + bright;
      let g = d[i + 1] + bright;
      let b = d[i + 2] + bright;

      if (cont !== 0) {
        r = factor * (r - 128) + 128;
        g = factor * (g - 128) + 128;
        b = factor * (b - 128) + 128;
      }

      d[i] = Math.max(0, Math.min(255, r));
      d[i + 1] = Math.max(0, Math.min(255, g));
      d[i + 2] = Math.max(0, Math.min(255, b));
    }
    return imgData;
  };

  // Sharpness Convolution Filter
  const applySharpnessFilter = (ctx: CanvasRenderingContext2D, imgData: ImageData, amount: number) => {
    const src = imgData.data;
    const sw = imgData.width;
    const sh = imgData.height;
    
    const output = ctx.createImageData(sw, sh);
    const dst = output.data;

    // Sharpness weight matrix kernel
    const k = amount * 0.5;
    const weights = [
       0,  -k,   0,
      -k, 1 + 4*k, -k,
       0,  -k,   0
    ];
    
    const side = 3;
    const halfSide = 1;

    for (let y = 0; y < sh; y++) {
      for (let x = 0; x < sw; x++) {
        const dstOff = (y * sw + x) * 4;
        let r = 0, g = 0, b = 0;

        for (let cy = 0; cy < side; cy++) {
          for (let cx = 0; cx < side; cx++) {
            const scy = y + cy - halfSide;
            const scx = x + cx - halfSide;

            if (scy >= 0 && scy < sh && scx >= 0 && scx < sw) {
              const srcOff = (scy * sw + scx) * 4;
              const wt = weights[cy * side + cx];
              r += src[srcOff] * wt;
              g += src[srcOff + 1] * wt;
              b += src[srcOff + 2] * wt;
            }
          }
        }

        dst[dstOff] = Math.max(0, Math.min(255, r));
        dst[dstOff + 1] = Math.max(0, Math.min(255, g));
        dst[dstOff + 2] = Math.max(0, Math.min(255, b));
        dst[dstOff + 3] = src[dstOff + 3]; // keep opacity
      }
    }
    return output;
  };

  // AI Centering & Whitespace trimming
  const handleAICenter = () => {
    const img = imageRef.current;
    if (!img) return;

    // Create a temporary canvas of original image size to find bounding box
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = img.width;
    tempCanvas.height = img.height;
    const tempCtx = tempCanvas.getContext("2d");
    if (!tempCtx) return;

    tempCtx.drawImage(img, 0, 0);
    const imgData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
    const data = imgData.data;

    let minX = tempCanvas.width;
    let maxX = 0;
    let minY = tempCanvas.height;
    let maxY = 0;

    // Scan pixels to find bounding box of the non-white/non-transparent product
    for (let y = 0; y < tempCanvas.height; y++) {
      for (let x = 0; x < tempCanvas.width; x++) {
        const idx = (y * tempCanvas.width + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        const a = data[idx + 3];

        // Background is transparent or close to pure white (#f0-#ff)
        const isBg = a < 30 || (r > 240 && g > 240 && b > 240);

        if (!isBg) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    // Default to whole image if nothing is found
    if (minX > maxX || minY > maxY) {
      minX = 0;
      maxX = tempCanvas.width;
      minY = 0;
      maxY = tempCanvas.height;
    }

    const boxWidth = maxX - minX + 1;
    const boxHeight = maxY - minY + 1;

    // Bounding Box Center offset from original image center
    const boxCenterX = minX + boxWidth / 2;
    const boxCenterY = minY + boxHeight / 2;
    const imgCenterX = img.width / 2;
    const imgCenterY = img.height / 2;

    const diffX = imgCenterX - boxCenterX;
    const diffY = imgCenterY - boxCenterY;

    // Set scale to fit product box inside the target 400x400 canvas with 15% padding margin
    const targetScale = (400 * 0.8) / Math.max(boxWidth, boxHeight);
    setScale(targetScale);

    // Apply the offset (needs to scale with the target scale)
    setOffsetX(diffX * targetScale);
    setOffsetY(diffY * targetScale);
    setRotation(0); // Reset rotation to keep math accurate
  };

  // Crop & Optimize for Web (1200x1200px, 85% WebP, <300KB)
  const handleOptimizeAndSave = () => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;

    // Create high-resolution export canvas of exactly 1200x1200px
    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = 1200;
    exportCanvas.height = 1200;
    const exportCtx = exportCanvas.getContext("2d");
    if (!exportCtx) return;

    // Fill with white background
    exportCtx.fillStyle = "#ffffff";
    exportCtx.fillRect(0, 0, 1200, 1200);

    // Scaling factor from current display scale (based on 400px canvas size) to export scale (1200px size)
    const exportRatio = 1200 / canvas.width;

    exportCtx.save();
    // Translate, rotate, and scale image to export context
    exportCtx.translate(
      exportCanvas.width / 2 + offsetX * exportRatio, 
      exportCanvas.height / 2 + offsetY * exportRatio
    );
    exportCtx.rotate((rotation * Math.PI) / 180);
    exportCtx.scale(scale * exportRatio, scale * exportRatio);
    exportCtx.drawImage(img, -img.width / 2, -img.height / 2);
    exportCtx.restore();

    // Apply brightness, contrast and sharpness filters to high-res canvas
    if (brightness !== 0 || contrast !== 0 || sharpness !== 0) {
      let exportData = exportCtx.getImageData(0, 0, 1200, 1200);
      exportData = applyBrightnessContrast(exportData, brightness, contrast);
      if (sharpness > 0) {
        exportData = applySharpnessFilter(exportCtx, exportData, sharpness);
      }
      exportCtx.putImageData(exportData, 0, 0);
    }

    // Convert to WebP base64 string
    let quality = 0.85;
    let base64 = exportCanvas.toDataURL("image/webp", quality);

    // If size > 300KB, slightly reduce quality
    while (base64.length * 0.75 > 300 * 1024 && quality > 0.4) {
      quality -= 0.05;
      base64 = exportCanvas.toDataURL("image/webp", quality);
    }

    onSave(base64);
  };

  // Mouse Drag Events for Desktop
  const handleMouseDown = (e: React.MouseEvent) => {
    touchStartRef.current = { x: e.clientX, y: e.clientY };
    isDraggingRef.current = true;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDraggingRef.current) {
      const dx = e.clientX - touchStartRef.current.x;
      const dy = e.clientY - touchStartRef.current.y;
      setOffsetX((prev) => prev + dx);
      setOffsetY((prev) => prev + dy);
      touchStartRef.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  // Touch Events for Mobile (Drag and Pinch Zoom)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      touchStartRef.current = { x: touch.clientX, y: touch.clientY };
      isDraggingRef.current = true;
    } else if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const dist = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY);
      touchStartDistRef.current = dist;
      touchStartScaleRef.current = scale;
      isPinchingRef.current = true;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDraggingRef.current && e.touches.length === 1) {
      const touch = e.touches[0];
      const dx = touch.clientX - touchStartRef.current.x;
      const dy = touch.clientY - touchStartRef.current.y;
      setOffsetX((prev) => prev + dx);
      setOffsetY((prev) => prev + dy);
      touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    } else if (isPinchingRef.current && e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const dist = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY);
      const factor = dist / touchStartDistRef.current;
      setScale(Math.max(0.1, Math.min(5, touchStartScaleRef.current * factor)));
    }
  };

  const handleTouchEnd = () => {
    isDraggingRef.current = false;
    isPinchingRef.current = false;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-white border-2 border-slate-950 rounded-2xl p-5 sm:p-6 shadow-[5px_5px_0px_rgba(0,0,0,1)] text-slate-950 space-y-5 my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-slate-100 pb-3">
          <h3 className="font-black text-sm uppercase flex items-center gap-2">
            <span>🖼️</span> Editor Inteligente de Fotos
          </h3>
          <button 
            type="button" 
            onClick={onClose}
            className="p-1 hover:bg-slate-100 rounded-full border border-transparent hover:border-slate-950 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content columns */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Left Canvas Preview */}
          <div className="md:col-span-7 flex flex-col items-center">
            <div 
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              className="relative w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] border-2 border-slate-950 bg-slate-100 cursor-grab active:cursor-grabbing rounded-lg overflow-hidden select-none touch-none flex items-center justify-center shadow-inner"
            >
              <canvas 
                ref={canvasRef} 
                width={400} 
                height={400} 
                className="w-full h-full object-contain"
              />
              <span className="absolute bottom-2.5 right-2.5 bg-slate-950/70 text-white font-bold font-mono text-[9px] px-2 py-0.5 rounded pointer-events-none">
                1200x1200px (WebP)
              </span>
            </div>
            <p className="text-[10px] text-slate-450 text-center font-bold mt-2">
              Arrastar imagem para reposicionar • Gesto de pinça para dar zoom
            </p>
          </div>

          {/* Right Adjustments panel */}
          <div className="md:col-span-5 space-y-4">
            {/* Quick action buttons */}
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Ações com IA</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleAICenter}
                  className="flex items-center justify-center gap-1.5 py-2.5 bg-slate-900 text-white font-bold text-[10px] uppercase border-2 border-slate-950 rounded shadow-[1px_1px_0px_rgba(0,0,0,1)] hover:bg-slate-800 transition-all cursor-pointer"
                  title="Detecção inteligente e centralização de objeto"
                >
                  <Sparkles className="w-3.5 h-3.5 text-accent-amber fill-accent-amber" />
                  <span>Centralizar</span>
                </button>
                <button
                  type="button"
                  onClick={() => resetAdjustments()}
                  className="flex items-center justify-center gap-1.5 py-2.5 bg-slate-50 text-slate-700 font-bold text-[10px] uppercase border-2 border-slate-950 rounded shadow-[1px_1px_0px_rgba(0,0,0,1)] hover:bg-slate-100 transition-all cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Redefinir</span>
                </button>
              </div>
            </div>

            {/* Slider Adjustments */}
            <div className="space-y-3.5 pt-2 border-t border-slate-100">
              <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Transformar</span>
              
              {/* Zoom slider */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[10px] font-bold text-slate-650">
                  <span className="flex items-center gap-1"><ZoomIn className="w-3.5 h-3.5" /> Zoom</span>
                  <span className="font-mono text-slate-900">{Math.round(scale * 100)}%</span>
                </div>
                <input 
                  type="range"
                  min="0.1"
                  max="3"
                  step="0.05"
                  value={scale}
                  onChange={(e) => setScale(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-100 border border-slate-200 rounded appearance-none cursor-pointer accent-slate-950"
                />
              </div>

              {/* Rotation slider */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[10px] font-bold text-slate-650">
                  <span className="flex items-center gap-1"><RotateCw className="w-3.5 h-3.5" /> Rotação</span>
                  <span className="font-mono text-slate-900">{rotation}°</span>
                </div>
                <input 
                  type="range"
                  min="0"
                  max="360"
                  step="5"
                  value={rotation}
                  onChange={(e) => setRotation(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-100 border border-slate-200 rounded appearance-none cursor-pointer accent-slate-950"
                />
              </div>
            </div>

            {/* Image Enhancements */}
            <div className="space-y-3.5 pt-2 border-t border-slate-100">
              <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Cor e Qualidade</span>
              
              {/* Brightness slider */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[10px] font-bold text-slate-650">
                  <span className="flex items-center gap-1"><Sun className="w-3.5 h-3.5" /> Brilho</span>
                  <span className="font-mono text-slate-900">{brightness > 0 ? `+${brightness}` : brightness}</span>
                </div>
                <input 
                  type="range"
                  min="-100"
                  max="100"
                  step="2"
                  value={brightness}
                  onChange={(e) => setBrightness(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-100 border border-slate-200 rounded appearance-none cursor-pointer accent-slate-950"
                />
              </div>

              {/* Contrast slider */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[10px] font-bold text-slate-650">
                  <span className="flex items-center gap-1"><Contrast className="w-3.5 h-3.5" /> Contraste</span>
                  <span className="font-mono text-slate-900">{contrast > 0 ? `+${contrast}` : contrast}</span>
                </div>
                <input 
                  type="range"
                  min="-100"
                  max="100"
                  step="2"
                  value={contrast}
                  onChange={(e) => setContrast(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-100 border border-slate-200 rounded appearance-none cursor-pointer accent-slate-950"
                />
              </div>

              {/* Sharpness slider */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[10px] font-bold text-slate-650">
                  <span className="flex items-center gap-1"><Sliders className="w-3.5 h-3.5" /> Nitidez (Foco)</span>
                  <span className="font-mono text-slate-900">{sharpness}</span>
                </div>
                <input 
                  type="range"
                  min="0"
                  max="5"
                  step="0.5"
                  value={sharpness}
                  onChange={(e) => setSharpness(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-100 border border-slate-200 rounded appearance-none cursor-pointer accent-slate-950"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex gap-2 pt-3 border-t-2 border-slate-100 text-xs">
          <button
            type="button"
            onClick={handleOptimizeAndSave}
            className="flex-1 py-3 bg-accent-amber hover:bg-amber-400 text-slate-950 font-black border-2 border-slate-950 rounded-xl shadow-[3px_3px_0px_rgba(0,0,0,1)] transition-all cursor-pointer flex items-center justify-center gap-1.5 uppercase tracking-wider"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Otimizar e Publicar</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 bg-white hover:bg-slate-50 text-slate-700 font-bold border-2 border-slate-950 rounded-xl transition-all cursor-pointer uppercase tracking-wider"
          >
            Cancelar
          </button>
        </div>

      </div>
    </div>
  );
}
