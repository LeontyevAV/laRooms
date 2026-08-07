import { NextRequest } from "next/server";
import { getHotel, getHotelImages, getHotelReviews } from "@/lib/yandex-travel";
import { hotelCache } from "@/lib/cache";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const cacheKey = `hotel:${id}`;
  const cached = hotelCache.get(cacheKey);
  if (cached) return Response.json(cached);

  try {
    const [hotel, imagesData, reviewsData] = await Promise.all([
      getHotel(id),
      getHotelImages(id).catch(() => ({ images: [] })),
      getHotelReviews(id).catch(() => ({ reviews: [] })),
    ]);

    const result = { ...hotel, images: imagesData.images, reviews: reviewsData.reviews };
    hotelCache.set(cacheKey, result);
    return Response.json(result);
  } catch (e) {
    console.error("Hotel detail error:", e);
    return Response.json({ error: "Failed to fetch hotel" }, { status: 502 });
  }
}
