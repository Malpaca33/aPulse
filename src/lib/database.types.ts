Initialising login role...
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
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      bookmarks: {
        Row: {
          created_at: string
          tweet_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          tweet_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          tweet_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookmarks_tweet_id_fkey"
            columns: ["tweet_id"]
            isOneToOne: false
            referencedRelation: "tweets"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          content: string
          created_at: string
          id: string
          tweet_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          tweet_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          tweet_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_tweet_id_fkey"
            columns: ["tweet_id"]
            isOneToOne: false
            referencedRelation: "tweets"
            referencedColumns: ["id"]
          },
        ]
      }
      featured_stars: {
        Row: {
          created_at: string
          tweet_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          tweet_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          tweet_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "featured_stars_tweet_id_fkey"
            columns: ["tweet_id"]
            isOneToOne: false
            referencedRelation: "tweets"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          read: boolean
          source_user_id: string
          target_user_id: string
          tweet_id: string | null
          type: string
        }
        Insert: {
          created_at?: string
          id?: string
          read?: boolean
          source_user_id: string
          target_user_id: string
          tweet_id?: string | null
          type: string
        }
        Update: {
          created_at?: string
          id?: string
          read?: boolean
          source_user_id?: string
          target_user_id?: string
          tweet_id?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_tweet_id_fkey"
            columns: ["tweet_id"]
            isOneToOne: false
            referencedRelation: "tweets"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          id: string
          nickname: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          id: string
          nickname?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          id?: string
          nickname?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      site_metadata: {
        Row: {
          id: string
          key: string
          updated_at: string
          value: number
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string
          value?: number
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string
          value?: number
        }
        Relationships: []
      }
      site_stats: {
        Row: {
          id: string
          metric_name: string
          metric_value: number
          updated_at: string
        }
        Insert: {
          id?: string
          metric_name: string
          metric_value?: number
          updated_at?: string
        }
        Update: {
          id?: string
          metric_name?: string
          metric_value?: number
          updated_at?: string
        }
        Relationships: []
      }
      traffic_stats: {
        Row: {
          active_users: number
          id: string
          page_views: number
          posts_count: number
          recorded_at: string
        }
        Insert: {
          active_users?: number
          id?: string
          page_views?: number
          posts_count?: number
          recorded_at?: string
        }
        Update: {
          active_users?: number
          id?: string
          page_views?: number
          posts_count?: number
          recorded_at?: string
        }
        Relationships: []
      }
      tweet_likes: {
        Row: {
          created_at: string
          tweet_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          tweet_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          tweet_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tweet_likes_tweet_id_fkey"
            columns: ["tweet_id"]
            isOneToOne: false
            referencedRelation: "tweets"
            referencedColumns: ["id"]
          },
        ]
      }
      tweets: {
        Row: {
          city: string | null
          comments_count: number
          content: string
          created_at: string | null
          id: string
          image_url: string | null
          is_featured: boolean
          likes_count: number | null
          topic: string | null
          user_id: string | null
        }
        Insert: {
          city?: string | null
          comments_count?: number
          content: string
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean
          likes_count?: number | null
          topic?: string | null
          user_id?: string | null
        }
        Update: {
          city?: string | null
          comments_count?: number
          content?: string
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean
          likes_count?: number | null
          topic?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_configs: {
        Row: {
          email_notifications: boolean
          notify_email: string | null
          notify_phone: string | null
          phone_notifications: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          email_notifications?: boolean
          notify_email?: string | null
          notify_phone?: string | null
          phone_notifications?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          email_notifications?: boolean
          notify_email?: string | null
          notify_phone?: string | null
          phone_notifications?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_bookmark_timeline: {
        Args: { max_results?: number; uid: string }
        Returns: {
          city: string
          content: string
          created_at: string
          id: string
          image_url: string
          is_featured: boolean
          likes_count: number
          recent_comments: Json
          topic: string
          user_id: string
        }[]
      }
      get_starred_timeline: {
        Args: { max_results?: number; uid: string }
        Returns: {
          content: string
          created_at: string
          id: string
          image_url: string
          is_featured: boolean
          likes_count: number
          recent_comments: Json
          user_id: string
        }[]
      }
      get_timeline: {
        Args: { max_results?: number }
        Returns: {
          city: string
          content: string
          created_at: string
          id: string
          image_url: string
          is_featured: boolean
          likes_count: number
          recent_comments: Json
          topic: string
          user_id: string
        }[]
      }
      get_top_contributors: {
        Args: { limit_count?: number }
        Returns: {
          total_activity: number
          user_id: string
        }[]
      }
      get_top_posters: {
        Args: { limit_count?: number }
        Returns: {
          post_count: number
          user_id: string
        }[]
      }
      get_traffic_stats: {
        Args: { hours_range?: number }
        Returns: {
          active_users: number
          page_views: number
          posts_count: number
          recorded_at: string
        }[]
      }
      increment_page_view: { Args: never; Returns: number }
      increment_visit_count: { Args: never; Returns: number }
      search_all: {
        Args: { max_results?: number; query_text: string }
        Returns: {
          content: string
          created_at: string
          id: string
          image_url: string
          likes_count: number
          parent_tweet_id: string
          source_type: string
          tweet_content: string
          user_id: string
        }[]
      }
      search_timeline: {
        Args: { max_results?: number; query_text: string }
        Returns: {
          city: string
          content: string
          created_at: string
          id: string
          image_url: string
          is_featured: boolean
          likes_count: number
          recent_comments: Json
          topic: string
          user_id: string
        }[]
      }
      search_tweets: {
        Args: { max_results?: number; query_text: string }
        Returns: {
          content: string
          created_at: string
          id: string
          image_url: string
          likes_count: number
          user_id: string
        }[]
      }
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
<claude-code-hint v="1" type="plugin" value="supabase@claude-plugins-official" />
