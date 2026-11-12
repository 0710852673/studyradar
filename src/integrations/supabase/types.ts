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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      achievement_awards: {
        Row: {
          achievement_id: string
          awarded_at: string
          description: string
          email_sent_at: string | null
          email_status: string
          id: string
          title: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          awarded_at?: string
          description: string
          email_sent_at?: string | null
          email_status?: string
          id?: string
          title: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          awarded_at?: string
          description?: string
          email_sent_at?: string | null
          email_status?: string
          id?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      admin_audit_events: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          detail: string | null
          entity_id: string | null
          entity_type: string
          id: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          detail?: string | null
          entity_id?: string | null
          entity_type: string
          id?: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          detail?: string | null
          entity_id?: string | null
          entity_type?: string
          id?: string
        }
        Relationships: []
      }
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
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          status: string
          topic: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          status?: string
          topic: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          status?: string
          topic?: string
          user_id?: string | null
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
      feedback: {
        Row: {
          created_at: string
          id: string
          kind: string
          message: string
          page: string | null
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          kind?: string
          message: string
          page?: string | null
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          kind?: string
          message?: string
          page?: string | null
          status?: string
          user_id?: string
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
      referral_codes: {
        Row: {
          code: string
          created_at: string
          user_id: string
        }
        Insert: {
          code?: string
          created_at?: string
          user_id: string
        }
        Update: {
          code?: string
          created_at?: string
          user_id?: string
        }
        Relationships: []
      }
      referral_signups: {
        Row: {
          created_at: string
          id: string
          referred_user_id: string
          referrer_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          referred_user_id: string
          referrer_id: string
        }
        Update: {
          created_at?: string
          id?: string
          referred_user_id?: string
          referrer_id?: string
        }
        Relationships: []
      }
      resource_suggestions: {
        Row: {
          admin_response: string | null
          category: string
          created_at: string
          description: string
          exams: string[]
          id: string
          name: string
          normalized_url: string
          reason: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          subjects: string[]
          updated_at: string
          url: string
          user_id: string
        }
        Insert: {
          admin_response?: string | null
          category: string
          created_at?: string
          description: string
          exams?: string[]
          id?: string
          name: string
          normalized_url: string
          reason: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          subjects?: string[]
          updated_at?: string
          url: string
          user_id: string
        }
        Update: {
          admin_response?: string | null
          category?: string
          created_at?: string
          description?: string
          exams?: string[]
          id?: string
          name?: string
          normalized_url?: string
          reason?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          subjects?: string[]
          updated_at?: string
          url?: string
          user_id?: string
        }
        Relationships: []
      }
      resources: {
        Row: {
          category: string
          created_at: string
          created_by: string | null
          description: string
          exams: string[]
          featured: boolean
          id: string
          name: string
          normalized_url: string
          publisher: string
          status: string
          subjects: string[]
          updated_at: string
          url: string
        }
        Insert: {
          category: string
          created_at?: string
          created_by?: string | null
          description?: string
          exams?: string[]
          featured?: boolean
          id?: string
          name: string
          normalized_url: string
          publisher: string
          status?: string
          subjects?: string[]
          updated_at?: string
          url: string
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string
          exams?: string[]
          featured?: boolean
          id?: string
          name?: string
          normalized_url?: string
          publisher?: string
          status?: string
          subjects?: string[]
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      saved_items: {
        Row: {
          created_at: string
          href: string | null
          id: string
          item_key: string
          kind: string
          note: string | null
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          href?: string | null
          id?: string
          item_key: string
          kind: string
          note?: string | null
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          href?: string | null
          id?: string
          item_key?: string
          kind?: string
          note?: string | null
          title?: string
          user_id?: string
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
      wasted_time: {
        Row: {
          created_at: string
          date: string
          id: string
          minutes: number
          reason: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          date?: string
          id?: string
          minutes: number
          reason?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          minutes?: number
          reason?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      award_my_eligible_achievements: {
        Args: never
        Returns: {
          achievement_id: string
          awarded_at: string
          description: string
          id: string
          title: string
        }[]
      }
      get_my_referral_code: { Args: never; Returns: string }
      get_public_auth_settings: {
        Args: never
        Returns: {
          google_login_enabled: boolean
          signups_enabled: boolean
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      normalize_resource_url: { Args: { input: string }; Returns: string }
      record_my_referral: { Args: { p_code: string }; Returns: boolean }
      review_resource_suggestion: {
        Args: { p_decision: string; p_id: string; p_response?: string }
        Returns: Json
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
