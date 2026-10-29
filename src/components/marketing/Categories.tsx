import { Link } from 'react-router-dom';
import { Car, Bike, Bus, Truck, Caravan, ListTodoIcon } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { VEHICLE_CATEGORIES } from '@/constants/vehicleEnums';

const CATEGORY_ICONS: Record<string, typeof Car> = {
  PASSENGER_CAR: Car,
  TWO_WHEELER: Bike,
  THREE_WHEELER: Bus,
  COMMERCIAL: Truck,
  CARAVAN_MOTORHOME: Caravan,
};

export function Categories() {
  return (
    <section id="categories" className="mx-auto max-w-7xl min-h-[500px] rounded-3xl bg-gradient-to-r from-blue-800 to-blue-500 px-4 py-12 sm:px-6 lg:px-8">
     <span className="inline-flex items-center gap-1.5 rounded-full  border border-slate-300/70 bg-white px-3 py-1 text-xs font-bold text-slate-700">
              <ListTodoIcon className="h-3.5 w-3.5 text-blue-500 " /> Categories
            </span>
      <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {VEHICLE_CATEGORIES.map((c) => {
          const Icon = CATEGORY_ICONS[c.value] || Car;
          return (
            <Link
              key={c.value}
              to={`${ROUTES.vehicles}?category=${c.value}`}
              className="group flex flex-col items-center gap-2 rounded-xl border bg-card p-5 text-center transition-colors hover:border-primary hover:bg-primary/5"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Icon className="h-6 w-6" />
              </span>
              <span className="text-sm font-medium">{c.label}</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export default Categories;
