"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { HotelCard } from "@/components/hotel-card";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal, ChevronLeft, ChevronRight } from "lucide-react";

interface HotelSnippet {
  hotel_id: string;
  name: string;
  location: {
    country_name: string;
    settlement: { type: string; name: string };
    address: string;
    lon: number;
    lat: number;
  };
  stars?: number;
  rating?: string;
  total_review_count?: number;
  images?: { url_template: string; sizes: { size: string }[] }[];
  top_offers: {
    name?: string;
    price: { value: number; currency: string };
    meal_type?: { id: string; name: string };
    cancellation?: { refund_type: string };
    discount?: { strikethrough_price?: number; percent?: number };
  }[];
}

interface SearchData {
  complete: boolean;
  hotel_snippets: HotelSnippet[];
  next_page_token?: string;
}

export default function SearchPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [data, setData] = useState<SearchData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [orderBy, setOrderBy] = useState(searchParams.get("order_by") ?? "relevance-desc");
  const [stars, setStars] = useState(searchParams.get("stars") ?? "");
  const [mealType, setMealType] = useState(searchParams.get("meal_type") ?? "");
  const [minRating, setMinRating] = useState(searchParams.get("min_rating") ?? "");
  const [showFilters, setShowFilters] = useState(false);

  const geoId = searchParams.get("geo_id");
  const checkin = searchParams.get("checkin_date");
  const checkout = searchParams.get("checkout_date");
  const adults = searchParams.get("adults") ?? "2";
  const childrenAges = searchParams.get("children_ages") ?? "";
  const pageToken = searchParams.get("page_token") ?? "";

  useEffect(() => {
    if (!geoId || !checkin || !checkout) {
      router.push("/");
      return;
    }

    setLoading(true);
    setError(null);

    const params = new URLSearchParams({
      geo_id: geoId,
      checkin_date: checkin,
      checkout_date: checkout,
      adults,
      order_by: orderBy,
    });
    if (childrenAges) params.set("children_ages", childrenAges);
    if (pageToken) params.set("page_token", pageToken);
    if (stars) params.set("stars", stars);
    if (mealType) params.set("meal_type", mealType);
    if (minRating) params.set("min_rating", minRating);

    fetch(`/api/search?${params}`)
      .then((res) => {
        if (!res.ok) throw new Error("Ошибка поиска");
        return res.json();
      })
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, [geoId, checkin, checkout, adults, childrenAges, pageToken, orderBy, stars, mealType, minRating, router]);

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page_token");
    router.push(`/search?${params}`);
  }

  function goToPage(token: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (token) {
      params.set("page_token", token);
    } else {
      params.delete("page_token");
    }
    router.push(`/search?${params}`);
    window.scrollTo(0, 0);
  }

  const cityName = data?.hotel_snippets?.[0]?.location?.settlement?.name ?? "";

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          {cityName ? `Отели в ${cityName}` : "Результаты поиска"}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {checkin} — {checkout} · {adults} {parseInt(adults) === 1 ? "гость" : "гостя"}
          {childrenAges ? `, дети: ${childrenAges.split(",").length}` : ""}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
          <SlidersHorizontal className="h-4 w-4 mr-1" />
          Фильтры
        </Button>
        <select
          value={orderBy}
          onChange={(e) => updateFilter("order_by", e.target.value)}
          className="text-sm border rounded-lg px-3 py-1.5 bg-background"
        >
          <option value="relevance-desc">По популярности</option>
          <option value="price-asc">Сначала дешёвые</option>
          <option value="price-desc">Сначала дорогие</option>
          <option value="rating-desc">По рейтингу</option>
        </select>
      </div>

      {showFilters && (
        <div className="bg-card border rounded-xl p-4 mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="text-xs font-medium mb-1 block">Звёзды</label>
            <select
              value={stars}
              onChange={(e) => updateFilter("stars", e.target.value)}
              className="w-full text-sm border rounded-lg px-3 py-1.5 bg-background"
            >
              <option value="">Все</option>
              <option value="3|4|5">3-5 звёзд</option>
              <option value="4|5">4-5 звёзд</option>
              <option value="5">5 звёзд</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block">Питание</label>
            <select
              value={mealType}
              onChange={(e) => updateFilter("meal_type", e.target.value)}
              className="w-full text-sm border rounded-lg px-3 py-1.5 bg-background"
            >
              <option value="">Любое</option>
              <option value="RO">Без питания</option>
              <option value="BB">Завтрак</option>
              <option value="HB">Полупансион</option>
              <option value="FB">Полное питание</option>
              <option value="AI">Всё включено</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block">Мин. рейтинг</label>
            <select
              value={minRating}
              onChange={(e) => updateFilter("min_rating", e.target.value)}
              className="w-full text-sm border rounded-lg px-3 py-1.5 bg-background"
            >
              <option value="">Любой</option>
              <option value="3">3.0+</option>
              <option value="4">4.0+</option>
              <option value="4.5">4.5+</option>
            </select>
          </div>
          <div className="flex items-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const params = new URLSearchParams(searchParams.toString());
                params.delete("stars");
                params.delete("meal_type");
                params.delete("min_rating");
                params.delete("page_token");
                router.push(`/search?${params}`);
              }}
            >
              Сбросить
            </Button>
          </div>
        </div>
      )}

      {loading && (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-card border rounded-xl h-48 animate-pulse" />
          ))}
        </div>
      )}

      {error && (
        <div className="text-center py-12">
          <p className="text-destructive">{error}</p>
          <Button variant="outline" className="mt-4" onClick={() => router.push("/")}>
            На главную
          </Button>
        </div>
      )}

      {data && !loading && (
        <>
          <div className="space-y-4">
            {data.hotel_snippets.map((hotel) => {
              const offer = hotel.top_offers?.[0];
              const image = hotel.images?.[0];
              return (
                <HotelCard
                  key={hotel.hotel_id}
                  hotelId={hotel.hotel_id}
                  name={hotel.name}
                  stars={hotel.stars}
                  rating={hotel.rating}
                  reviewCount={hotel.total_review_count}
                  city={hotel.location?.settlement?.name}
                  address={hotel.location?.address}
                  imageUrl={image?.url_template}
                  price={offer?.price?.value}
                  currency={offer?.price?.currency}
                  mealType={offer?.meal_type?.name}
                  discount={offer?.discount}
                  freeCancellation={offer?.cancellation?.refund_type === "FULLY_REFUNDABLE"}
                />
              );
            })}
          </div>

          {data.hotel_snippets.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              По вашему запросу отелей не найдено. Попробуйте изменить параметры поиска.
            </div>
          )}

          <div className="flex items-center justify-between mt-8">
            <Button variant="outline" disabled={!pageToken} onClick={() => goToPage("")}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Начало
            </Button>
            <div className="text-sm text-muted-foreground">
              {data.hotel_snippets.length} отелей
              {!data.complete && " (показана часть)"}
            </div>
            {!data.complete && data.next_page_token && (
              <Button variant="outline" onClick={() => goToPage(data.next_page_token!)}>
                Далее
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
