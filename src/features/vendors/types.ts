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

export type Affiliation = {
  id: number;
  name: string;
  slug: string;
};

export type VendorListItem = {
  id: number;
  business_name: string;
  slug: string;
  logo_url?: string | null;
  average_rating: number | null;
  review_count: number | null;
  city: string | null;
  province: { name: string } | null;
  city_rel: { name: string } | null;
  document_verified?: string | null;
  cover_image_url?: string | null;
  cover_focus_x?: number | null;
  cover_focus_y?: number | null;
  cover_zoom?: number | null;
  card_cover_focus_x?: number | null;
  portrait_cover_focus_x?: number | null;
  portrait_cover_focus_y?: number | null;
  portrait_cover_zoom?: number | null;
  card_cover_focus_y?: number | null;
  card_cover_zoom?: number | null;
  plan?: { id: number; name: string } | { id: number; name: string }[] | null;
  year_established?: string | number | null;
};

export type FeaturedVendor = VendorListItem & {
  affiliations?: Affiliation[];
};

export type VendorCardVendor = VendorListItem;
