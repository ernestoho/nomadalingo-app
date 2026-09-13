export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type Table<Row, Insert = Partial<Row>, Update = Partial<Insert>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

type Timestamped = { created_at: string; updated_at: string };

export type Database = {
  __InternalSupabase: { PostgrestVersion: '14.5' };
  public: {
    Tables: {
      profiles: Table<
        Timestamped & {
          id: string;
          display_name: string;
          role: string;
          profile: Json;
          onboarded: boolean;
          last_seen_at: string | null;
        },
        {
          id: string;
          display_name?: string;
          role?: string;
          profile?: Json;
          onboarded?: boolean;
          created_at?: string;
          updated_at?: string;
          last_seen_at?: string | null;
        }
      >;
      venues: Table<
        Timestamped & {
          id: string;
          name: string;
          type: string;
          area: string;
          rating: number | null;
          sponsor_deal: Json | null;
          amenities: Json;
          blurb: Json;
          photo_seed: string;
          published: boolean;
          sort_order: number;
        },
        {
          id: string;
          name: string;
          type: string;
          area: string;
          rating?: number | null;
          sponsor_deal?: Json | null;
          amenities?: Json;
          blurb?: Json;
          photo_seed?: string;
          published?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        }
      >;
      meetups: Table<
        Timestamped & {
          id: string;
          category: string;
          title: Json;
          venue_id: string;
          area: string;
          when_label: Json;
          starts_at: string;
          going: number;
          capacity: number;
          languages: Json;
          attendees: Json;
          description: Json;
          host_id: number | null;
          created_by: string | null;
          published: boolean;
        },
        {
          id: string;
          category: string;
          title: Json;
          venue_id: string;
          area: string;
          when_label: Json;
          starts_at: string;
          going?: number;
          capacity?: number;
          languages?: Json;
          attendees?: Json;
          description?: Json;
          host_id?: number | null;
          created_by?: string | null;
          published?: boolean;
          created_at?: string;
          updated_at?: string;
        }
      >;
      official_events: Table<
        Timestamped & {
          id: string;
          title: Json;
          venue_id: string;
          area: string;
          when_label: Json;
          starts_at: string;
          price_usd: number;
          capacity: number;
          sold_seed: number;
          includes: Json;
          blurb: Json;
          is_current: boolean;
          published: boolean;
        },
        {
          id: string;
          title: Json;
          venue_id: string;
          area: string;
          when_label: Json;
          starts_at: string;
          price_usd: number;
          capacity: number;
          sold_seed?: number;
          includes?: Json;
          blurb?: Json;
          is_current?: boolean;
          published?: boolean;
          created_at?: string;
          updated_at?: string;
        }
      >;
      membership_plans: Table<
        {
          id: string;
          label: Json;
          price_usd: number;
          days: number;
          note: Json | null;
          active: boolean;
          sort_order: number;
          updated_at: string;
        },
        {
          id: string;
          label: Json;
          price_usd: number;
          days: number;
          note?: Json | null;
          active?: boolean;
          sort_order?: number;
          updated_at?: string;
        }
      >;
      rsvps: Table<
        { user_id: string; meetup_id: string; created_at: string },
        { user_id: string; meetup_id: string; created_at?: string }
      >;
      memberships: Table<
        { user_id: string; plan: string; started_at: string; until: string; updated_at: string },
        { user_id: string; plan: string; started_at?: string; until: string; updated_at?: string }
      >;
      tickets: Table<
        {
          id: string;
          user_id: string;
          event_id: string;
          kind: string;
          usd_paid: number;
          qr_payload: string;
          checked_in_at: string | null;
          created_at: string;
        },
        {
          id?: string;
          user_id: string;
          event_id: string;
          kind: string;
          usd_paid?: number;
          qr_payload: string;
          checked_in_at?: string | null;
          created_at?: string;
        }
      >;
      phrases: Table<
        {
          id: string;
          user_id: string;
          wrong: string;
          right_text: string;
          why: Json;
          created_at: string;
        },
        {
          id?: string;
          user_id: string;
          wrong: string;
          right_text: string;
          why?: Json;
          created_at?: string;
        }
      >;
      orders: Table<
        {
          id: string;
          user_id: string;
          kind: string;
          target_id: string;
          amount_usd: number;
          status: string;
          provider: string;
          provider_ref: string | null;
          created_at: string;
          captured_at: string | null;
        },
        {
          id?: string;
          user_id: string;
          kind: string;
          target_id: string;
          amount_usd: number;
          status?: string;
          provider: string;
          provider_ref?: string | null;
          created_at?: string;
          captured_at?: string | null;
        }
      >;
      content_version: Table<
        { id: number; version: number; updated_at: string },
        { id?: number; version?: number; updated_at?: string }
      >;
      conversations: Table<
        Timestamped & {
          id: string;
          kind: string;
          direct_key: string | null;
          title: string | null;
          created_by: string;
        },
        {
          id?: string;
          kind?: string;
          direct_key?: string | null;
          title?: string | null;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        }
      >;
      conversation_members: Table<
        {
          conversation_id: string;
          user_id: string;
          joined_at: string;
          last_read_at: string | null;
        },
        {
          conversation_id: string;
          user_id: string;
          joined_at?: string;
          last_read_at?: string | null;
        }
      >;
      messages: Table<
        {
          id: string;
          conversation_id: string;
          sender_id: string;
          client_id: string;
          body: string;
          correction: Json | null;
          meetup_id: string | null;
          created_at: string;
          edited_at: string | null;
          deleted_at: string | null;
        },
        {
          id?: string;
          conversation_id: string;
          sender_id: string;
          client_id: string;
          body: string;
          correction?: Json | null;
          meetup_id?: string | null;
          created_at?: string;
          edited_at?: string | null;
          deleted_at?: string | null;
        }
      >;
      blocks: Table<
        { blocker_id: string; blocked_id: string; created_at: string },
        { blocker_id: string; blocked_id: string; created_at?: string }
      >;
      reports: Table<
        {
          id: string;
          reporter_id: string;
          reported_user_id: string | null;
          message_id: string | null;
          reason: string;
          details: string | null;
          status: string;
          created_at: string;
          resolved_at: string | null;
        },
        {
          id?: string;
          reporter_id: string;
          reported_user_id?: string | null;
          message_id?: string | null;
          reason: string;
          details?: string | null;
          status?: string;
          created_at?: string;
          resolved_at?: string | null;
        }
      >;
    };
    Views: { [_ in never]: never };
    Functions: {
      is_admin: { Args: { check_user_id?: string }; Returns: boolean };
      is_conversation_member: {
        Args: { check_conversation_id: string; check_user_id?: string };
        Returns: boolean;
      };
      start_direct_conversation: { Args: { other_user_id: string }; Returns: string };
    };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};

export type Tables<Name extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][Name]['Row'];
export type TablesInsert<Name extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][Name]['Insert'];
export type TablesUpdate<Name extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][Name]['Update'];
