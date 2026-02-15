"use client";

import Image from "next/image";
import { tmdbImageUrl } from "@/lib/tmdb-image";
import { ImageModal } from "@/components/ImageModal";
import { useImageModal } from "@/components/hooks/useImageModal";

interface ProfileImage {
  file_path: string;
}

interface TaggedImage {
  file_path: string;
  media?: {
    title?: string;
    name?: string;
  };
}

interface PersonPhotoGalleryProps {
  profileImages: ProfileImage[];
  taggedImages: TaggedImage[];
  personName: string;
}

export function PersonPhotoGallery({
  profileImages,
  taggedImages,
  personName,
}: PersonPhotoGalleryProps) {
  // Create unified gallery
  const allPhotos = [
    ...profileImages.slice(0, 10).map((img) => ({
      path: img.file_path,
      alt: `${personName} photo`,
    })),
    ...taggedImages.slice(0, 10).map((img) => ({
      path: img.file_path,
      alt: `${personName} in ${img.media?.title || img.media?.name || "production"}`,
    })),
  ];

  const imageModal = useImageModal(allPhotos);

  if (allPhotos.length === 0) return null;

  return (
    <>
      <section>
        <h2 className="mb-4 text-lg font-semibold">Photos</h2>
        <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
          {profileImages.slice(0, 10).map((img) => {
            const url = tmdbImageUrl(img.file_path, "w342");
            if (!url) return null;
            return (
              <button
                key={img.file_path}
                onClick={() => imageModal.openImage(img.file_path, `${personName} photo`)}
                className="relative h-[200px] w-[133px] shrink-0 cursor-pointer overflow-hidden rounded-lg transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <Image
                  src={url}
                  alt={`${personName} photo`}
                  fill
                  sizes="133px"
                  className="object-cover"
                />
              </button>
            );
          })}
          {taggedImages.slice(0, 10).map((img) => {
            const url = tmdbImageUrl(img.file_path, "w342");
            if (!url) return null;
            const alt = `${personName} in ${img.media?.title || img.media?.name || "production"}`;
            return (
              <button
                key={img.file_path}
                onClick={() => imageModal.openImage(img.file_path, alt)}
                className="relative h-[200px] w-[300px] shrink-0 cursor-pointer overflow-hidden rounded-lg transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <Image
                  src={url}
                  alt={alt}
                  fill
                  sizes="300px"
                  className="object-cover"
                />
              </button>
            );
          })}
        </div>
      </section>

      <ImageModal {...imageModal} />
    </>
  );
}
