import { NextRequest } from "next/server";
import { getHotelOffers } from "@/lib/yandex-travel";
import { searchCache, hashSearchParams } from "@/lib/cache";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const sp = request.nextUrl.searchParams;

  const checkin = sp.get("checkin_date");
  const checkout = sp.get("checkout_date");
  const adults = sp.get("adults");

  if (!checkin || !checkout || !adults) {
    return Response.json({ error: "checkin_date, checkout_date, adults are required" }, { status: 400 });
  }

  const cacheKey = `offers:${hashSearchParams({ id, checkin, checkout, adults })}`;
  const cached = searchCache.get(cacheKey);
  if (cached) return Response.json(cached);

  try {
    const data = await getHotelOffers(
      id,
      checkin,
      checkout,
      parseInt(adults),
      sp.get("children_ages") ?? undefined
    );
    searchCache.set(cacheKey, data);
    return Response.json(data);
  } catch (e) {
    console.error("Offers error:", e);
    return Response.json({ error: "Failed to fetch offers" }, { status: 502 });
  }
}
