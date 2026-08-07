"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Calendar, Users } from "lucide-react";

interface SuggestRegion {
  geo_id: number;
  type: string;
  name: string;
  description: string;
}

interface SuggestHotel {
  hotel_id: string;
  name: string;
  description: string;
}

interface SuggestResult {
  regions?: SuggestRegion[];
  hotels?: SuggestHotel[];
}

export function SearchForm() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SuggestResult>({});
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedGeoId, setSelectedGeoId] = useState<number | null>(null);
  const [selectedName, setSelectedName] = useState("");
  const [checkin, setCheckin] = useState("");
  const [checkout, setCheckout] = useState("");
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.length < 2) {
      setSuggestions({});
      return;
    }
    try {
      const res = await fetch(`/api/suggest?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setSuggestions(data);
      setShowSuggestions(true);
    } catch {
      setSuggestions({});
    }
  }, []);

  function handleQueryChange(value: string) {
    setQuery(value);
    setSelectedGeoId(null);
    setSelectedName("");
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(value), 300);
  }

  function selectRegion(region: SuggestRegion) {
    setQuery(region.name);
    setSelectedGeoId(region.geo_id);
    setSelectedName(region.name);
    setShowSuggestions(false);
  }

  function selectHotel(hotel: SuggestHotel) {
    router.push(`/hotels/${hotel.hotel_id}`);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedGeoId || !checkin || !checkout) return;

    setLoading(true);
    const childrenParam = children > 0 ? `&children_ages=${Array(children).fill(5).join(",")}` : "";
    router.push(
      `/search?geo_id=${selectedGeoId}&checkin_date=${checkin}&checkout_date=${checkout}&adults=${adults}${childrenParam}`
    );
  }

  const today = new Date().toISOString().split("T")[0];

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-4xl mx-auto">
      <div className="bg-card rounded-xl border p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* City / Hotel search */}
          <div className="lg:col-span-2 relative" ref={wrapperRef}>
            <label className="text-sm font-medium mb-1 block">Куда едем?</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={query}
                onChange={(e) => handleQueryChange(e.target.value)}
                onFocus={() => query.length >= 2 && setShowSuggestions(true)}
                placeholder="Город или название отеля"
                className="w-full pl-9 pr-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            {showSuggestions && (suggestions.regions?.length || suggestions.hotels?.length) ? (
              <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-card border rounded-lg shadow-lg max-h-80 overflow-auto">
                {suggestions.regions?.map((r) => (
                  <button
                    key={r.geo_id}
                    type="button"
                    onClick={() => selectRegion(r)}
                    className="w-full px-4 py-2.5 text-left hover:bg-accent flex items-center gap-2 text-sm"
                  >
                    <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div>
                      <span className="font-medium">{r.name}</span>
                      <span className="text-muted-foreground ml-1">— {r.description}</span>
                    </div>
                  </button>
                ))}
                {suggestions.hotels?.map((h) => (
                  <button
                    key={h.hotel_id}
                    type="button"
                    onClick={() => selectHotel(h)}
                    className="w-full px-4 py-2.5 text-left hover:bg-accent flex items-center gap-2 text-sm"
                  >
                    <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div>
                      <span className="font-medium">{h.name}</span>
                      <span className="text-muted-foreground ml-1 block text-xs">{h.description}</span>
                    </div>
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          {/* Dates */}
          <div>
            <label className="text-sm font-medium mb-1 block">Даты</label>
            <div className="grid grid-cols-2 gap-2">
              <div className="relative">
                <Calendar className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  type="date"
                  value={checkin}
                  onChange={(e) => setCheckin(e.target.value)}
                  min={today}
                  className="w-full pl-7 pr-1 py-2 rounded-lg border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="relative">
                <Calendar className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  type="date"
                  value={checkout}
                  onChange={(e) => setCheckout(e.target.value)}
                  min={checkin || today}
                  className="w-full pl-7 pr-1 py-2 rounded-lg border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
          </div>

          {/* Guests */}
          <div>
            <label className="text-sm font-medium mb-1 block">Гости</label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <select
                value={`${adults},${children}`}
                onChange={(e) => {
                  const [a, c] = e.target.value.split(",").map(Number);
                  setAdults(a);
                  setChildren(c);
                }}
                className="w-full pl-9 pr-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring appearance-none"
              >
                <option value="1,0">1 взрослый</option>
                <option value="2,0">2 взрослых</option>
                <option value="2,1">2 взрослых, 1 ребёнок</option>
                <option value="2,2">2 взрослых, 2 ребёнка</option>
                <option value="3,0">3 взрослых</option>
                <option value="3,1">3 взрослых, 1 ребёнок</option>
                <option value="4,0">4 взрослых</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <Button type="submit" size="lg" disabled={!selectedGeoId || !checkin || !checkout || loading}>
            <Search className="h-4 w-4 mr-2" />
            {loading ? "Поиск..." : "Найти отели"}
          </Button>
        </div>
      </div>
    </form>
  );
}
