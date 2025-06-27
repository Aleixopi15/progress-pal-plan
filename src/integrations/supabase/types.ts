export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      daily_goals: {
        Row: {
          achieved_hours: number | null
          achieved_questions: number | null
          created_at: string
          date: string
          id: string
          target_hours: number
          target_questions: number
          updated_at: string
          user_id: string
        }
        Insert: {
          achieved_hours?: number | null
          achieved_questions?: number | null
          created_at?: string
          date?: string
          id?: string
          target_hours?: number
          target_questions?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          achieved_hours?: number | null
          achieved_questions?: number | null
          created_at?: string
          date?: string
          id?: string
          target_hours?: number
          target_questions?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      goal_notifications: {
        Row: {
          created_at: string
          goal_id: string
          id: string
          is_sent: boolean
          notification_date: string
          user_id: string
        }
        Insert: {
          created_at?: string
          goal_id: string
          id?: string
          is_sent?: boolean
          notification_date: string
          user_id: string
        }
        Update: {
          created_at?: string
          goal_id?: string
          id?: string
          is_sent?: boolean
          notification_date?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "goal_notifications_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "user_goals"
            referencedColumns: ["id"]
          },
        ]
      }
      notes: {
        Row: {
          content: string
          created_at: string
          id: string
          topic_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          topic_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          topic_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notes_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          id: string
          nome: string | null
          sobrenome: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          id: string
          nome?: string | null
          sobrenome?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          nome?: string | null
          sobrenome?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      questions: {
        Row: {
          answer: string
          content: string
          created_at: string
          id: string
          is_correct: boolean
          topic_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          answer: string
          content: string
          created_at?: string
          id?: string
          is_correct?: boolean
          topic_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          answer?: string
          content?: string
          created_at?: string
          id?: string
          is_correct?: boolean
          topic_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "questions_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      schedule_events: {
        Row: {
          created_at: string
          day_of_week: number
          description: string | null
          end_time: string
          id: string
          start_time: string
          subject_id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          day_of_week: number
          description?: string | null
          end_time: string
          id?: string
          start_time: string
          subject_id: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          day_of_week?: number
          description?: string | null
          end_time?: string
          id?: string
          start_time?: string
          subject_id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "schedule_events_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      simulados: {
        Row: {
          created_at: string
          data: string
          humanas: number | null
          id: string
          instituicao: string
          linguagens: number | null
          matematica: number | null
          natureza: number | null
          nome: string
          nota_total: number | null
          questoes_acertadas: number | null
          questoes_totais: number | null
          redacao: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data: string
          humanas?: number | null
          id?: string
          instituicao: string
          linguagens?: number | null
          matematica?: number | null
          natureza?: number | null
          nome: string
          nota_total?: number | null
          questoes_acertadas?: number | null
          questoes_totais?: number | null
          redacao?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: string
          humanas?: number | null
          id?: string
          instituicao?: string
          linguagens?: number | null
          matematica?: number | null
          natureza?: number | null
          nome?: string
          nota_total?: number | null
          questoes_acertadas?: number | null
          questoes_totais?: number | null
          redacao?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      study_sessions: {
        Row: {
          comment: string | null
          correct_exercises: number | null
          created_at: string
          date: string
          end_page: number | null
          id: string
          incorrect_exercises: number | null
          lesson: string | null
          registration_time: string
          start_page: number | null
          study_time: number
          subject_id: string
          subtopic: string | null
          topic_id: string | null
          user_id: string
          video_end_time: string | null
          video_start_time: string | null
        }
        Insert: {
          comment?: string | null
          correct_exercises?: number | null
          created_at?: string
          date?: string
          end_page?: number | null
          id?: string
          incorrect_exercises?: number | null
          lesson?: string | null
          registration_time?: string
          start_page?: number | null
          study_time: number
          subject_id: string
          subtopic?: string | null
          topic_id?: string | null
          user_id: string
          video_end_time?: string | null
          video_start_time?: string | null
        }
        Update: {
          comment?: string | null
          correct_exercises?: number | null
          created_at?: string
          date?: string
          end_page?: number | null
          id?: string
          incorrect_exercises?: number | null
          lesson?: string | null
          registration_time?: string
          start_page?: number | null
          study_time?: number
          subject_id?: string
          subtopic?: string | null
          topic_id?: string | null
          user_id?: string
          video_end_time?: string | null
          video_start_time?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "study_sessions_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "study_sessions_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      study_streaks: {
        Row: {
          created_at: string
          current_streak: number
          id: string
          last_study_date: string | null
          longest_streak: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_streak?: number
          id?: string
          last_study_date?: string | null
          longest_streak?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_streak?: number
          id?: string
          last_study_date?: string | null
          longest_streak?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      subjects: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      subscription_history: {
        Row: {
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          id: string
          price_id: string | null
          status: string
          stripe_subscription_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          price_id?: string | null
          status: string
          stripe_subscription_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          price_id?: string | null
          status?: string
          stripe_subscription_id?: string
          user_id?: string
        }
        Relationships: []
      }
      topics: {
        Row: {
          completed_at: string | null
          created_at: string
          description: string | null
          id: string
          is_completed: boolean
          name: string
          subject_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_completed?: boolean
          name: string
          subject_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_completed?: boolean
          name?: string
          subject_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "topics_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      user_goals: {
        Row: {
          completed_at: string | null
          created_at: string
          current_value: number
          deadline: string | null
          description: string | null
          id: string
          is_completed: boolean
          priority: string
          subject_id: string | null
          target_value: number
          title: string
          type: string
          unit: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          current_value?: number
          deadline?: string | null
          description?: string | null
          id?: string
          is_completed?: boolean
          priority?: string
          subject_id?: string | null
          target_value: number
          title: string
          type: string
          unit: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          current_value?: number
          deadline?: string | null
          description?: string | null
          id?: string
          is_completed?: boolean
          priority?: string
          subject_id?: string | null
          target_value?: number
          title?: string
          type?: string
          unit?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_goals_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      user_settings: {
        Row: {
          created_at: string
          data_prova: string | null
          id: string
          meta_horas_diarias: number | null
          meta_horas_semanais: number | null
          meta_questoes_diarias: number | null
          meta_questoes_semanais: number | null
          updated_at: string
          user_id: string
          vestibular_pretendido: string | null
        }
        Insert: {
          created_at?: string
          data_prova?: string | null
          id?: string
          meta_horas_diarias?: number | null
          meta_horas_semanais?: number | null
          meta_questoes_diarias?: number | null
          meta_questoes_semanais?: number | null
          updated_at?: string
          user_id: string
          vestibular_pretendido?: string | null
        }
        Update: {
          created_at?: string
          data_prova?: string | null
          id?: string
          meta_horas_diarias?: number | null
          meta_horas_semanais?: number | null
          meta_questoes_diarias?: number | null
          meta_questoes_semanais?: number | null
          updated_at?: string
          user_id?: string
          vestibular_pretendido?: string | null
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          id: string
          is_active: boolean
          stripe_customer_id: string | null
          subscription_status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          is_active?: boolean
          stripe_customer_id?: string | null
          subscription_status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          is_active?: boolean
          stripe_customer_id?: string | null
          subscription_status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
