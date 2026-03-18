"use client";

import { useState } from "react";

type Props = {
  image: string;
  productName: string;
  videoUrl: string;
};

export function ProductVideoPreview({ image, productName, videoUrl }: Props) {
  const [showVideo, setShowVideo] = useState(false);

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-3">
      <p className="mb-2 text-sm font-medium text-zinc-300">Vídeo do produto</p>

      {showVideo ? (
        <video
          className="w-full rounded-xl"
          controls
          playsInline
          preload="metadata"
          src={videoUrl}
        />
      ) : (
        <div className="relative overflow-hidden rounded-xl">
          <img
            alt={`Prévia do vídeo de ${productName}`}
            className="h-[320px] w-full object-cover"
            decoding="async"
            loading="lazy"
            src={image}
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/35">
            <button
              className="rounded-xl bg-amber-400 px-5 py-3 text-sm font-bold text-zinc-950 transition hover:bg-amber-300"
              onClick={() => setShowVideo(true)}
              type="button"
            >
              Assistir vídeo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
