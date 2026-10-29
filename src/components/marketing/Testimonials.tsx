import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Star } from 'lucide-react';
import { listTestimonials } from '@/services/content.service';
import { queryKeys } from '@/lib/queryKeys';
import { cn } from '@/lib/utils';
import { SectionHeading } from '@/components/marketing/SectionHeading';
import type { Testimonial } from '@/types/content.types';

// Max combs shown; extra reviews are sampled randomly from the API.
const MAX_COMBS = 7;
const ROW_MAX = [4, 3];

const TILE = 56;
const GAP = 20;
const CELL_W = TILE + GAP;
const CELL_H = TILE + GAP;
const ROW_STEP = 0.87 * CELL_H;

const ROTATE_MS = 2600;

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function buildPositions(count: number) {
  const rows: number[] = [];
  let remaining = count;
  let r = 0;
  while (remaining > 0) {
    const per = Math.min(ROW_MAX[r % ROW_MAX.length], remaining);
    rows.push(per);
    remaining -= per;
    r += 1;
  }

  const width = Math.max(...rows) * CELL_W;
  const positions: { x: number; y: number }[] = [];
  rows.forEach((c, row) => {
    const startX = (width - c * CELL_W) / 2;
    for (let col = 0; col < c; col++) {
      positions.push({ x: startX + col * CELL_W + CELL_W / 2, y: row * ROW_STEP + CELL_H / 2 });
    }
  });
  const height = (rows.length - 1) * ROW_STEP + CELL_H;
  return { positions, width, height };
}

export function Testimonials() {
  const { data: testimonials } = useQuery({
    queryKey: queryKeys.content.testimonials(),
    queryFn: listTestimonials,
  });

  const combs = useMemo<Testimonial[]>(() => {
    const list = (testimonials ?? []).filter((t) => t.isActive !== false);
    const shuffled = [...list];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, MAX_COMBS);
  }, [testimonials]);

  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || combs.length < 2) return;
    const id = setInterval(() => setActive((a) => (a + 1) % combs.length), ROTATE_MS);
    return () => clearInterval(id);
  }, [paused, combs.length]);

  useEffect(() => {
    setActive(0);
  }, [combs.length]);

  if (combs.length === 0) return null;

  const activeIdx = active % combs.length;
  const current = combs[activeIdx];
  const { positions, width, height } = buildPositions(combs.length);

  return (
    <section id="testimonials" className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Testimonials"
        icon={Star}
        title="Join the list of happy users"
        subtitle="Real stories from people who bought and sold with confidence."
      />

      <div className="mt-12 flex justify-center">
        <div
          className="scale-100 sm:scale-110 lg:scale-[1.3]"
          style={{ transformOrigin: 'top center' }}
        >
          <div
            className="relative"
            style={{ width, height }}
            onMouseLeave={() => setPaused(false)}
          >
            {combs.map((t, i) => {
              const pos = positions[i];
              const isActive = i === activeIdx;
              return (
                <button
                  key={t._id || t.id || i}
                  type="button"
                  aria-label={`Review by ${t.name}`}
                  onMouseEnter={() => {
                    setActive(i);
                    setPaused(true);
                  }}
                  onFocus={() => {
                    setActive(i);
                    setPaused(true);
                  }}
                  className="group absolute   drop-shadow-[0_10px_20px_rgba(15,23,42,0.15)] transition-transform duration-300 hover:-translate-y-1 focus:outline-none"
                  style={{ left: pos.x - TILE / 2, top: pos.y - TILE / 2, width: TILE, height: TILE }}
                >
                  <span
                    className={cn(
                      'absolute inset-0 rounded-full  bg-white transition-colors duration-300',
                      isActive && 'bg-amber-400',
                      !isActive && 'group-hover:bg-amber-400',
                      'group-focus-visible:bg-amber-400',
                    )}
                  />
                  <span className="absolute inset-0 flex scale-[0.88] items-center justify-center rounded-full bg-white transition-colors duration-300">
                    <span
                      className={cn(
                        'text-base font-bold tracking-wide',
                        isActive ? 'text-slate-900' : 'text-slate-600 group-hover:text-slate-900',
                      )}
                    >
                      {initials(t.name)}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Detail of the focused comb */}
      <div key={activeIdx} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="mx-auto mt-14 flex max-w-xl flex-col items-center text-center sm:mt-16 lg:mt-24">
          <p className="text-lg font-bold text-slate-900">{current.name}</p>
          <p className="text-sm text-muted-foreground">{current.city || current.role || 'Verified buyer'}</p>
          <div className="mt-2 flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={cn('h-4 w-4', i < current.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300')}
              />
            ))}
          </div>
          <p className="mt-4 text-base leading-relaxed text-slate-600">“{current.quote}”</p>
        </div>
      </div>
    </section>
  );
}

export default Testimonials;
