import {
  pgTable,
  text,
  timestamp,
  integer,
  boolean,
  jsonb,
  index,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  yandexId: text("yandex_id").unique(),
  name: text("name").notNull(),
  email: text("email").unique(),
  avatar: text("avatar"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const favorites = pgTable(
  "favorites",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    hotelId: text("hotel_id").notNull(),
    hotelName: text("hotel_name").notNull(),
    hotelImage: text("hotel_image"),
    city: text("city"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("favorites_user_id_idx").on(table.userId)]
);

export const orders = pgTable(
  "orders",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    yandexOrderId: text("yandex_order_id").unique(),
    hotelId: text("hotel_id").notNull(),
    hotelName: text("hotel_name").notNull(),
    status: text("status").notNull().default("pending"),
    checkinDate: text("checkin_date").notNull(),
    checkoutDate: text("checkout_date").notNull(),
    adults: integer("adults").notNull(),
    childrenAges: jsonb("children_ages").$type<number[]>(),
    totalPrice: integer("total_price"),
    currency: text("currency").default("RUB"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [index("orders_user_id_idx").on(table.userId)]
);

export const searchQueries = pgTable(
  "search_queries",
  {
    id: text("id").primaryKey(),
    query: text("query").notNull(),
    geoId: integer("geo_id"),
    cityName: text("city_name"),
    userId: text("user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("search_queries_city_idx").on(table.cityName)]
);

export const cities = pgTable(
  "cities",
  {
    id: text("id").primaryKey(),
    slug: text("slug").unique().notNull(),
    name: text("name").notNull(),
    geoId: integer("geo_id").notNull(),
    country: text("country"),
    imageUrl: text("image_url"),
    isActive: boolean("is_active").default(true).notNull(),
    sortOrder: integer("sort_order").default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("cities_slug_idx").on(table.slug)]
);

export const collections = pgTable(
  "collections",
  {
    id: text("id").primaryKey(),
    slug: text("slug").unique().notNull(),
    title: text("title").notNull(),
    description: text("description"),
    citySlug: text("city_slug"),
    filters: jsonb("filters").$type<Record<string, unknown>>(),
    isActive: boolean("is_active").default(true).notNull(),
    sortOrder: integer("sort_order").default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("collections_slug_idx").on(table.slug)]
);

export const articles = pgTable(
  "articles",
  {
    id: text("id").primaryKey(),
    slug: text("slug").unique().notNull(),
    title: text("title").notNull(),
    description: text("description"),
    content: text("content").notNull(),
    imageUrl: text("image_url"),
    isPublished: boolean("is_published").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [index("articles_slug_idx").on(table.slug)]
);
