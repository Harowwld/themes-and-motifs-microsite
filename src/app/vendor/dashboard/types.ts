export type VendorProfile = {
  id: number;
  user_id: string;
  business_name: string;
  slug: string;
  logo_url?: string | null;
  description: string | null;
  location_text: string | null;
  city: string | null;
  address: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  website_url: string | null;
  cover_focus_x?: number | null;
  cover_focus_y?: number | null;
  cover_zoom?: number | null;
  card_cover_focus_x?: number | null;
  portrait_cover_focus_x?: number | null;
  portrait_cover_focus_y?: number | null;
  portrait_cover_zoom?: number | null;
  card_cover_focus_y?: number | null;
  card_cover_zoom?: number | null;
  contact_person_1_name?: string | null;
  contact_person_1_position?: string | null;
  contact_person_2_name?: string | null;
  contact_person_2_position?: string | null;
  admin_email_1?: string | null;
  admin_email_2?: string | null;
  admin_email_3?: string | null;
  admin_phone_1?: string | null;
  admin_phone_2?: string | null;
  admin_phone_3?: string | null;
  plan_id: number | null;
  is_active: boolean | null;
  document_verified: string | null;
  average_rating?: number | null;
  review_count?: number | null;
  view_count?: number | null;
  save_count?: number | null;
  click_count?: number | null;
  inquiry_count?: number | null;
  plan?: { id: number; name: string } | { id: number; name: string }[] | null;
  year_established?: string | null;
};

export type SocialLink = { id: number; platform: string; url: string };

export type VendorImage = {
  id?: number;
  image_url: string;
  caption: string | null;
  is_cover: boolean | null;
  display_order: number | null;
  media_type?: 'image' | 'video';
  theme_id?: number | null;
};

export type Theme = { id: number; name: string; slug: string };
export type Category = { id: number; name: string; slug: string };

export type VendorVideo = { id: number; video_url: string; title: string | null; display_order: number };

export type VendorPromo = {
  id: number;
  vendor_id: number;
  title: string;
  summary: string | null;
  terms: string | null;
  valid_from: string | null;
  valid_to: string | null;
  is_active: boolean | null;
  image_url: string | null;
  discount_percentage: number | null;
  image_focus_x: number | null;
  image_focus_y: number | null;
  image_zoom: number | null;
  updated_at: string;
};

export type MarketplaceItem = {
  id: number;
  vendor_id: number;
  title: string;
  summary: string | null;
  price: number;
  price_text: string | null;
  is_active: boolean | null;
  image_url: string | null;
  image_focus_x: number | null;
  image_focus_y: number | null;
  image_zoom: number | null;
  updated_at: string;
};

export type Inquiry = {
  id: number;
  vendor_id: number;
  user_id: string | null;
  name: string | null;
  email: string | null;
  phone: string | null;
  wedding_date: string | null;
  message: string;
  status: "new" | "read" | "replied" | "archived" | string;
  created_at: string;
  updated_at: string;
};

export const SOCIAL_PLATFORM_OPTIONS = ["facebook", "instagram", "tiktok", "x", "pinterest", "youtube", "website", "linkedin", "other"] as const;
export type SocialPlatformOption = (typeof SOCIAL_PLATFORM_OPTIONS)[number] | "other";

export type Album = {
  id: number;
  title: string;
  slug: string;
  photo_count: number;
  created_at: string;
};

export type AlbumPhoto = {
  id: number;
  image_url: string;
  display_order: number;
};

export type Review = {
  id: number;
  vendor_id: number;
  user_id: string;
  rating: number;
  review_text: string | null;
  status: string | null;
  helpful_count: number | null;
  created_at: string;
  updated_at: string;
  vendor_reply_text: string | null;
  vendor_reply_at: string | null;
  users?: {
    email: string;
  }[] | null;
};

