import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowRight, Car, Heart, Search, SlidersHorizontal, Star, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Combobox } from "@/components/ui/combobox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getFeatured } from "@/services/vehicle.service";
import { listLocations } from "@/services/master.service";
import { addToWishlist, getWishlist, removeFromWishlist } from "@/services/wishlist.service";
import { queryKeys } from "@/lib/queryKeys";
import { ROUTES } from "@/constants/routes";
import { VEHICLE_CATEGORIES } from "@/constants/vehicleEnums";
import { useAuth } from "@/hooks/useAuth";
import { cn, getApiErrorMessage } from "@/lib/utils";

/* ----------------------------- helpers ----------------------------- */
// Vehicle field names vary between projects, so read them defensively.
// Adjust these three helpers if your Vehicle type uses different keys.
type Loose = Record<string, any>;

const vehicleImage = (v: unknown): string | undefined => {
  const o = v as Loose;
  const first = o.images?.[0];
  return (typeof first === "string" ? first : first?.url) ?? o.image ?? o.thumbnail ?? o.coverImage;
};

const vehicleTitle = (v: unknown): string => {
  const o = v as Loose;
  return o.title ?? [o.make ?? o.brand, o.model, o.variant].filter(Boolean).join(" ") ?? "Vehicle";
};

const vehiclePrice = (v: unknown): string | undefined => {
  const p = (v as Loose).price;
  return p ? `₹${Number(p).toLocaleString("en-IN")}` : undefined;
};

const BUDGETS = [
  { value: "100000", label: "Under ₹1 Lakh" },
  { value: "500000", label: "Under ₹5 Lakh" },
  { value: "1000000", label: "Under ₹10 Lakh" },
  { value: "2000000", label: "Under ₹20 Lakh" },
  { value: "5000000", label: "Under ₹50 Lakh" },
];

const FIELD = "flex h-10 items-center rounded-xl border border-slate-200 bg-white shadow-sm";
const TRIGGER =
  "!h-10 w-full rounded-xl border-0 bg-transparent px-3 py-0 text-sm text-gray-800 shadow-none ring-0 focus:ring-0 focus:ring-offset-0 data-placeholder:text-gray-400";

/* ------------------------------ search ------------------------------ */
function SearchWithFilters() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState("");
  const [budget, setBudget] = useState("");
  const [city, setCity] = useState("");

  const { data: locations } = useQuery({
    queryKey: queryKeys.master.locations(),
    queryFn: listLocations,
  });
  const cityOptions = (locations ?? [])
    .flatMap((l) => l.cities.map((c) => c.name))
    .map((c) => ({ value: c, label: c }));

  const activeCount = [category, budget, city].filter(Boolean).length;

  const clear = () => {
    setCategory("");
    setBudget("");
    setCity("");
  };

  const submit = (e?: FormEvent) => {
    e?.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (category) params.set("category", category);
    if (city) params.set("city", city);
    if (budget) params.set("maxPrice", budget);
    const qs = params.toString();
    navigate(qs ? `${ROUTES.vehicles}?${qs}` : ROUTES.vehicles);
  };

  return (
    <form onSubmit={submit}>
      {/* Thin pill: keyword input + filter toggle + circular search */}
      <div className="flex items-center gap-1 rounded-full bg-white p-1 pl-4 shadow-sm ring-1 ring-slate-200 focus-within:ring-primary/40">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search brand, model…"
          aria-label="Search vehicles"
          className="h-9 min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
        />

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls="hero-filters"
          aria-label={open ? "Hide filters" : "Show filters"}
          className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100 hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
        >
          {open ? <X className="h-4 w-4" /> : <SlidersHorizontal className="h-4 w-4" />}
          {activeCount > 0 && !open && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white">
              {activeCount}
            </span>
          )}
        </button>

        <button
          type="submit"
          aria-label="Search"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-white shadow-md shadow-primary/30 transition hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <Search className="h-4 w-4" />
        </button>
      </div>

      {/* Hidden filters — height animates 0fr -> 1fr and pushes the content below down */}
      <div
        id="hero-filters"
        aria-hidden={!open}
        className="grid"
        style={{
          gridTemplateRows: open ? "1fr" : "0fr",
          visibility: open ? "visible" : "hidden",
          transition: "grid-template-rows 300ms ease, visibility 300ms",
        }}
      >
        <div className="overflow-hidden">
          <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-2">
            <div className="grid grid-cols-2 gap-2 lg:grid-cols-3">
              <div className={FIELD}>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className={TRIGGER}>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {VEHICLE_CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className={FIELD}>
                <Select value={budget} onValueChange={setBudget}>
                  <SelectTrigger className={TRIGGER}>
                    <SelectValue placeholder="Budget" />
                  </SelectTrigger>
                  <SelectContent>
                    {BUDGETS.map((b) => (
                      <SelectItem key={b.value} value={b.value}>
                        {b.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className={`${FIELD} col-span-2 lg:col-span-1`}>
                <Combobox
                  value={city}
                  onChange={setCity}
                  options={cityOptions}
                  placeholder="City"
                  searchPlaceholder="Search city…"
                  emptyText="No city found."
                  popoverClassName="w-72"
                  className="h-10 w-full rounded-xl border-0 bg-transparent px-3 py-0 text-sm text-gray-800 shadow-none hover:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>
            </div>

            <div className="mt-2 flex items-center justify-end gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={clear} disabled={!activeCount}>
                Clear
              </Button>
              <Button type="submit" size="sm" className="rounded-full px-5">
                Apply filters
              </Button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}

/* ----------------------------- carousel ----------------------------- */
function BannerCarousel({ vehicles, isLoading }: { vehicles: unknown[]; isLoading: boolean }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);
  const [index, setIndex] = useState(0);

  const slides = vehicles.filter((v) => vehicleImage(v)).slice(0, 5);

  const goTo = useCallback((i: number) => {
    const el = trackRef.current?.children[i] as HTMLElement | undefined;
    if (el && trackRef.current) trackRef.current.scrollTo({ left: el.offsetLeft, behavior: "smooth" });
  }, []);

  const onScroll = () => {
    const track = trackRef.current;
    if (!track) return;
    const left = track.scrollLeft;
    let best = 0;
    let bestDist = Infinity;
    Array.from(track.children).forEach((c, i) => {
      const d = Math.abs((c as HTMLElement).offsetLeft - left);
      if (d < bestDist) [best, bestDist] = [i, d];
    });
    setIndex(best);
  };

  // Autoplay (paused on hover/focus, off for reduced motion)
  useEffect(() => {
    if (slides.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => {
      if (!pausedRef.current) goTo((index + 1) % slides.length);
    }, 5000);
    return () => clearInterval(id);
  }, [index, slides.length, goTo]);

  if (isLoading) return <Skeleton className="h-52 w-full rounded-3xl sm:h-64" />;
  if (slides.length === 0) return null;

  return (
    <div
      onMouseEnter={() => (pausedRef.current = true)}
      onMouseLeave={() => (pausedRef.current = false)}
      onFocus={() => (pausedRef.current = true)}
      onBlur={() => (pausedRef.current = false)}
    >
      <div
        ref={trackRef}
        onScroll={onScroll}
        className="relative flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {slides.map((v) => {
          const o = v as Loose;
          const price = vehiclePrice(v);
          return (
            <article
              key={o.id}
              className="relative h-52 shrink-0 basis-[88%] snap-start overflow-hidden rounded-3xl bg-[#013164] sm:h-64 sm:basis-[70%] lg:basis-[48%]"
            >
              <img
                src={vehicleImage(v)}
                alt={vehicleTitle(v)}
                loading="lazy"
                decoding="async"
                draggable={false}
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#013164] via-[#013164]/70 to-transparent" />
              <div className="relative flex h-full max-w-[65%] flex-col justify-center gap-1 p-5 text-white sm:p-8">
                <p className="text-xs font-semibold text-cyan-300 sm:text-sm">Featured</p>
                <h3 className="line-clamp-2 text-xl font-bold leading-tight sm:text-3xl">{vehicleTitle(v)}</h3>
                {price && <p className="text-sm text-blue-100 sm:text-base">Starting at {price}</p>}
                <Button asChild className="mt-3 w-fit rounded-full bg-white text-slate-900 hover:bg-white/90">
                  <Link to={`${ROUTES.vehicles}/${o.id}`}>View details</Link>
                </Button>
              </div>
            </article>
          );
        })}
      </div>

      <div className="mt-3 flex justify-center gap-1.5" role="tablist" aria-label="Banner slides">
        {slides.map((_, i) => (
          <button
            key={i}
            type="button"
            role="tab"
            aria-selected={i === index}
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => goTo(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === index ? "w-6 bg-primary" : "w-1.5 bg-slate-300 hover:bg-slate-400"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

/* --------------------------- compact card --------------------------- */
function CompactVehicleCard({ vehicle, liked, onToggle }: { vehicle: unknown; liked: boolean; onToggle: (id: string) => void }) {
  const o = vehicle as Loose;
  const img = vehicleImage(vehicle);
  const price = vehiclePrice(vehicle);
  const rating = o.rating ?? o.averageRating;

  return (
    <div className="relative w-[160px] shrink-0 snap-start rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm sm:w-[190px]">
      <Link to={`${ROUTES.vehicles}/${o.id}`} className="group block">
        <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-slate-100">
          {img ? (
            <img
              src={img}
              alt={vehicleTitle(vehicle)}
              width={380}
              height={285}
              loading="lazy"
              decoding="async"
              draggable={false}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Car className="h-8 w-8 text-slate-300" />
            </div>
          )}
        </div>
        <div className="mt-2 space-y-0.5 px-1.5 pb-1.5">
          {rating ? (
            <p className="flex items-center gap-1 text-xs text-slate-500">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              {Number(rating).toFixed(1)}
            </p>
          ) : null}
          <p className="truncate text-sm font-semibold text-slate-900">{vehicleTitle(vehicle)}</p>
          {price && <p className="text-xs font-medium text-primary">{price}</p>}
        </div>
      </Link>

      <button
        type="button"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (o.id) onToggle(String(o.id)); }}
        aria-pressed={liked}
        aria-label={liked ? "Remove from wishlist" : "Add to wishlist"}
        className="absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 shadow-md ring-1 ring-black/5 transition hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
      >
        <Heart className={cn("h-4 w-4 transition-colors", liked ? "fill-red-500 text-red-500" : "text-slate-600")} />
      </button>
    </div>
  );
}

/* ------------------------------- hero ------------------------------- */
export function HeroSectionMobile() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { isAuthenticated } = useAuth();
  // Same query key as <Featured />, so React Query shares one request.
  const { data: featured, isLoading } = useQuery({
    queryKey: queryKeys.vehicles.featured({ limit: 8 }),
    queryFn: () => getFeatured({ limit: 8 }),
  });
  const { data: wishlist } = useQuery({
    queryKey: queryKeys.wishlist.list(),
    queryFn: () => getWishlist({ limit: 100 }),
    enabled: isAuthenticated,
  });
  const likedIds = new Set((wishlist?.data ?? []).map((v) => v.id));
  const wishlistMutation = useMutation({
    mutationFn: ({ id, liked }: { id: string; liked: boolean }) => (liked ? removeFromWishlist(id) : addToWishlist(id)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['wishlist'] }),
    onError: (e) => toast.error(getApiErrorMessage(e, 'Could not update wishlist')),
  });
  const toggleWishlist = (id: string) => {
    if (!isAuthenticated) { navigate(`${ROUTES.login}?redirect=${encodeURIComponent(window.location.pathname)}`); return; }
    wishlistMutation.mutate({ id, liked: likedIds.has(id) });
  };
  const list = featured ?? [];

  return (
    <section id="hero" className="mx-auto max-w-7xl space-y-6 px-4 pb-12 pt-16 sm:px-6 sm:pt-20 lg:px-8 lg:pt-24">
      <SearchWithFilters />

      <BannerCarousel vehicles={list} isLoading={isLoading} />

      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Trending vehicles</h2>
          <Link to={ROUTES.vehicles} className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
            See all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="-mx-4 mt-4 flex snap-x gap-3 overflow-x-auto overscroll-x-contain px-4 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0 [&::-webkit-scrollbar]:hidden">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-[220px] w-[160px] shrink-0 rounded-2xl sm:w-[190px]" />
              ))
            : list.map((v) => <CompactVehicleCard key={(v as any).id} vehicle={v} liked={likedIds.has((v as any).id)} onToggle={toggleWishlist} />)}
        </div>

        {!isLoading && list.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-10 text-center text-sm text-muted-foreground">
            <Car className="h-8 w-8 text-slate-300" />
            No vehicles listed yet. Check back soon.
          </div>
        )}
      </div>
    </section>
  );
}

export default HeroSectionMobile;