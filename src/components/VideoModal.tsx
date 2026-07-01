"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";
import { parseVideoUrl } from "@/lib/videoUtils";

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  videoTitle: string;
}

export default function VideoModal({ isOpen, onClose, videoUrl, videoTitle }: VideoModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    // Close on Escape key press
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    // Prevent background scrolling when modal is open
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const { embedUrl } = parseVideoUrl(videoUrl);

  if (!embedUrl) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 font-sans">
      {/* Backdrop with backdrop-blur */}
      <div
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity duration-300 animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-4xl bg-black rounded-2xl overflow-hidden shadow-2xl border border-slate-800 transform scale-100 transition-transform duration-350 animate-zoom-in z-10">
        
        {/* Modal Header */}
        <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent flex justify-between items-center z-20 pointer-events-none">
          <h3 className="text-white font-bold text-sm sm:text-base drop-shadow-md truncate max-w-[80%]">
            {videoTitle || "Demonstração do Produto"}
          </h3>
          <button
            onClick={onClose}
            className="pointer-events-auto p-2 bg-black/40 hover:bg-black/80 text-white hover:text-accent-amber rounded-full transition-all duration-200 border border-white/10"
            title="Fechar (Esc)"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Video Aspect Container (16:9) */}
        <div className="relative w-full aspect-video bg-black pt-12 sm:pt-14">
          <iframe
            src={embedUrl}
            title={videoTitle || "Video Player"}
            frameBorder="0"
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
          />
        </div>
      </div>
    </div>
  );
}
