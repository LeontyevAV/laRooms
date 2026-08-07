import "dotenv/config";
import { db } from "./index";
import { cities, collections } from "./schema";

const CITIES_DATA = [
  { slug: "moscow", name: "Москва", geoId: 213, country: "Россия" },
  { slug: "saint-petersburg", name: "Санкт-Петербург", geoId: 2, country: "Россия" },
  { slug: "sochi", name: "Сочи", geoId: 239, country: "Россия" },
  { slug: "kazan", name: "Казань", geoId: 43, country: "Россия" },
  { slug: "ekaterinburg", name: "Екатеринбург", geoId: 54, country: "Россия" },
  { slug: "novosibirsk", name: "Новосибирск", geoId: 65, country: "Россия" },
  { slug: "krasnodar", name: "Краснодар", geoId: 53, country: "Россия" },
  { slug: "kalinigrad", name: "Калининград", geoId: 46, country: "Россия" },
  { slug: "crimea", name: "Крым", geoId: 14, country: "Россия" },
  { slug: "altai", name: "Алтай", geoId: 42, country: "Россия" },
];

const COLLECTIONS_DATA = [
  {
    slug: "cheapest",
    title: "Самые дешёвые отели",
    description: "Бюджетные варианты размещения",
    filters: { order_by: "price-asc" },
  },
  {
    slug: "best-rated",
    title: "Лучшие отели по рейтингу",
    description: "Отели с высоким рейтингом",
    filters: { order_by: "rating-desc", min_rating: "4.5" },
  },
  {
    slug: "with-pool",
    title: "Отели с бассейном",
    description: "Отели с бассейном для отдыха всей семьёй",
    filters: { pool: true },
  },
  {
    slug: "all-inclusive",
    title: "Всё включено",
    description: "Отели с системой всё включено",
    filters: { meal_type: "AI" },
  },
  {
    slug: "spa",
    title: "Отели с SPA",
    description: "Отели с SPA-комплексами",
    filters: { spa: true },
  },
  {
    slug: "near-sea",
    title: "Отели у моря",
    description: "Отели в непосредственной близости от моря",
    filters: { nearby_sea: true },
  },
  {
    slug: "family",
    title: "Для семьи с детьми",
    description: "Отели, подходящие для семейного отдыха",
    filters: { pets: false },
  },
  {
    slug: "free-cancellation",
    title: "С бесплатной отменой",
    description: "Отели с возможностью бесплатной отмены брони",
    filters: { free_cancellation: true },
  },
];

async function seed() {
  console.log("Seeding cities...");
  for (const city of CITIES_DATA) {
    await db
      .insert(cities)
      .values({
        id: `city-${city.slug}`,
        ...city,
        isActive: true,
        sortOrder: CITIES_DATA.indexOf(city),
      })
      .onConflictDoNothing({ target: cities.slug });
  }
  console.log(`Seeded ${CITIES_DATA.length} cities`);

  console.log("Seeding collections...");
  for (const collection of COLLECTIONS_DATA) {
    await db
      .insert(collections)
      .values({
        id: `col-${collection.slug}`,
        ...collection,
        isActive: true,
        sortOrder: COLLECTIONS_DATA.indexOf(collection),
      })
      .onConflictDoNothing({ target: collections.slug });
  }
  console.log(`Seeded ${COLLECTIONS_DATA.length} collections`);

  console.log("Seed completed!");
}

seed().catch((e) => {
  console.error("Seed failed:", e);
  process.exit(1);
});
