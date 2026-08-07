import { NextRequest } from "next/server";
import { searchHotels, type SearchParams } from "@/lib/yandex-travel";
import { searchCache, hashSearchParams } from "@/lib/cache";

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;

  const geoId = sp.get("geo_id");
  if (!geoId) {
    return Response.json({ error: "geo_id is required" }, { status: 400 });
  }

  const checkin = sp.get("checkin_date");
  const checkout = sp.get("checkout_date");
  const adults = sp.get("adults");
  if (!checkin || !checkout || !adults) {
    return Response.json({ error: "checkin_date, checkout_date, adults are required" }, { status: 400 });
  }

  const params: SearchParams = {
    geo_id: parseInt(geoId),
    checkin_date: checkin,
    checkout_date: checkout,
    adults: parseInt(adults),
    children_ages: sp.get("children_ages") ?? undefined,
    order_by: sp.get("order_by") ?? undefined,
    page_limit: sp.get("page_limit") ? parseInt(sp.get("page_limit")!) : 25,
    page_token: sp.get("page_token") ?? undefined,
    images_limit: 3,
    min_price: sp.get("min_price") ? parseInt(sp.get("min_price")!) : undefined,
    max_price: sp.get("max_price") ? parseInt(sp.get("max_price")!) : undefined,
    meal_type: sp.get("meal_type") ?? undefined,
    stars: sp.get("stars") ?? undefined,
    min_rating: sp.get("min_rating") ?? undefined,
    accomm_type: sp.get("accomm_type") ?? undefined,
    nearby_sea: sp.get("nearby_sea") === "1",
    wi_fi: sp.get("wi_fi") === "1",
    pool: sp.get("pool") === "1",
    spa: sp.get("spa") === "1",
    free_cancellation: sp.get("free_cancellation") === "1",
  };

  const cacheKey = `search:${hashSearchParams(params as unknown as Record<string, string | number | boolean>)}`;
  const cached = searchCache.get(cacheKey);
  if (cached) return Response.json(cached);

  try {
    const data = await searchHotels(params);
    searchCache.set(cacheKey, data);
    return Response.json(data);
  } catch (e) {
    console.error("Search error:", e);
    return Response.json({ error: "Failed to search hotels" }, { status: 502 });
  }
}
