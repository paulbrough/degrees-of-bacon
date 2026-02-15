"use client";

import { useState } from "react";

interface GalleryImage {
  path: string;
  alt: string;
}

export function useImageModal(gallery?: GalleryImage[]) {
  const [open, setOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [singleImage, setSingleImage] = useState<GalleryImage | null>(null);

  const isGalleryMode = !!gallery;
  const currentImage = isGalleryMode
    ? gallery[currentIndex]
    : singleImage;

  const openImage = (path: string, alt: string) => {
    if (isGalleryMode && gallery) {
      const index = gallery.findIndex((img) => img.path === path);
      setCurrentIndex(index >= 0 ? index : 0);
    } else {
      setSingleImage({ path, alt });
    }
    setOpen(true);
  };

  const closeModal = () => {
    setOpen(false);
  };

  const goToNext = () => {
    if (!isGalleryMode || !gallery) return;
    setCurrentIndex((prev) => (prev + 1) % gallery.length);
  };

  const goToPrev = () => {
    if (!isGalleryMode || !gallery) return;
    setCurrentIndex((prev) => (prev - 1 + gallery.length) % gallery.length);
  };

  return {
    open,
    imagePath: currentImage?.path || "",
    alt: currentImage?.alt || "",
    onClose: closeModal,
    onNext: isGalleryMode && gallery && gallery.length > 1 ? goToNext : undefined,
    onPrev: isGalleryMode && gallery && gallery.length > 1 ? goToPrev : undefined,
    openImage,
  };
}
