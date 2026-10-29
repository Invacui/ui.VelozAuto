import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Search, Car, MapPin, IndianRupee } from "lucide-react";
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

const Divider = () => (
  <div className="flex items-center">
    <div className="hidden h-6 w-px bg-gray-200 lg:block" />
    <div className="my-2 h-px w-full bg-gray-100 lg:hidden" />
  </div>
);

/** Reusable vehicle search form — pill-style matching the MRT aesthetic. */
export function SearchBox({ className }: { className?: string }) {
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

  const selectedCategory = VEHICLE_CATEGORIES.find((c) => c.value === category);
  const selectedBudget = BUDGETS.find((b) => b.value === budget);

  return (
    <div className={className}>
      <div className="relative z-20 mx-auto rounded-2xl border border-gray-100 bg-white shadow-xl lg:rounded-full">
        <div className="flex flex-col items-stretch p-2 gap-2  lg:flex-row lg:items-center">
          {/* Category */}
          <div className="flex items-center rounded-full hover:bg-primary/5 lg:flex-1 lg:max-w-[200px]">
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="group h-14! w-full rounded-full border-0 bg-transparent px-4 py-0 text-left shadow-none ring-0 focus:ring-0 focus:ring-offset-0 data-placeholder:text-gray-400 [&>svg]:h-4 [&>svg]:w-4 [&>svg]:text-gray-400 [&>svg]:transition-transform [&>svg]:duration-200 data-open:[&_svg]:rotate-180">
                <div className="flex w-full   items-center gap-3 ">
                  <Car className="hidden size-5 shrink-0 text-primary lg:block" />
                  <div className="flex min-w-0 flex-1 flex-col ">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      Category
                    </span>
                    <SelectValue className="block truncate text-sm font-semibold text-gray-800">
                      <span className="truncate">
                        {selectedCategory ? selectedCategory.label : "All categories"}
                      </span>
                    </SelectValue>
                  </div>
                </div>
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

          <Divider />

          {/* City */}
          <div className="flex items-center rounded-full hover:bg-primary/5 lg:flex-1 lg:max-w-[200px]">
            <Combobox
              value={city}
              onChange={setCity}
              options={cityOptions}
              label="City"
              icon={MapPin}
              placeholder="Any city"
              searchPlaceholder="Search city…"
              emptyText="No city found."
              popoverClassName="w-72"
              className="h-14 w-full rounded-full border-0 bg-transparent px-4 py-0 text-left shadow-none hover:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>

          <Divider />

          {/* Budget */}
          <div className="flex items-center rounded-full hover:bg-primary/5 lg:flex-1 lg:max-w-[200px]">
            <Select value={budget} onValueChange={setBudget}>
              <SelectTrigger className="group h-14! w-full rounded-full border-0 bg-transparent px-4 py-0 text-left shadow-none ring-0 focus:ring-0 focus:ring-offset-0 data-placeholder:text-gray-400 [&>svg]:h-4 [&>svg]:w-4 [&>svg]:text-gray-400 [&>svg]:transition-transform [&>svg]:duration-200 data-open:[&_svg]:rotate-180">
                <div className="flex w-full items-center gap-3">
                  <IndianRupee className="hidden size-5 shrink-0 text-primary lg:block" />
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      Budget
                    </span>
                    <SelectValue className="block truncate text-sm font-semibold text-gray-800">
                      <span className="truncate">
                        {selectedBudget ? selectedBudget.label : "Any budget"}
                      </span>
                    </SelectValue>
                  </div>
                </div>
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
          {/* Search keyword */}
         
            <div className="flex min-w-0 flex-1 flex-col rounded-full hover:bg-primary/5">
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && search()}
                placeholder="Search by brand, model…"
                className="h-14 w-full rounded-full border-0 bg-transparent px-4 text-sm font-semibold text-gray-800 shadow-none outline-none ring-0 placeholder:font-normal placeholder:text-gray-400 focus-visible:border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>


          {/* Search button */}
          <Button
            onClick={search}
            size="icon"
            className="mt-2 ml-1 h-14 w-14 shrink-0 self-end rounded-full bg-primary shadow-md shadow-primary/30 hover:bg-primary/90 lg:mt-0">
            <Search className="size-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default SearchBox;
