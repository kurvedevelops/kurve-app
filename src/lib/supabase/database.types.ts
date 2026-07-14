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
      activity_logs: {
        Row: {
          category_id: string | null
          client_id: string
          created_at: string
          hours: number
          id: string
          is_draft: boolean
          log_date: string
          notes: string | null
          pieces_count: number
          status: Database["public"]["Enums"]["activity_status"]
          subtype_id: string | null
          task_type_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category_id?: string | null
          client_id: string
          created_at?: string
          hours: number
          id?: string
          is_draft?: boolean
          log_date?: string
          notes?: string | null
          pieces_count?: number
          status?: Database["public"]["Enums"]["activity_status"]
          subtype_id?: string | null
          task_type_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category_id?: string | null
          client_id?: string
          created_at?: string
          hours?: number
          id?: string
          is_draft?: boolean
          log_date?: string
          notes?: string | null
          pieces_count?: number
          status?: Database["public"]["Enums"]["activity_status"]
          subtype_id?: string | null
          task_type_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "piece_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_logs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_logs_subtype_id_fkey"
            columns: ["subtype_id"]
            isOneToOne: false
            referencedRelation: "task_subtypes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_logs_task_type_id_fkey"
            columns: ["task_type_id"]
            isOneToOne: false
            referencedRelation: "task_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      client_links: {
        Row: {
          client_id: string
          created_at: string
          id: string
          label: string
          type: Database["public"]["Enums"]["link_type"]
          url: string
        }
        Insert: {
          client_id: string
          created_at?: string
          id?: string
          label: string
          type?: Database["public"]["Enums"]["link_type"]
          url: string
        }
        Update: {
          client_id?: string
          created_at?: string
          id?: string
          label?: string
          type?: Database["public"]["Enums"]["link_type"]
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_links_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_users: {
        Row: {
          client_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          client_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          client_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_users_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_users_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          created_at: string
          email: string | null
          end_date: string | null
          id: string
          legal_name: string | null
          name: string
          phone: string | null
          start_date: string | null
          status: Database["public"]["Enums"]["client_status"]
        }
        Insert: {
          created_at?: string
          email?: string | null
          end_date?: string | null
          id?: string
          legal_name?: string | null
          name: string
          phone?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["client_status"]
        }
        Update: {
          created_at?: string
          email?: string | null
          end_date?: string | null
          id?: string
          legal_name?: string | null
          name?: string
          phone?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["client_status"]
        }
        Relationships: []
      }
      consumption_summary: {
        Row: {
          category_id: string | null
          consumed: number
          id: string
          package_id: string
          task_type_id: string | null
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          consumed?: number
          id?: string
          package_id: string
          task_type_id?: string | null
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          consumed?: number
          id?: string
          package_id?: string
          task_type_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "consumption_summary_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "piece_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consumption_summary_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consumption_summary_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "v_client_consumption"
            referencedColumns: ["package_id"]
          },
          {
            foreignKeyName: "consumption_summary_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "v_consumption_by_task_type"
            referencedColumns: ["package_id"]
          },
          {
            foreignKeyName: "consumption_summary_task_type_id_fkey"
            columns: ["task_type_id"]
            isOneToOne: false
            referencedRelation: "task_types"
            referencedColumns: ["id"]
          },
        ]
      }
      edit_requests: {
        Row: {
          activity_log_id: string
          created_at: string
          field_name: Database["public"]["Enums"]["editable_field"]
          id: string
          new_value: string
          old_value: string
          reason: string | null
          requested_by: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["request_status"]
        }
        Insert: {
          activity_log_id: string
          created_at?: string
          field_name: Database["public"]["Enums"]["editable_field"]
          id?: string
          new_value: string
          old_value: string
          reason?: string | null
          requested_by: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["request_status"]
        }
        Update: {
          activity_log_id?: string
          created_at?: string
          field_name?: Database["public"]["Enums"]["editable_field"]
          id?: string
          new_value?: string
          old_value?: string
          reason?: string | null
          requested_by?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["request_status"]
        }
        Relationships: [
          {
            foreignKeyName: "edit_requests_activity_log_id_fkey"
            columns: ["activity_log_id"]
            isOneToOne: false
            referencedRelation: "activity_logs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edit_requests_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edit_requests_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          channel: Database["public"]["Enums"]["notification_channel"]
          created_at: string
          id: string
          payload: Json
          read_at: string | null
          sent_at: string | null
          type: string
          user_id: string
        }
        Insert: {
          channel?: Database["public"]["Enums"]["notification_channel"]
          created_at?: string
          id?: string
          payload?: Json
          read_at?: string | null
          sent_at?: string | null
          type: string
          user_id: string
        }
        Update: {
          channel?: Database["public"]["Enums"]["notification_channel"]
          created_at?: string
          id?: string
          payload?: Json
          read_at?: string | null
          sent_at?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      package_pieces: {
        Row: {
          category_id: string
          id: string
          package_id: string
          quantity: number
        }
        Insert: {
          category_id: string
          id?: string
          package_id: string
          quantity?: number
        }
        Update: {
          category_id?: string
          id?: string
          package_id?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "package_pieces_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "piece_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "package_pieces_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "package_pieces_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "v_client_consumption"
            referencedColumns: ["package_id"]
          },
          {
            foreignKeyName: "package_pieces_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "v_consumption_by_task_type"
            referencedColumns: ["package_id"]
          },
        ]
      }
      packages: {
        Row: {
          block_on_limit: boolean
          client_id: string
          created_at: string
          end_date: string | null
          id: string
          name: string
          price: number | null
          start_date: string | null
          status: Database["public"]["Enums"]["client_status"]
          total_hours: number
          total_pieces: number | null
        }
        Insert: {
          block_on_limit?: boolean
          client_id: string
          created_at?: string
          end_date?: string | null
          id?: string
          name: string
          price?: number | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["client_status"]
          total_hours: number
          total_pieces?: number | null
        }
        Update: {
          block_on_limit?: boolean
          client_id?: string
          created_at?: string
          end_date?: string | null
          id?: string
          name?: string
          price?: number | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["client_status"]
          total_hours?: number
          total_pieces?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "packages_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      piece_categories: {
        Row: {
          active: boolean
          created_at: string
          id: string
          name: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      task_subtypes: {
        Row: {
          active: boolean
          created_at: string
          display_order: number
          id: string
          name: string
          task_type_id: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          display_order?: number
          id?: string
          name: string
          task_type_id?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          display_order?: number
          id?: string
          name?: string
          task_type_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_subtypes_task_type_id_fkey"
            columns: ["task_type_id"]
            isOneToOne: false
            referencedRelation: "task_types"
            referencedColumns: ["id"]
          },
        ]
      }
      task_types: {
        Row: {
          active: boolean
          allowed_roles: Database["public"]["Enums"]["user_role"][]
          counts_as_piece: boolean
          created_at: string
          id: string
          name: string
        }
        Insert: {
          active?: boolean
          allowed_roles?: Database["public"]["Enums"]["user_role"][]
          counts_as_piece?: boolean
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          active?: boolean
          allowed_roles?: Database["public"]["Enums"]["user_role"][]
          counts_as_piece?: boolean
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          active: boolean
          client_id: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          phone: string | null
          position: string | null
          role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          active?: boolean
          client_id?: string | null
          created_at?: string
          email: string
          full_name?: string
          id: string
          phone?: string | null
          position?: string | null
          role?: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          active?: boolean
          client_id?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          phone?: string | null
          position?: string | null
          role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: [
          {
            foreignKeyName: "users_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      v_client_consumption: {
        Row: {
          client_id: string | null
          consumed_hours: number | null
          end_date: string | null
          hours_percent: number | null
          package_id: string | null
          package_name: string | null
          package_status: Database["public"]["Enums"]["client_status"] | null
          start_date: string | null
          total_hours: number | null
          traffic_light: string | null
        }
        Relationships: [
          {
            foreignKeyName: "packages_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      v_consumption_by_task_type: {
        Row: {
          client_id: string | null
          consumed_hours: number | null
          package_id: string | null
          percent_of_total: number | null
          task_name: string | null
          task_type_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "consumption_summary_task_type_id_fkey"
            columns: ["task_type_id"]
            isOneToOne: false
            referencedRelation: "task_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "packages_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      approve_edit_request: {
        Args: { p_request_id: string; p_reviewer_id: string }
        Returns: Json
      }
      current_user_role: {
        Args: never
        Returns: Database["public"]["Enums"]["user_role"]
      }
      recalculate_package_consumption: {
        Args: { p_package_id: string }
        Returns: undefined
      }
      get_active_package_id: { Args: { p_client_id: string }; Returns: string }
      get_my_client_ids: { Args: never; Returns: string[] }
      recalculate_client_consumption: {
        Args: { p_client_id: string }
        Returns: undefined
      }
    }
    Enums: {
      activity_status: "in_progress" | "delivered" | "published"
      client_status: "active" | "paused" | "ended"
      editable_field:
        | "hours"
        | "pieces_count"
        | "task_type_id"
        | "category_id"
        | "log_date"
        | "status"
        | "notes"
      link_type: "contract" | "drive" | "analytics" | "custom"
      notification_channel: "email" | "whatsapp"
      request_status: "pending" | "approved" | "rejected"
      user_role: "admin" | "member" | "client"
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
    Enums: {
      activity_status: ["in_progress", "delivered", "published"],
      client_status: ["active", "paused", "ended"],
      editable_field: [
        "hours",
        "pieces_count",
        "task_type_id",
        "category_id",
        "log_date",
        "status",
        "notes",
      ],
      link_type: ["contract", "drive", "analytics", "custom"],
      notification_channel: ["email", "whatsapp"],
      request_status: ["pending", "approved", "rejected"],
      user_role: ["admin", "member", "client"],
    },
  },
} as const
