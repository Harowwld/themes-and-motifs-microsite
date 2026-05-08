"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowser";

interface SavedVendorsContextType {
  savedVendorIds: Set<number>;
  isLoading: boolean;
  refreshSavedVendors: () => Promise<void>;
  toggleSavedVendor: (vendorId: number, isSaved: boolean) => void;
}

const SavedVendorsContext = createContext<SavedVendorsContextType | undefined>(undefined);

export function useSavedVendors() {
  const context = useContext(SavedVendorsContext);
  if (context === undefined) {
    throw new Error("useSavedVendors must be used within a SavedVendorsProvider");
  }
  return context;
}

interface SavedVendorsProviderProps {
  children: ReactNode;
}

export default function SavedVendorsProvider({ children }: SavedVendorsProviderProps) {
  const [savedVendorIds, setSavedVendorIds] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  const fetchSavedVendors = async () => {
    const supabase = createSupabaseBrowserClient();
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token ?? "";

    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/saved-vendors", {
        headers: { authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch saved vendors");
      }

      const data = await res.json();
      const ids = new Set<number>(
        (data.savedVendors ?? []).map((sv: { vendor: { id: number } }) => sv.vendor?.id).filter((id: number | undefined): id is number => typeof id === "number")
      );
      setSavedVendorIds(ids);
    } catch (error) {
      console.error("Error fetching saved vendors:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSavedVendor = (vendorId: number, isSaved: boolean) => {
    setSavedVendorIds((prev) => {
      const next = new Set(prev);
      if (isSaved) {
        next.add(vendorId);
      } else {
        next.delete(vendorId);
      }
      return next;
    });
  };

  useEffect(() => {
    fetchSavedVendors();
  }, []);

  return (
    <SavedVendorsContext.Provider
      value={{
        savedVendorIds,
        isLoading,
        refreshSavedVendors: fetchSavedVendors,
        toggleSavedVendor,
      }}
    >
      {children}
    </SavedVendorsContext.Provider>
  );
}
