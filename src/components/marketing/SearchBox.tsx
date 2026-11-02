import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Combobox } from "@/components/ui/combobox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { listLocations } from "@/services/master.service";
import { queryKeys } from "@/lib/queryKeys";
import { ROUTES } from "@/constants/routes";
import { VEHICLE_CATEGORIES } from "@/constants/vehicleEnums";

const BUDGETS = [
  { value: "100000", label: "Under ₹1 Lakh" },
  { value: "500000", label: "Under ₹5 Lakh" },
  { value: "1000000", label: "Under ₹10 Lakh" },
  { value: "2000000", label: "Under ₹20 Lakh" },
  { value: "5000000", label: "Under ₹50 Lakh" },
];

/** Reusable vehicle search form — rectangular, equal-height fields. */
export function SearchBox({ className, glass = false }: { className?: string; glass?: boolean }) {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [city, setCity] = useState("");
  const [budget, setBudget] = useState("");

  const { data: locations } = useQuery({
    queryKey: queryKeys.master.locations(),
    queryFn: listLocations,
  });
  const cities = (locations ?? []).flatMap((l) => l.cities.map((c) => c.name));
  const cityOptions = cities.map((c) => ({ value: c, label: c }));

  const search = () => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (category) params.set("category", category);
    if (city) params.set("city", city);
    if (budget) params.set("maxPrice", budget);
    navigate(`${ROUTES.vehicles}?${params.toString()}`);
  };

  const field =
    "flex h-10 items-center rounded-xl border border-black/5 bg-white shadow-sm transition-colors";
  const trigger =
    "!h-10 w-full rounded-xl border-0 bg-transparent px-3 py-0 text-sm text-gray-800 shadow-none ring-0 focus:ring-0 focus:ring-offset-0 data-placeholder:text-gray-400";

  return (
    <div className={className}>
      <div
        className={`relative z-20 mx-auto rounded-xl border shadow-xl ${
          glass
            ? "border-white/40 bg-white/70 backdrop-blur-md supports-[backdrop-filter]:bg-white/60"
            : "border-gray-100 bg-white"
        }`}
      >
        <div className="grid grid-cols-2 gap-2 p-2 lg:grid-cols-[1fr_1fr_1fr_1fr_auto]">
          {/* Category */}
          <div className={field}>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className={trigger}>
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

          {/* Budget */}
          <div className={field}>
            <Select value={budget} onValueChange={setBudget}>
              <SelectTrigger className={trigger}>
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

          {/* City */}
          <div className={field}>
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

          {/* Keyword */}
          <div className={field}>
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && search()}
              placeholder="Brand, model…"
              className="h-10 w-full rounded-xl border-0 bg-transparent px-3 py-0 text-sm font-medium text-gray-800 shadow-none outline-none ring-0 placeholder:font-normal placeholder:text-gray-400 focus-visible:border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>

          {/* Search */}
          <Button
            onClick={search}
            className="col-span-2 h-10 w-full gap-2 rounded-xl bg-primary text-sm font-semibold shadow-md shadow-primary/30 hover:bg-primary/90 lg:col-span-1 lg:w-10 lg:rounded-full lg:gap-0"
          >
            <Search className="size-4" />
            <span className="lg:hidden">Search</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default SearchBox;
