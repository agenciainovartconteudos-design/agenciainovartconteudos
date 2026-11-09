export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: { id: string; full_name: string | null; email: string | null; avatar_url: string | null; created_at: string };
        Insert: { id: string; full_name?: string | null; email?: string | null; avatar_url?: string | null; created_at?: string };
        Update: { id?: string; full_name?: string | null; email?: string | null; avatar_url?: string | null; created_at?: string };
      };
      user_roles: {
        Row: { id: string; user_id: string; role: "admin" | "editor" };
        Insert: { id?: string; user_id: string; role: "admin" | "editor" };
        Update: { id?: string; user_id?: string; role?: "admin" | "editor" };
      };
      clients: {
        Row: {
          id: string; owner_id: string; name: string; niche: string | null;
          contact_name: string | null; contact_email: string | null; contact_phone: string | null;
          brand_primary_color: string | null; brand_secondary_color: string | null; logo_url: string | null;
          strategy: string | null; status: string; approval_token: string; created_at: string; updated_at: string;
        };
        Insert: {
          id?: string; owner_id: string; name: string; niche?: string | null;
          contact_name?: string | null; contact_email?: string | null; contact_phone?: string | null;
          brand_primary_color?: string | null; brand_secondary_color?: string | null; logo_url?: string | null;
          strategy?: string | null; status?: string; approval_token?: string; created_at?: string; updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["clients"]["Insert"]>;
      };
      design_assets: {
        Row: {
          id: string; client_id: string; owner_id: string; title: string; format: string; stage: string;
          canvas_data: Json; thumbnail_url: string | null; file_url: string | null; source: string;
          caption: string | null; scheduled_at: string | null; created_at: string; updated_at: string;
        };
        Insert: {
          id?: string; client_id: string; owner_id: string; title: string; format?: string; stage?: string;
          canvas_data?: Json; thumbnail_url?: string | null; file_url?: string | null; source?: string;
          caption?: string | null; scheduled_at?: string | null; created_at?: string; updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["design_assets"]["Insert"]>;
      };
      asset_comments: {
        Row: { id: string; asset_id: string; author_name: string; is_client: boolean; comment: string; pin_x: number | null; pin_y: number | null; created_at: string };
        Insert: { id?: string; asset_id: string; author_name: string; is_client?: boolean; comment: string; pin_x?: number | null; pin_y?: number | null; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["asset_comments"]["Insert"]>;
      };
      media_library: {
        Row: { id: string; client_id: string | null; uploaded_by: string; url: string; media_type: string; tags: string[] | null; created_at: string };
        Insert: { id?: string; client_id?: string | null; uploaded_by: string; url: string; media_type?: string; tags?: string[] | null; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["media_library"]["Insert"]>;
      };
      trends: {
        Row: { id: string; client_id: string; title: string; source_url: string | null; summary: string | null; suggested_post: string | null; created_at: string };
        Insert: { id?: string; client_id: string; title: string; source_url?: string | null; summary?: string | null; suggested_post?: string | null; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["trends"]["Insert"]>;
      };
      notifications: {
        Row: { id: string; asset_id: string; channel: string; status: string; sent_at: string | null; created_at: string };
        Insert: { id?: string; asset_id: string; channel?: string; status?: string; sent_at?: string | null; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["notifications"]["Insert"]>;
      };
    };
    Enums: {
      app_role: "admin" | "editor";
    };
  };
};
