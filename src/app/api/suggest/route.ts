import { NextRequest } from "next/server";
import { suggest, type SuggestResponse } from "@/lib/yandex-travel";
import { suggestCache } from "@/lib/cache";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q");
  if (!query || query.length < 2) {
    return Response.json({ regions: [], hotels: [] } satisfies SuggestResponse);
  }

  const cacheKey = `suggest:${query.toLowerCase().trim()}`;
  const cached = suggestCache.get<SuggestResponse>(cacheKey);
  if (cached) return Response.json(cached);

  try {
    const data = await suggest(query, 5, 10);
    suggestCache.set(cacheKey, data);
    return Response.json(data);
  } catch (e) {
    console.error("Suggest error:", e);
    return Response.json({ regions: [], hotels: [] } satisfies SuggestResponse);
  }
}
