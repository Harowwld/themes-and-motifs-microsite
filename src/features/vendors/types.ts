export type VendorCoverImageRow = {
  vendor_id: number;
  image_url: string;
  is_cover: boolean | null;
  display_order: number | null;
};

export type VendorWithCover = {
  id: number;
  cover_image_url?: string | null;
};

export type VendorListItem = {
  id: number;
  business_name: string;
  slug: string;
  logo_url?: string | null;
  average_rating: number | null;
  review_count: number | null;
  location_text: string | null;
  city: string | null;
  cover_image_url?: string | null;
};

export type FeaturedVendor = VendorListItem;

export type VendorCardVendor = VendorListItem;
