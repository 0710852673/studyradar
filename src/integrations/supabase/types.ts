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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      chapters: {
        Row: {
          created_at: string
          id: string
          position: number
          status: string
          subject: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          position?: number
          status?: string
          subject: string
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          position?: number
          status?: string
          subject?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      device_events: {
        Row: {
          city: string | null
          country: string | null
          created_at: string
          email: string | null
          id: string
          ip: string | null
          kind: string
          language: string | null
          path: string | null
          platform: string | null
          referrer: string | null
          region: string | null
          screen: string | null
          timezone: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          city?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          id?: string
          ip?: string | null
          kind?: string
          language?: string | null
          path?: string | null
          platform?: string | null
          referrer?: string | null
          region?: string | null
          screen?: string | null
          timezone?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          city?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          id?: string
          ip?: string | null
          kind?: string
          language?: string | null
          path?: string | null
          platform?: string | null
          referrer?: string | null
          region?: string | null
          screen?: string | null
          timezone?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      marks: {
        Row: {
          created_at: string
          date: string
          exam_name: string
          id: string
          marks: number
          subject: string
          total: number
          user_id: string
        }
        Insert: {
          created_at?: string
          date?: string
          exam_name: string
          id?: string
          marks: number
          subject: string
          total?: number
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          exam_name?: string
          id?: string
          marks?: number
          subject?: string
          total?: number
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          city: string | null
          created_at: string
          daily_target_hours: number
          district: string | null
          email: string | null
          exam_date: string | null
          exam_year: number
          grade: string | null
          guardian_name: string | null
          guardian_phone: string | null
          id: string
          is_demo: boolean
          last_seen_at: string | null
          mobile: string | null
          name: string
          onboarded: boolean
          school: string | null
          stream: string | null
          subjects: string[]
          suspended: boolean
          suspended_at: string | null
          suspended_reason: string | null
          terms_accepted_at: string | null
          track: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          created_at?: string
          daily_target_hours?: number
          district?: string | null
          email?: string | null
          exam_date?: string | null
          exam_year?: number
          grade?: string | null
          guardian_name?: string | null
          guardian_phone?: string | null
          id: string
          is_demo?: boolean
          last_seen_at?: string | null
          mobile?: string | null
          name?: string
          onboarded?: boolean
          school?: string | null
          stream?: string | null
          subjects?: string[]
          suspended?: boolean
          suspended_at?: string | null
          suspended_reason?: string | null
          terms_accepted_at?: string | null
          track?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          created_at?: string
          daily_target_hours?: number
          district?: string | null
          email?: string | null
          exam_date?: string | null
          exam_year?: number
          grade?: string | null
          guardian_name?: string | null
          guardian_phone?: string | null
          id?: string
          is_demo?: boolean
          last_seen_at?: string | null
          mobile?: string | null
          name?: string
          onboarded?: boolean
          school?: string | null
          stream?: string | null
          subjects?: string[]
          suspended?: boolean
          suspended_at?: string | null
          suspended_reason?: string | null
          terms_accepted_at?: string | null
          track?: string
          updated_at?: string
        }
        Relationships: []
      }
      security_events: {
        Row: {
          created_at: string
          detail: string | null
          email: string | null
          id: string
          kind: string
          path: string | null
          severity: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          detail?: string | null
          email?: string | null
          id?: string
          kind: string
          path?: string | null
          severity?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          detail?: string | null
          email?: string | null
          id?: string
          kind?: string
          path?: string | null
          severity?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          announcement: string | null
          announcement_active: boolean
          google_login_enabled: boolean
          id: boolean
          maintenance_message: string
          maintenance_mode: boolean
          max_writes_per_minute: number
          signups_enabled: boolean
          updated_at: string
        }
        Insert: {
          announcement?: string | null
          announcement_active?: boolean
          google_login_enabled?: boolean
          id?: boolean
          maintenance_message?: string
          maintenance_mode?: boolean
          max_writes_per_minute?: number
          signups_enabled?: boolean
          updated_at?: string
        }
        Update: {
          announcement?: string | null
          announcement_active?: boolean
          google_login_enabled?: boolean
          id?: boolean
          maintenance_message?: string
          maintenance_mode?: boolean
          max_writes_per_minute?: number
          signups_enabled?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      study_sessions: {
        Row: {
          created_at: string
          date: string
          id: string
          minutes: number
          note: string | null
          subject: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date?: string
          id?: string
          minutes: number
          note?: string | null
          subject: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          minutes?: number
          note?: string | null
          subject?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "student"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "student"],
    },
  },
} as const
