import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Star, MapPin, ArrowLeft } from "lucide-react";

async function getHotel(id: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/hotel/${id}`, { next: { revalidate: 60 } });
  if (!res.ok) return null;
  return res.json();
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("ru-RU").format(price);
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const hotel = await getHotel(id);
  if (!hotel) return { title: "Отель не найден" };
  return {
    title: hotel.name,
    description: hotel.description?.slice(0, 160) || `Бронирование отеля ${hotel.name}`,
  };
}

export default async function HotelPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const hotel = await getHotel(id);
  if (!hotel) notFound();

  const refundType = hotel.reviews?.length > 0 ? null : null;

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-4 w-4 mr-1" />
        Назад
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">{hotel.name}</h1>
          {hotel.location && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
              <MapPin className="h-4 w-4" />
              <span>
                {hotel.location.settlement?.name}, {hotel.location.address}
              </span>
            </div>
          )}
          {hotel.stars && (
            <div className="flex gap-0.5 mt-2">
              {Array.from({ length: hotel.stars }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
          )}
        </div>
        {hotel.rating && (
          <div className="flex items-center gap-2">
            <div className="bg-green-600 text-white text-lg font-bold px-3 py-1.5 rounded-lg">
              {hotel.rating}
            </div>
            {hotel.total_review_count !== undefined && (
              <span className="text-sm text-muted-foreground">{hotel.total_review_count} отзывов</span>
            )}
          </div>
        )}
      </div>

      {/* Gallery */}
      {hotel.images?.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-8">
          {hotel.images.slice(0, 8).map((img: { url_template: string; sizes: { size: string }[] }, i: number) => {
            const url = img.url_template.replace("%s", "XXXL");
            return (
              <div key={i} className="relative aspect-[4/3] rounded-lg overflow-hidden bg-muted">
                <Image
                  src={url}
                  alt={`${hotel.name} фото ${i + 1}`}
                  fill
                  className="object-cover hover:scale-105 transition-transform"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              </div>
            );
          })}
        </div>
      )}

      {/* Description */}
      {hotel.description && (
        <div className="prose max-w-none mb-8">
          <h2>Описание</h2>
          <p className="text-muted-foreground whitespace-pre-line">{hotel.description}</p>
        </div>
      )}

      {/* Amenities */}
      {hotel.amenities?.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-3">Удобства</h2>
          <div className="flex flex-wrap gap-2">
            {hotel.amenities.map((a: string, i: number) => (
              <span key={i} className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm">
                {a}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Reviews */}
      {hotel.reviews?.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-3">Отзывы</h2>
          <div className="space-y-4">
            {hotel.reviews.slice(0, 10).map((review: { author?: string; rating?: number; text?: string; date?: string; pros?: string; cons?: string }, i: number) => (
              <div key={i} className="bg-card border rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{review.author || "Аноним"}</span>
                  {review.rating && (
                    <span className="bg-green-600 text-white text-xs font-bold px-2 py-0.5 rounded">
                      {review.rating}
                    </span>
                  )}
                </div>
                {review.text && <p className="text-sm text-muted-foreground">{review.text}</p>}
                {review.pros && (
                  <p className="text-sm mt-1">
                    <span className="text-green-600 font-medium">Плюсы:</span> {review.pros}
                  </p>
                )}
                {review.cons && (
                  <p className="text-sm mt-1">
                    <span className="text-red-600 font-medium">Минусы:</span> {review.cons}
                  </p>
                )}
                {review.date && (
                  <p className="text-xs text-muted-foreground mt-2">{review.date}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="bg-card border rounded-xl p-6 text-center">
        <h2 className="text-lg font-semibold mb-2">Забронировать этот отель</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Перейдите на Яндекс Путешествия для завершения бронирования
        </p>
        <Link
          href={`https://travel.yandex.ru/hotels/?hotel_id=${hotel.hotel_id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
        >
          Забронировать на Яндекс Путешествиях
        </Link>
      </div>
    </div>
  );
}
