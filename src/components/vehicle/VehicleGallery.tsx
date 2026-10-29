import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, X, Expand } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { VehicleImage } from '@/types/vehicle.types';

interface Props {
  images: VehicleImage[];
  title: string;
}

/** Image gallery with thumbnails and a keyboard-navigable lightbox. */
export function VehicleGallery({ images, title }: Props) {
  const sorted = [...images].sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary) || (a.order ?? 0) - (b.order ?? 0));
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  const count = sorted.length;

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox(false);
      if (e.key === 'ArrowRight') setActive((i) => (i + 1) % count);
      if (e.key === 'ArrowLeft') setActive((i) => (i - 1 + count) % count);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightbox, count]);

  if (count === 0) {
    return (
      <div className="flex aspect-[4/3] items-center justify-center rounded-xl border bg-muted text-sm text-muted-foreground">
        No images available
      </div>
    );
  }

  const go = (dir: number) => setActive((i) => (i + dir + count) % count);

  return (
    <>
      <div className="space-y-3">
        <div className="group relative aspect-[4/3] overflow-hidden rounded-xl border bg-muted">
          <img src={sorted[active].url} alt={`${title} — image ${active + 1}`} className="h-full w-full object-cover" />
          {count > 1 && (
            <>
              <button
                type="button"
                aria-label="Previous image"
                onClick={() => go(-1)}
                className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                aria-label="Next image"
                onClick={() => go(1)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
          <button
            type="button"
            aria-label="Open fullscreen"
            onClick={() => setLightbox(true)}
            className="absolute right-2 top-2 rounded-full bg-black/40 p-1.5 text-white"
          >
            <Expand className="h-4 w-4" />
          </button>
          {sorted[active].tag && (
            <span className="absolute left-2 top-2 rounded bg-black/50 px-2 py-0.5 text-xs text-white">
              {sorted[active].tag}
            </span>
          )}
          <span className="absolute bottom-2 right-2 rounded bg-black/50 px-2 py-0.5 text-xs text-white">
            {active + 1} / {count}
          </span>
        </div>

        {count > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
            {sorted.map((img, i) => (
              <button
                key={img._id || img.url}
                type="button"
                onClick={() => setActive(i)}
                className={cn(
                  'h-16 w-20 shrink-0 overflow-hidden rounded-md border-2',
                  i === active ? 'border-primary' : 'border-transparent opacity-70 hover:opacity-100',
                )}
              >
                <img src={img.url} alt="" className="h-full w-full object-cover" loading="lazy" />
              </button>
            ))}
          </div>
        )}
      </div>

      {lightbox && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90" role="dialog">
          <button
            type="button"
            aria-label="Close"
            onClick={() => setLightbox(false)}
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
          >
            <X className="h-6 w-6" />
          </button>
          <button
            type="button"
            aria-label="Previous"
            onClick={() => go(-1)}
            className="absolute left-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
          >
            <ChevronLeft className="h-7 w-7" />
          </button>
          <img src={sorted[active].url} alt={`${title} — image ${active + 1}`} className="max-h-[85vh] max-w-[90vw] object-contain" />
          <button
            type="button"
            aria-label="Next"
            onClick={() => go(1)}
            className="absolute right-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
          >
            <ChevronRight className="h-7 w-7" />
          </button>
        </div>
      )}
    </>
  );
}

export default VehicleGallery;
