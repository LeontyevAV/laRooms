const BASE_URL = "https://whitelabel.travel.yandex-net.ru";

function getToken(): string {
  const token = process.env.YANDEX_TRAVEL_OAUTH_TOKEN;
  if (!token) throw new Error("YANDEX_TRAVEL_OAUTH_TOKEN is not set");
  return token;
}

function getClid(): string | undefined {
  return process.env.YANDEX_TRAVEL_AFFILIATE_CLID;
}

async function request<T>(path: string, params: Record<string, string | number | undefined> = {}): Promise<T> {
  const url = new URL(path, BASE_URL);
  const clid = getClid();
  if (clid) params.affiliate_clid = clid;

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) url.searchParams.set(key, String(value));
  }

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `OAuth ${getToken()}`,
      "Content-Type": "application/json",
    },
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    throw new Error(`Yandex Travel API error: ${res.status} ${res.statusText}`);
  }

  return res.json() as Promise<T>;
}

// --- Types ---

export interface SuggestRegion {
  geo_id: number;
  type: string;
  name: string;
  description: string;
}

export interface SuggestHotel {
  hotel_id: string;
  name: string;
  description: string;
}

export interface SuggestResponse {
  regions?: SuggestRegion[];
  hotels?: SuggestHotel[];
}

export interface SearchResult {
  complete: boolean;
  hotel_snippets: HotelSnippet[];
  next_page_token?: string;
  bbox?: {
    lower_left: { lat: number; lon: number };
    upper_right: { lat: number; lon: number };
  };
}

export interface HotelSnippet {
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
  total_image_count?: number;
  images?: HotelImage[];
  top_offers: TopOffer[];
  landing_url?: string;
}

export interface HotelImage {
  url_template: string;
  sizes: { size: string; height: number; width: number }[];
}

export interface TopOffer {
  name?: string;
  price: { value: number; currency: string };
  meal_type?: { id: string; name: string };
  cancellation?: {
    refund_type: string;
    refund_rules?: {
      type: string;
      penalty?: { value: number; currency: string } | null;
      starts_at?: string | null;
      ends_at?: string | null;
    }[];
  };
  discount?: {
    strikethrough_price?: number;
    percent?: number;
    reason?: string;
  };
  is_corporate?: boolean;
}

export interface HotelDetail {
  hotel_id: string;
  name: string;
  location: HotelSnippet["location"];
  stars?: number;
  rating?: string;
  total_review_count?: number;
  description?: string;
  amenities?: string[];
  images?: HotelImage[];
}

export interface HotelOffer {
  offer_id: string;
  name: string;
  price: { value: number; currency: string };
  meal_type?: { id: string; name: string };
  cancellation?: TopOffer["cancellation"];
  discount?: TopOffer["discount"];
}

export interface HotelOffersResponse {
  offers: HotelOffer[];
}

export interface HotelReview {
  author?: string;
  rating?: number;
  text?: string;
  date?: string;
  pros?: string;
  cons?: string;
}

// --- API Methods ---

export async function suggest(query: string, regionLimit = 5, hotelLimit = 10): Promise<SuggestResponse> {
  return request<SuggestResponse>("/hotels/suggest/", {
    query,
    region_limit: regionLimit,
    hotel_limit: hotelLimit,
  });
}

export interface SearchParams {
  geo_id?: number;
  bbox?: string;
  checkin_date: string;
  checkout_date: string;
  adults: number;
  children_ages?: string;
  order_by?: string;
  page_limit?: number;
  page_token?: string;
  images_limit?: number;
  min_price?: number;
  max_price?: number;
  meal_type?: string;
  stars?: string;
  nearby_sea?: boolean;
  nearby_park?: boolean;
  nearby_airport?: boolean;
  wi_fi?: boolean;
  air_conditioning?: boolean;
  pool?: boolean;
  car_park?: boolean;
  spa?: boolean;
  pets?: boolean;
  sauna?: boolean;
  bathhouse?: boolean;
  restaurant?: boolean;
  cafe?: boolean;
  gym?: boolean;
  transfer?: boolean;
  min_rating?: string;
  accomm_type?: string;
  free_cancellation?: boolean;
}

export async function searchHotels(params: SearchParams): Promise<SearchResult> {
  const apiParams: Record<string, string | number | undefined> = {
    geo_id: params.geo_id,
    bbox: params.bbox,
    checkin_date: params.checkin_date,
    checkout_date: params.checkout_date,
    adults: params.adults,
    children_ages: params.children_ages,
    order_by: params.order_by,
    page_limit: params.page_limit ?? 25,
    page_token: params.page_token,
    images_limit: params.images_limit ?? 3,
    min_price: params.min_price,
    max_price: params.max_price,
    meal_type: params.meal_type,
    stars: params.stars,
    min_rating: params.min_rating,
    accomm_type: params.accomm_type,
  };

  if (params.nearby_sea) apiParams.nearby_sea = 1;
  if (params.nearby_park) apiParams.nearby_park = 1;
  if (params.nearby_airport) apiParams.nearby_airport = 1;
  if (params.wi_fi) apiParams.wi_fi = 1;
  if (params.air_conditioning) apiParams.air_conditioning = 1;
  if (params.pool) apiParams.pool = 1;
  if (params.car_park) apiParams.car_park = 1;
  if (params.spa) apiParams.spa = 1;
  if (params.pets) apiParams.pets = 1;
  if (params.sauna) apiParams.sauna = 1;
  if (params.bathhouse) apiParams.bathhouse = 1;
  if (params.restaurant) apiParams.restaurant = 1;
  if (params.cafe) apiParams.cafe = 1;
  if (params.gym) apiParams.gym = 1;
  if (params.transfer) apiParams.transfer = 1;
  if (params.free_cancellation) apiParams.free_cancellation = 1;

  return request<SearchResult>("/hotels/search/", apiParams);
}

export async function getHotel(hotelId: string): Promise<HotelDetail> {
  return request<HotelDetail>("/hotels/hotel/", { hotel_id: hotelId });
}

export async function getHotelImages(hotelId: string): Promise<{ images: HotelImage[] }> {
  return request<{ images: HotelImage[] }>("/hotels/hotel/images/", { hotel_id: hotelId });
}

export async function getHotelOffers(
  hotelId: string,
  checkin: string,
  checkout: string,
  adults: number,
  childrenAges?: string
): Promise<HotelOffersResponse> {
  return request<HotelOffersResponse>("/hotels/hotel/offers/", {
    hotel_id: hotelId,
    checkin_date: checkin,
    checkout_date: checkout,
    adults,
    children_ages: childrenAges,
  });
}

export async function getHotelReviews(hotelId: string): Promise<{ reviews: HotelReview[] }> {
  return request<{ reviews: HotelReview[] }>("/hotels/hotel/reviews/", { hotel_id: hotelId });
}
