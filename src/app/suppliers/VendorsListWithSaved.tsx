"use client";

import SavedVendorsProvider from "../../features/vendors/components/SavedVendorsProvider";
import VirtualizedVendorsList from "./VirtualizedVendorsList";
import type { VendorListItem } from "../../features/vendors/types";

type SortKey = "alpha" | "rating" | "newest" | "saves" | "views" | "verified";

interface Props {
  initialVendors: VendorListItem[];
  initialPage: number;
  hasMore: boolean;
  limit: number;
  total: number;
  sort: SortKey;
  query: {
    q: string;
    category: string;
    location: string;
    region: string;
    affiliation: string;
    theme: string;
  };
}

export default function VendorsListWithSaved(props: Props) {
  return (
    <SavedVendorsProvider>
      <VirtualizedVendorsList {...props} />
    </SavedVendorsProvider>
  );
}
