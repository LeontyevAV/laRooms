import Image from "next/image";
import Link from "next/link";
import { Star, MapPin } from "lucide-react";

interface HotelCardProps {
  hotelId: string;
  name: string;
  stars?: number;
  rating?: string;
  reviewCount?: number;
  city?: string;
  address?: string;
  imageUrl?: string;
  price?: number;
  currency?: string;
  mealType?: string;
  discount?: {
    strikethrough_price?: number;
    percent?: number;
  };
  freeCancellation?: boolean;
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("ru-RU").format(price);
}

function getRatingColor(rating: string): string {
  const r = parseFloat(rating);
  if (r >= 4.5) return "bg-green-600";
  if (r >= 4.0) return "bg-green-500";
  if (r >= 3.5) return "bg-yellow-500";
  return "bg-orange-500";
}

export function HotelCard({
  hotelId,
  name,
  stars,
  rating,
  reviewCount,
  city,
  address,
  imageUrl,
  price,
  currency = "RUB",
  mealType,
  discount,
  freeCancellation,
}: HotelCardProps) {
  const imageUrlProcessed = imageUrl?.replace("%s", "XXXL");

  return (
    <Link
      href={`/hotels/${hotelId}`}
      className="group block bg-card rounded-xl border overflow-hidden hover:shadow-md transition-shadow"
    >
      <div className="flex flex-col sm:flex-row">
        {/* Image */}
        <div className="relative w-full sm:w-64 h-48 sm:h-auto shrink-0 bg-muted">
          {imageUrlProcessed ? (
            <Image
              src={imageUrlProcessed}
              alt={name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 100vw, 256px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
              Нет фото
            </div>
          )}
          {rating && (
            <div className={`absolute top-3 left-3 ${getRatingColor(rating)} text-white text-xs font-bold px-2 py-1 rounded`}>
              {rating}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-base group-hover:text-primary transition-colors line-clamp-1">
                {name}
              </h3>
              {stars && (
                <div className="flex gap-0.5 shrink-0">
                  {Array.from({ length: stars }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              )}
            </div>
            {(city || address) && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                <span className="line-clamp-1">{city || address}</span>
              </div>
            )}
            {reviewCount !== undefined && (
              <p className="text-xs text-muted-foreground mt-1">{reviewCount} отзывов</p>
            )}
          </div>

          <div className="flex items-end justify-between mt-3 gap-2">
            <div className="text-xs text-muted-foreground">
              {mealType && <span className="inline-block bg-secondary px-2 py-0.5 rounded">{mealType}</span>}
              {freeCancellation && (
                <span className="inline-block bg-green-50 text-green-700 px-2 py-0.5 rounded ml-1">Бесплатная отмена</span>
              )}
            </div>
            {price !== undefined && (
              <div className="text-right shrink-0">
                {discount?.strikethrough_price && (
                  <div className="text-xs text-muted-foreground line-through">
                    {formatPrice(discount.strikethrough_price)} ₽
                  </div>
                )}
                <div className="text-lg font-bold">{formatPrice(price)} ₽</div>
                <div className="text-xs text-muted-foreground">за ночь</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
