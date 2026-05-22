export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      affiliations: {
        Row: {
          badge_icon: string | null
          created_at: string
          description: string | null
          id: number
          name: string
          slug: string
        }
        Insert: {
          badge_icon?: string | null
          created_at?: string
          description?: string | null
          id?: number
          name: string
          slug: string
        }
        Update: {
          badge_icon?: string | null
          created_at?: string
          description?: string | null
          id?: number
          name?: string
          slug?: string
        }
        Relationships: []
      }
      album_photos: {
        Row: {
          album_id: number
          caption: string | null
          created_at: string
          display_order: number | null
          id: number
          photo_url: string
        }
        Insert: {
          album_id: number
          caption?: string | null
          created_at?: string
          display_order?: number | null
          id?: number
          photo_url: string
        }
        Update: {
          album_id?: number
          caption?: string | null
          created_at?: string
          display_order?: number | null
          id?: number
          photo_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "album_photos_album_id_fkey"
            columns: ["album_id"]
            isOneToOne: false
            referencedRelation: "soon_to_wed_albums"
            referencedColumns: ["id"]
          },
        ]
      }
      bridal_fairs: {
        Row: {
          created_at: string
          description: string | null
          end_date: string | null
          id: number
          image_url: string | null
          is_active: boolean | null
          is_featured: boolean | null
          registration_url: string | null
          slug: string
          start_date: string
          title: string
          updated_at: string
          venue: string
          venue_address: string | null
          venue_map_url: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: number
          image_url?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          registration_url?: string | null
          slug: string
          start_date: string
          title: string
          updated_at?: string
          venue: string
          venue_address?: string | null
          venue_map_url?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: number
          image_url?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          registration_url?: string | null
          slug?: string
          start_date?: string
          title?: string
          updated_at?: string
          venue?: string
          venue_address?: string | null
          venue_map_url?: string | null
        }
        Relationships: []
      }
      bug_comments: {
        Row: {
          comment: string
          created_at: string
          id: number
          name: string | null
        }
        Insert: {
          comment: string
          created_at?: string
          id?: number
          name?: string | null
        }
        Update: {
          comment?: string
          created_at?: string
          id?: number
          name?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          display_order: number | null
          icon: string | null
          id: number
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: number
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: number
          name?: string
          slug?: string
        }
        Relationships: []
      }
      cities: {
        Row: {
          created_at: string
          id: number
          name: string
          region_id: number
        }
        Insert: {
          created_at?: string
          id?: number
          name: string
          region_id: number
        }
        Update: {
          created_at?: string
          id?: number
          name?: string
          region_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "cities_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      editors: {
        Row: {
          can_edit_entries: boolean | null
          can_edit_photos: boolean | null
          created_at: string | null
          id: string
          status: string
          updated_at: string | null
          user_id: string
          vendor_id: number | null
        }
        Insert: {
          can_edit_entries?: boolean | null
          can_edit_photos?: boolean | null
          created_at?: string | null
          id?: string
          status?: string
          updated_at?: string | null
          user_id: string
          vendor_id?: number | null
        }
        Update: {
          can_edit_entries?: boolean | null
          can_edit_photos?: boolean | null
          created_at?: string | null
          id?: string
          status?: string
          updated_at?: string | null
          user_id?: string
          vendor_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "editors_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendor_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "editors_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      fair_registrations: {
        Row: {
          created_at: string
          email: string
          fair_id: number
          id: number
          name: string
          notes: string | null
          phone: string | null
          user_id: string | null
          wedding_date: string | null
        }
        Insert: {
          created_at?: string
          email: string
          fair_id: number
          id?: number
          name: string
          notes?: string | null
          phone?: string | null
          user_id?: string | null
          wedding_date?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          fair_id?: number
          id?: number
          name?: string
          notes?: string | null
          phone?: string | null
          user_id?: string | null
          wedding_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fair_registrations_fair_id_fkey"
            columns: ["fair_id"]
            isOneToOne: false
            referencedRelation: "bridal_fairs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fair_registrations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      inquiries: {
        Row: {
          created_at: string
          email: string | null
          id: number
          message: string
          name: string | null
          phone: string | null
          status: string | null
          updated_at: string
          user_id: string | null
          vendor_id: number
          wedding_date: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: number
          message: string
          name?: string | null
          phone?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string | null
          vendor_id: number
          wedding_date?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: number
          message?: string
          name?: string | null
          phone?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string | null
          vendor_id?: number
          wedding_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inquiries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inquiries_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendor_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inquiries_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      moment_photos: {
        Row: {
          caption: string | null
          created_at: string | null
          id: string
          image_url: string
          moment_id: string | null
          upload_order: number | null
        }
        Insert: {
          caption?: string | null
          created_at?: string | null
          id?: string
          image_url: string
          moment_id?: string | null
          upload_order?: number | null
        }
        Update: {
          caption?: string | null
          created_at?: string | null
          id?: string
          image_url?: string
          moment_id?: string | null
          upload_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "moment_photos_moment_id_fkey"
            columns: ["moment_id"]
            isOneToOne: false
            referencedRelation: "wedding_moments"
            referencedColumns: ["id"]
          },
        ]
      }
      plans: {
        Row: {
          created_at: string
          description: string | null
          features: Json | null
          id: number
          name: string
          price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          features?: Json | null
          id?: number
          name: string
          price?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          features?: Json | null
          id?: number
          name?: string
          price?: number
          updated_at?: string
        }
        Relationships: []
      }
      promos: {
        Row: {
          created_at: string
          discount_percentage: number | null
          id: number
          image_focus_x: number | null
          image_focus_y: number | null
          image_url: string | null
          image_zoom: number | null
          is_active: boolean | null
          is_featured: boolean | null
          save_count: number | null
          summary: string | null
          terms: string | null
          title: string
          updated_at: string
          valid_from: string | null
          valid_to: string | null
          vendor_id: number
        }
        Insert: {
          created_at?: string
          discount_percentage?: number | null
          id?: number
          image_focus_x?: number | null
          image_focus_y?: number | null
          image_url?: string | null
          image_zoom?: number | null
          is_active?: boolean | null
          is_featured?: boolean | null
          save_count?: number | null
          summary?: string | null
          terms?: string | null
          title: string
          updated_at?: string
          valid_from?: string | null
          valid_to?: string | null
          vendor_id: number
        }
        Update: {
          created_at?: string
          discount_percentage?: number | null
          id?: number
          image_focus_x?: number | null
          image_focus_y?: number | null
          image_url?: string | null
          image_zoom?: number | null
          is_active?: boolean | null
          is_featured?: boolean | null
          save_count?: number | null
          summary?: string | null
          terms?: string | null
          title?: string
          updated_at?: string
          valid_from?: string | null
          valid_to?: string | null
          vendor_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "promos_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendor_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promos_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      regions: {
        Row: {
          created_at: string
          id: number
          name: string
          parent_id: number | null
        }
        Insert: {
          created_at?: string
          id?: number
          name: string
          parent_id?: number | null
        }
        Update: {
          created_at?: string
          id?: number
          name?: string
          parent_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "regions_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          created_at: string
          helpful_count: number | null
          id: number
          rating: number
          review_text: string | null
          status: string | null
          updated_at: string
          user_id: string
          vendor_id: number
          vendor_reply_at: string | null
          vendor_reply_text: string | null
        }
        Insert: {
          created_at?: string
          helpful_count?: number | null
          id?: number
          rating: number
          review_text?: string | null
          status?: string | null
          updated_at?: string
          user_id: string
          vendor_id: number
          vendor_reply_at?: string | null
          vendor_reply_text?: string | null
        }
        Update: {
          created_at?: string
          helpful_count?: number | null
          id?: number
          rating?: number
          review_text?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string
          vendor_id?: number
          vendor_reply_at?: string | null
          vendor_reply_text?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendor_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_promos: {
        Row: {
          created_at: string
          promo_id: number
          user_id: string
        }
        Insert: {
          created_at?: string
          promo_id: number
          user_id: string
        }
        Update: {
          created_at?: string
          promo_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_promos_promo_id_fkey"
            columns: ["promo_id"]
            isOneToOne: false
            referencedRelation: "active_promos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_promos_promo_id_fkey"
            columns: ["promo_id"]
            isOneToOne: false
            referencedRelation: "promos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_promos_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_vendors: {
        Row: {
          created_at: string
          user_id: string
          vendor_id: number
        }
        Insert: {
          created_at?: string
          user_id: string
          vendor_id: number
        }
        Update: {
          created_at?: string
          user_id?: string
          vendor_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "saved_vendors_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_vendors_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendor_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_vendors_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      soon_to_wed_albums: {
        Row: {
          created_at: string
          id: number
          title: string | null
          user_id: string
          visibility: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          title?: string | null
          user_id: string
          visibility?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          title?: string | null
          user_id?: string
          visibility?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "soon_to_wed_albums_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      soon_to_wed_guests: {
        Row: {
          created_at: string
          dietary_preferences: string | null
          email: string | null
          id: string
          meal_choice: string | null
          name: string
          phone: string | null
          plus_one_count: number | null
          relationship: string | null
          rsvp_status: string
          table_number: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          dietary_preferences?: string | null
          email?: string | null
          id?: string
          meal_choice?: string | null
          name: string
          phone?: string | null
          plus_one_count?: number | null
          relationship?: string | null
          rsvp_status?: string
          table_number?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          dietary_preferences?: string | null
          email?: string | null
          id?: string
          meal_choice?: string | null
          name?: string
          phone?: string | null
          plus_one_count?: number | null
          relationship?: string | null
          rsvp_status?: string
          table_number?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "soon_to_wed_guests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      soon_to_wed_profiles: {
        Row: {
          bride_nickname: string | null
          budget_range: string | null
          created_at: string
          groom_nickname: string | null
          is_premium: boolean | null
          location: string | null
          notes: string | null
          plan_type: string
          profile_photo_url: string | null
          profile_visibility: string | null
          updated_at: string
          user_id: string
          wedding_date: string | null
          wedding_date_public: boolean | null
          wedding_style: string | null
          wedding_venue_area: string | null
          wedding_venue_public: boolean | null
        }
        Insert: {
          bride_nickname?: string | null
          budget_range?: string | null
          created_at?: string
          groom_nickname?: string | null
          is_premium?: boolean | null
          location?: string | null
          notes?: string | null
          plan_type?: string
          profile_photo_url?: string | null
          profile_visibility?: string | null
          updated_at?: string
          user_id: string
          wedding_date?: string | null
          wedding_date_public?: boolean | null
          wedding_style?: string | null
          wedding_venue_area?: string | null
          wedding_venue_public?: boolean | null
        }
        Update: {
          bride_nickname?: string | null
          budget_range?: string | null
          created_at?: string
          groom_nickname?: string | null
          is_premium?: boolean | null
          location?: string | null
          notes?: string | null
          plan_type?: string
          profile_photo_url?: string | null
          profile_visibility?: string | null
          updated_at?: string
          user_id?: string
          wedding_date?: string | null
          wedding_date_public?: boolean | null
          wedding_style?: string | null
          wedding_venue_area?: string | null
          wedding_venue_public?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "soon_to_wed_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      superadmin_invitations: {
        Row: {
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          expires_at: string
          id?: string
          invited_by: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          token?: string
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "superadmin_invitations_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "superadmins"
            referencedColumns: ["id"]
          },
        ]
      }
      superadmin_sessions: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          superadmin_id: string
          token: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          superadmin_id: string
          token: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          superadmin_id?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "superadmin_sessions_superadmin_id_fkey"
            columns: ["superadmin_id"]
            isOneToOne: false
            referencedRelation: "superadmins"
            referencedColumns: ["id"]
          },
        ]
      }
      superadmins: {
        Row: {
          auth_user_id: string | null
          created_at: string
          id: string
          is_active: boolean
          password_hash: string
          updated_at: string
          username: string
        }
        Insert: {
          auth_user_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          password_hash: string
          updated_at?: string
          username: string
        }
        Update: {
          auth_user_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          password_hash?: string
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          created_at: string
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          created_at?: string
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          created_at?: string
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      themes: {
        Row: {
          created_at: string | null
          description: string | null
          id: number
          name: string
          slug: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: number
          name: string
          slug: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: number
          name?: string
          slug?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string
          email: string
          email_verified: boolean | null
          id: string
          is_active: boolean | null
          last_login_at: string | null
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          email_verified?: boolean | null
          id: string
          is_active?: boolean | null
          last_login_at?: string | null
          role: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          email_verified?: boolean | null
          id?: string
          is_active?: boolean | null
          last_login_at?: string | null
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      vendor_affiliations: {
        Row: {
          affiliation_id: number
          awarded_at: string | null
          vendor_id: number
        }
        Insert: {
          affiliation_id: number
          awarded_at?: string | null
          vendor_id: number
        }
        Update: {
          affiliation_id?: number
          awarded_at?: string | null
          vendor_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "vendor_affiliations_affiliation_id_fkey"
            columns: ["affiliation_id"]
            isOneToOne: false
            referencedRelation: "affiliations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_affiliations_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendor_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_affiliations_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_album_photos: {
        Row: {
          album_id: number
          created_at: string
          display_order: number
          id: number
          image_url: string
          vendor_id: number
        }
        Insert: {
          album_id: number
          created_at?: string
          display_order?: number
          id?: number
          image_url: string
          vendor_id: number
        }
        Update: {
          album_id?: number
          created_at?: string
          display_order?: number
          id?: number
          image_url?: string
          vendor_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "vendor_album_photos_album_id_fkey"
            columns: ["album_id"]
            isOneToOne: false
            referencedRelation: "vendor_albums"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_album_photos_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendor_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_album_photos_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_albums: {
        Row: {
          created_at: string
          id: number
          slug: string
          title: string
          vendor_id: number
        }
        Insert: {
          created_at?: string
          id?: number
          slug: string
          title: string
          vendor_id: number
        }
        Update: {
          created_at?: string
          id?: number
          slug?: string
          title?: string
          vendor_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "vendor_albums_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendor_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_albums_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_categories: {
        Row: {
          category_id: number
          is_primary: boolean | null
          vendor_id: number
        }
        Insert: {
          category_id: number
          is_primary?: boolean | null
          vendor_id: number
        }
        Update: {
          category_id?: number
          is_primary?: boolean | null
          vendor_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "vendor_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_categories_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendor_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_categories_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_claims: {
        Row: {
          admin_notes: string | null
          business_name: string | null
          contact_email: string
          contact_phone: string | null
          created_at: string
          documents: Json | null
          full_name: string | null
          id: number
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
          user_id: string | null
          vendor_id: number
        }
        Insert: {
          admin_notes?: string | null
          business_name?: string | null
          contact_email: string
          contact_phone?: string | null
          created_at?: string
          documents?: Json | null
          full_name?: string | null
          id?: number
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
          vendor_id: number
        }
        Update: {
          admin_notes?: string | null
          business_name?: string | null
          contact_email?: string
          contact_phone?: string | null
          created_at?: string
          documents?: Json | null
          full_name?: string | null
          id?: number
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
          vendor_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "vendor_claims_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_claims_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendor_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_claims_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_images: {
        Row: {
          caption: string | null
          created_at: string
          display_order: number | null
          focus_x: number | null
          focus_y: number | null
          id: number
          image_url: string
          is_cover: boolean | null
          media_type: string | null
          vendor_id: number
          zoom: number | null
        }
        Insert: {
          caption?: string | null
          created_at?: string
          display_order?: number | null
          focus_x?: number | null
          focus_y?: number | null
          id?: number
          image_url: string
          is_cover?: boolean | null
          media_type?: string | null
          vendor_id: number
          zoom?: number | null
        }
        Update: {
          caption?: string | null
          created_at?: string
          display_order?: number | null
          focus_x?: number | null
          focus_y?: number | null
          id?: number
          image_url?: string
          is_cover?: boolean | null
          media_type?: string | null
          vendor_id?: number
          zoom?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "vendor_images_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendor_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_images_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_registrations: {
        Row: {
          admin_notes: string | null
          business_name: string
          category_id: number | null
          contact_email: string
          contact_phone: string | null
          created_at: string
          description: string | null
          document_verified: string | null
          extra: Json | null
          id: number
          location: string | null
          plan_id: number | null
          reviewed_at: string | null
          reviewed_by: string | null
          sec_dti_number: string | null
          status: string | null
          submitted_by_user_id: string | null
          tin: string | null
          updated_at: string
          website_url: string | null
          year_established: string | null
        }
        Insert: {
          admin_notes?: string | null
          business_name: string
          category_id?: number | null
          contact_email: string
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          document_verified?: string | null
          extra?: Json | null
          id?: number
          location?: string | null
          plan_id?: number | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          sec_dti_number?: string | null
          status?: string | null
          submitted_by_user_id?: string | null
          tin?: string | null
          updated_at?: string
          website_url?: string | null
          year_established?: string | null
        }
        Update: {
          admin_notes?: string | null
          business_name?: string
          category_id?: number | null
          contact_email?: string
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          document_verified?: string | null
          extra?: Json | null
          id?: number
          location?: string | null
          plan_id?: number | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          sec_dti_number?: string | null
          status?: string | null
          submitted_by_user_id?: string | null
          tin?: string | null
          updated_at?: string
          website_url?: string | null
          year_established?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendor_registrations_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_registrations_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_registrations_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_registrations_submitted_by_user_id_fkey"
            columns: ["submitted_by_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_reviews: {
        Row: {
          communication_rating: number
          created_at: string | null
          id: string
          moment_id: string
          overall_rating: number
          quality_rating: number
          review_text: string | null
          updated_at: string | null
          value_rating: number
          vendor_id: number
          would_recommend: boolean
        }
        Insert: {
          communication_rating: number
          created_at?: string | null
          id?: string
          moment_id: string
          overall_rating: number
          quality_rating: number
          review_text?: string | null
          updated_at?: string | null
          value_rating: number
          vendor_id: number
          would_recommend?: boolean
        }
        Update: {
          communication_rating?: number
          created_at?: string | null
          id?: string
          moment_id?: string
          overall_rating?: number
          quality_rating?: number
          review_text?: string | null
          updated_at?: string | null
          value_rating?: number
          vendor_id?: number
          would_recommend?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "vendor_reviews_moment_id_fkey"
            columns: ["moment_id"]
            isOneToOne: false
            referencedRelation: "wedding_moments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_reviews_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendor_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_reviews_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_social_links: {
        Row: {
          created_at: string
          id: number
          platform: string
          url: string
          vendor_id: number
        }
        Insert: {
          created_at?: string
          id?: number
          platform: string
          url: string
          vendor_id: number
        }
        Update: {
          created_at?: string
          id?: number
          platform?: string
          url?: string
          vendor_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "vendor_social_links_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendor_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_social_links_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_subscriptions: {
        Row: {
          created_at: string
          dti_doc_url: string | null
          expiry_date: string | null
          id: number
          plan_id: number | null
          sec_doc_url: string | null
          status: string
          tin: string | null
          updated_at: string
          vendor_id: number
          verification_doc_url: string | null
        }
        Insert: {
          created_at?: string
          dti_doc_url?: string | null
          expiry_date?: string | null
          id?: number
          plan_id?: number | null
          sec_doc_url?: string | null
          status?: string
          tin?: string | null
          updated_at?: string
          vendor_id: number
          verification_doc_url?: string | null
        }
        Update: {
          created_at?: string
          dti_doc_url?: string | null
          expiry_date?: string | null
          id?: number
          plan_id?: number | null
          sec_doc_url?: string | null
          status?: string
          tin?: string | null
          updated_at?: string
          vendor_id?: number
          verification_doc_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendor_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_subscriptions_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendor_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_subscriptions_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_themes: {
        Row: {
          created_at: string | null
          id: number
          theme_id: number
          vendor_id: number
        }
        Insert: {
          created_at?: string | null
          id?: number
          theme_id: number
          vendor_id: number
        }
        Update: {
          created_at?: string | null
          id?: number
          theme_id?: number
          vendor_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "vendor_themes_theme_id_fkey"
            columns: ["theme_id"]
            isOneToOne: false
            referencedRelation: "themes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_themes_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendor_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_themes_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_videos: {
        Row: {
          created_at: string | null
          display_order: number | null
          id: number
          title: string | null
          vendor_id: number | null
          video_url: string
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          id?: number
          title?: string | null
          vendor_id?: number | null
          video_url: string
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          id?: number
          title?: string | null
          vendor_id?: number | null
          video_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_videos_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendor_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_videos_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendors: {
        Row: {
          address: string | null
          admin_email_1: string | null
          admin_email_2: string | null
          admin_email_3: string | null
          admin_phone_1: string | null
          admin_phone_2: string | null
          admin_phone_3: string | null
          average_rating: number | null
          business_name: string
          city: string | null
          click_count: number | null
          contact_email: string | null
          contact_person_1_name: string | null
          contact_person_1_position: string | null
          contact_person_2_name: string | null
          contact_person_2_position: string | null
          contact_phone: string | null
          cover_focus_x: number | null
          cover_focus_y: number | null
          cover_zoom: number | null
          created_at: string
          description: string | null
          document_verified: string
          id: number
          inquiry_count: number | null
          is_active: boolean | null
          is_featured: boolean | null
          latitude: number | null
          location_text: string | null
          logo_url: string | null
          longitude: number | null
          map_url: string | null
          plan_id: number | null
          price_range: string | null
          region_id: number | null
          review_count: number | null
          save_count: number | null
          sec_dti_number: string | null
          slug: string
          starting_price: number | null
          tin: string | null
          updated_at: string
          user_id: string | null
          view_count: number | null
          website_url: string | null
          year_established: string | null
        }
        Insert: {
          address?: string | null
          admin_email_1?: string | null
          admin_email_2?: string | null
          admin_email_3?: string | null
          admin_phone_1?: string | null
          admin_phone_2?: string | null
          admin_phone_3?: string | null
          average_rating?: number | null
          business_name: string
          city?: string | null
          click_count?: number | null
          contact_email?: string | null
          contact_person_1_name?: string | null
          contact_person_1_position?: string | null
          contact_person_2_name?: string | null
          contact_person_2_position?: string | null
          contact_phone?: string | null
          cover_focus_x?: number | null
          cover_focus_y?: number | null
          cover_zoom?: number | null
          created_at?: string
          description?: string | null
          document_verified?: string
          id?: number
          inquiry_count?: number | null
          is_active?: boolean | null
          is_featured?: boolean | null
          latitude?: number | null
          location_text?: string | null
          logo_url?: string | null
          longitude?: number | null
          map_url?: string | null
          plan_id?: number | null
          price_range?: string | null
          region_id?: number | null
          review_count?: number | null
          save_count?: number | null
          sec_dti_number?: string | null
          slug: string
          starting_price?: number | null
          tin?: string | null
          updated_at?: string
          user_id?: string | null
          view_count?: number | null
          website_url?: string | null
          year_established?: string | null
        }
        Update: {
          address?: string | null
          admin_email_1?: string | null
          admin_email_2?: string | null
          admin_email_3?: string | null
          admin_phone_1?: string | null
          admin_phone_2?: string | null
          admin_phone_3?: string | null
          average_rating?: number | null
          business_name?: string
          city?: string | null
          click_count?: number | null
          contact_email?: string | null
          contact_person_1_name?: string | null
          contact_person_1_position?: string | null
          contact_person_2_name?: string | null
          contact_person_2_position?: string | null
          contact_phone?: string | null
          cover_focus_x?: number | null
          cover_focus_y?: number | null
          cover_zoom?: number | null
          created_at?: string
          description?: string | null
          document_verified?: string
          id?: number
          inquiry_count?: number | null
          is_active?: boolean | null
          is_featured?: boolean | null
          latitude?: number | null
          location_text?: string | null
          logo_url?: string | null
          longitude?: number | null
          map_url?: string | null
          plan_id?: number | null
          price_range?: string | null
          region_id?: number | null
          review_count?: number | null
          save_count?: number | null
          sec_dti_number?: string | null
          slug?: string
          starting_price?: number | null
          tin?: string | null
          updated_at?: string
          user_id?: string | null
          view_count?: number | null
          website_url?: string | null
          year_established?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendors_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendors_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendors_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      verification_documents: {
        Row: {
          doc_type: string
          file_name: string | null
          file_url: string
          id: number
          notes: string | null
          registration_id: number | null
          reviewed_at: string | null
          status: string | null
          uploaded_at: string
          vendor_id: number | null
        }
        Insert: {
          doc_type: string
          file_name?: string | null
          file_url: string
          id?: number
          notes?: string | null
          registration_id?: number | null
          reviewed_at?: string | null
          status?: string | null
          uploaded_at?: string
          vendor_id?: number | null
        }
        Update: {
          doc_type?: string
          file_name?: string | null
          file_url?: string
          id?: number
          notes?: string | null
          registration_id?: number | null
          reviewed_at?: string | null
          status?: string | null
          uploaded_at?: string
          vendor_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "verification_documents_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "vendor_registrations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "verification_documents_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendor_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "verification_documents_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      wedding_budgets: {
        Row: {
          actual: number
          category: string
          created_at: string | null
          estimated: number
          id: string
          name: string
          notes: string | null
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          actual?: number
          category: string
          created_at?: string | null
          estimated?: number
          id?: string
          name: string
          notes?: string | null
          status: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          actual?: number
          category?: string
          created_at?: string | null
          estimated?: number
          id?: string
          name?: string
          notes?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      wedding_dream_suppliers: {
        Row: {
          category: string
          contact: string | null
          created_at: string | null
          id: string
          name: string
          notes: string | null
          rating: number
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category: string
          contact?: string | null
          created_at?: string | null
          id?: string
          name: string
          notes?: string | null
          rating?: number
          status: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string
          contact?: string | null
          created_at?: string | null
          id?: string
          name?: string
          notes?: string | null
          rating?: number
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      wedding_guests: {
        Row: {
          category: string
          created_at: string | null
          dietary: string | null
          email: string
          id: string
          name: string
          phone: string
          rsvp_status: string
          table_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string | null
          dietary?: string | null
          email: string
          id?: string
          name: string
          phone: string
          rsvp_status: string
          table_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string | null
          dietary?: string | null
          email?: string
          id?: string
          name?: string
          phone?: string
          rsvp_status?: string
          table_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wedding_guests_table_id_fkey"
            columns: ["table_id"]
            isOneToOne: false
            referencedRelation: "wedding_tables"
            referencedColumns: ["id"]
          },
        ]
      }
      wedding_journal: {
        Row: {
          content: string
          created_at: string | null
          date: string
          entry_type: string
          id: string
          mood: string
          rating: number | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          date?: string
          entry_type: string
          id?: string
          mood: string
          rating?: number | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          date?: string
          entry_type?: string
          id?: string
          mood?: string
          rating?: number | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      wedding_moments: {
        Row: {
          content: string | null
          created_at: string | null
          id: string
          moment_type: string
          title: string
          updated_at: string | null
          user_id: string
          visibility: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          id?: string
          moment_type: string
          title: string
          updated_at?: string | null
          user_id: string
          visibility?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          id?: string
          moment_type?: string
          title?: string
          updated_at?: string | null
          user_id?: string
          visibility?: string | null
        }
        Relationships: []
      }
      wedding_notes: {
        Row: {
          content: string
          created_at: string | null
          date: string
          id: string
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          date?: string
          id?: string
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          date?: string
          id?: string
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      wedding_tables: {
        Row: {
          capacity: number
          created_at: string | null
          id: string
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          capacity?: number
          created_at?: string | null
          id?: string
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          capacity?: number
          created_at?: string | null
          id?: string
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      wedding_tasks: {
        Row: {
          category: string
          created_at: string | null
          due_date: string
          id: string
          status: string
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string | null
          due_date: string
          id?: string
          status: string
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string | null
          due_date?: string
          id?: string
          status?: string
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      active_promos: {
        Row: {
          created_at: string | null
          discount_percentage: number | null
          id: number | null
          image_url: string | null
          is_active: boolean | null
          is_featured: boolean | null
          save_count: number | null
          summary: string | null
          terms: string | null
          title: string | null
          updated_at: string | null
          valid_from: string | null
          valid_to: string | null
          vendor_id: number | null
          vendor_name: string | null
          vendor_slug: string | null
        }
        Relationships: [
          {
            foreignKeyName: "promos_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendor_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promos_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_details: {
        Row: {
          average_rating: number | null
          business_name: string | null
          contact_email: string | null
          contact_phone: string | null
          description: string | null
          document_verified: string | null
          id: number | null
          is_featured: boolean | null
          location_text: string | null
          owner_email: string | null
          plan_name: string | null
          review_count: number | null
          save_count: number | null
          slug: string | null
          starting_price: number | null
          view_count: number | null
          website_url: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      cleanup_expired_free_stw_accounts: { Args: never; Returns: undefined }
      decrement_save_count: { Args: { vendor_id: number }; Returns: undefined }
      get_orphan_images: {
        Args: { p_bucket_id: string }
        Returns: {
          object_name: string
        }[]
      }
      get_stw_accounts_entering_grace_period: {
        Args: never
        Returns: {
          bride_nickname: string
          email: string
          groom_nickname: string
          user_id: string
          wedding_date: string
        }[]
      }
      get_superadmin_by_auth_user_id: {
        Args: { p_auth_user_id: string }
        Returns: {
          auth_user_id: string
          created_at: string
          id: string
          is_active: boolean
          username: string
        }[]
      }
      get_user_vendor_role: {
        Args: { p_user_id: string }
        Returns: {
          role: string
          vendor_id: number
        }[]
      }
      increment_save_count: { Args: { vendor_id: number }; Returns: undefined }
      is_admin: { Args: never; Returns: boolean }
      is_current_user_superadmin: { Args: never; Returns: boolean }
      is_editor: { Args: never; Returns: boolean }
      is_supplier: { Args: never; Returns: boolean }
      owns_vendor: { Args: { vendor_id_input: number }; Returns: boolean }
      search_vendors: {
        Args: {
          p_affiliation_slug?: string
          p_category_slug?: string
          p_from?: number
          p_location?: string
          p_q?: string
          p_region_id?: number
          p_sort?: string
          p_theme_slug?: string
          p_to?: number
        }
        Returns: {
          average_rating: number
          business_name: string
          city: string
          cover_focus_x: number
          cover_focus_y: number
          cover_image_url: string
          cover_zoom: number
          document_verified: string
          id: number
          location_text: string
          logo_url: string
          plan: Json
          review_count: number
          save_count: number
          slug: string
          total_count: number
          updated_at: string
          view_count: number
        }[]
      }
      superadmin_change_password: {
        Args: { p_new_password: string; p_superadmin_id: string }
        Returns: undefined
      }
      superadmin_login: {
        Args: { p_password: string; p_username: string }
        Returns: string
      }
      superadmin_verify_password: {
        Args: { p_password: string; p_superadmin_id: string }
        Returns: boolean
      }
      user_role: { Args: never; Returns: string }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
