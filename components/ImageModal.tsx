"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { tmdbImageUrl } from "@/lib/tmdb-image";

interface ImageModalProps {
  open: boolean;
  onClose: () => void;
  imagePath: string;
  alt: string;
  onNext?: () => void;
  onPrev?: () => void;
}

export function ImageModal({
  open,
  onClose,
  imagePath,
  alt,
  onNext,
  onPrev,
}: ImageModalProps) {
  const [mode, setMode] = useState<"fit" | "zoom">("fit");
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const modalRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Reset mode and position when image changes
  useEffect(() => {
    setMode("fit");
    setPosition({ x: 0, y: 0 });
    setIsDragging(false);
  }, [imagePath]);

  // Body scroll lock
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "z" || e.key === "Z") {
        setMode((prev) => (prev === "fit" ? "zoom" : "fit"));
        if (mode === "zoom") {
          setPosition({ x: 0, y: 0 });
        }
      } else if (e.key === "ArrowLeft" && onPrev) {
        e.preventDefault();
        onPrev();
      } else if (e.key === "ArrowRight" && onNext) {
        e.preventDefault();
        onNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose, onNext, onPrev, mode]);

  // Drag handlers for zoom mode
  const handlePointerDown = (e: React.PointerEvent) => {
    if (mode !== "zoom") return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || mode !== "zoom") return;
    setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  const toggleMode = () => {
    if (mode === "fit") {
      setMode("zoom");
      setPosition({ x: 0, y: 0 });
    } else {
      setMode("fit");
      setPosition({ x: 0, y: 0 });
    }
  };

  if (!open) return null;

  const fitImageUrl = tmdbImageUrl(imagePath, "w780");
  const zoomImageUrl = tmdbImageUrl(imagePath, "original");

  return (
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
      onClick={(e) => {
        if (e.target === modalRef.current) {
          onClose();
        }
      }}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        aria-label="Close modal"
        className="absolute right-4 top-4 z-10 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
      >
        <svg
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      {/* Zoom toggle button */}
      <button
        onClick={toggleMode}
        aria-label={mode === "fit" ? "Zoom to original size" : "Fit to viewport"}
        className="absolute left-4 top-4 z-10 rounded-full bg-black/50 px-4 py-2 text-sm text-white transition-colors hover:bg-black/70"
      >
        {mode === "fit" ? "Zoom (Z)" : "Fit (Z)"}
      </button>

      {/* Navigation arrows */}
      {onPrev && (
        <button
          onClick={onPrev}
          aria-label="Previous image"
          className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/50 p-3 text-white transition-colors hover:bg-black/70"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
      )}

      {onNext && (
        <button
          onClick={onNext}
          aria-label="Next image"
          className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/50 p-3 text-white transition-colors hover:bg-black/70"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      )}

      {/* Image container */}
      {mode === "fit" ? (
        <div className="relative flex max-h-[90vh] max-w-[90vw] items-center justify-center">
          {fitImageUrl && (
            <Image
              src={fitImageUrl}
              alt={alt}
              width={1280}
              height={720}
              className="max-h-[90vh] max-w-[90vw] object-contain"
              priority
            />
          )}
        </div>
      ) : mode === "zoom" && zoomImageUrl ? (
        <div className="fixed inset-0 flex items-center justify-center overflow-hidden">
          <div className="relative h-[calc(100vh-8rem)] w-[calc(100vw-4rem)] overflow-hidden flex items-center justify-center">
            <img
              ref={imageRef}
              src={zoomImageUrl}
              alt={alt}
              style={{
                transform: `translate(${position.x}px, ${position.y}px)`,
                cursor: isDragging ? "grabbing" : "grab",
                userSelect: "none",
                maxWidth: "none",
                maxHeight: "none",
              }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              draggable={false}
            />
          </div>
        </div>
      ) : null}

      {/* Keyboard hint */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center text-xs text-white/60">
        <p>
          ESC to close • Z to toggle zoom
          {(onPrev || onNext) && " • Arrow keys to navigate"}
        </p>
      </div>
    </div>
  );
}
