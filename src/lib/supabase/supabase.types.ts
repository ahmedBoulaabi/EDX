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
      buildings: {
        Row: {
          id: string
          name: string | null
        }
        Insert: {
          id?: string
          name?: string | null
        }
        Update: {
          id?: string
          name?: string | null
        }
        Relationships: []
      }
      classrooms: {
        Row: {
          building_id: string | null
          id: string
          max_capacity: number | null
          room_plan_id: string | null
          type: Database["public"]["Enums"]["ClassroomType"] | null
        }
        Insert: {
          building_id?: string | null
          id?: string
          max_capacity?: number | null
          room_plan_id?: string | null
          type?: Database["public"]["Enums"]["ClassroomType"] | null
        }
        Update: {
          building_id?: string | null
          id?: string
          max_capacity?: number | null
          room_plan_id?: string | null
          type?: Database["public"]["Enums"]["ClassroomType"] | null
        }
        Relationships: [
          {
            foreignKeyName: "classrooms_building_id_buildings_id_fk"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "buildings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classrooms_room_plan_id_room_plans_id_fk"
            columns: ["room_plan_id"]
            isOneToOne: false
            referencedRelation: "room_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      course_groups: {
        Row: {
          course_id: string | null
          group_id: string | null
          id: string
        }
        Insert: {
          course_id?: string | null
          group_id?: string | null
          id?: string
        }
        Update: {
          course_id?: string | null
          group_id?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_groups_course_id_courses_id_fk"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_groups_group_id_groups_id_fk"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          course_type: Database["public"]["Enums"]["CourseType"] | null
          id: string
          instructor: string | null
          name: string | null
        }
        Insert: {
          course_type?: Database["public"]["Enums"]["CourseType"] | null
          id?: string
          instructor?: string | null
          name?: string | null
        }
        Update: {
          course_type?: Database["public"]["Enums"]["CourseType"] | null
          id?: string
          instructor?: string | null
          name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "courses_instructor_teachers_id_fk"
            columns: ["instructor"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      groups: {
        Row: {
          id: string
          name: string | null
        }
        Insert: {
          id?: string
          name?: string | null
        }
        Update: {
          id?: string
          name?: string | null
        }
        Relationships: []
      }
      plan_seats: {
        Row: {
          id: string
          plan_id: string | null
          seat_id: string | null
        }
        Insert: {
          id?: string
          plan_id?: string | null
          seat_id?: string | null
        }
        Update: {
          id?: string
          plan_id?: string | null
          seat_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "plan_seats_plan_id_room_plans_id_fk"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "room_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plan_seats_seat_id_seats_id_fk"
            columns: ["seat_id"]
            isOneToOne: false
            referencedRelation: "seats"
            referencedColumns: ["id"]
          },
        ]
      }
      programs: {
        Row: {
          id: string
          name: string | null
        }
        Insert: {
          id?: string
          name?: string | null
        }
        Update: {
          id?: string
          name?: string | null
        }
        Relationships: []
      }
      room_plans: {
        Row: {
          id: string
          name: string | null
          number_of_rows: number | null
          number_of_seats: number | null
        }
        Insert: {
          id?: string
          name?: string | null
          number_of_rows?: number | null
          number_of_seats?: number | null
        }
        Update: {
          id?: string
          name?: string | null
          number_of_rows?: number | null
          number_of_seats?: number | null
        }
        Relationships: []
      }
      schoolyears: {
        Row: {
          begin: string
          end: string
          id: string
          is_visible: boolean | null
          name: string
        }
        Insert: {
          begin: string
          end: string
          id?: string
          is_visible?: boolean | null
          name: string
        }
        Update: {
          begin?: string
          end?: string
          id?: string
          is_visible?: boolean | null
          name?: string
        }
        Relationships: []
      }
      seances: {
        Row: {
          classroom_id: string | null
          course_id: string | null
          end_time: string | null
          id: string
          start_time: string | null
        }
        Insert: {
          classroom_id?: string | null
          course_id?: string | null
          end_time?: string | null
          id?: string
          start_time?: string | null
        }
        Update: {
          classroom_id?: string | null
          course_id?: string | null
          end_time?: string | null
          id?: string
          start_time?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "seances_classroom_id_classrooms_id_fk"
            columns: ["classroom_id"]
            isOneToOne: false
            referencedRelation: "classrooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seances_course_id_courses_id_fk"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      seats: {
        Row: {
          id: string
          number: number | null
          row: string | null
        }
        Insert: {
          id?: string
          number?: number | null
          row?: string | null
        }
        Update: {
          id?: string
          number?: number | null
          row?: string | null
        }
        Relationships: []
      }
      student_groups: {
        Row: {
          group_id: string | null
          student_id: string | null
        }
        Insert: {
          group_id?: string | null
          student_id?: string | null
        }
        Update: {
          group_id?: string | null
          student_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_groups_group_id_groups_id_fk"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_groups_student_id_students_id_fk"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      student_presences: {
        Row: {
          id: string
          is_present: boolean | null
          seance_id: string | null
          student_id: string | null
        }
        Insert: {
          id?: string
          is_present?: boolean | null
          seance_id?: string | null
          student_id?: string | null
        }
        Update: {
          id?: string
          is_present?: boolean | null
          seance_id?: string | null
          student_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_presences_seance_id_seances_id_fk"
            columns: ["seance_id"]
            isOneToOne: false
            referencedRelation: "seances"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_presences_student_id_students_id_fk"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      student_seatings: {
        Row: {
          id: string
          seance_id: string | null
          seat_id: string | null
          student_id: string | null
        }
        Insert: {
          id?: string
          seance_id?: string | null
          seat_id?: string | null
          student_id?: string | null
        }
        Update: {
          id?: string
          seance_id?: string | null
          seat_id?: string | null
          student_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_seatings_seance_id_seances_id_fk"
            columns: ["seance_id"]
            isOneToOne: false
            referencedRelation: "seances"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_seatings_seat_id_seats_id_fk"
            columns: ["seat_id"]
            isOneToOne: false
            referencedRelation: "seats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_seatings_student_id_students_id_fk"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      student_types: {
        Row: {
          id: string
          name: string
        }
        Insert: {
          id?: string
          name: string
        }
        Update: {
          id?: string
          name?: string
        }
        Relationships: []
      }
      students: {
        Row: {
          created_by: string | null
          created_on: string | null
          id: string
          photo: string | null
          status: string | null
          student_number: string | null
          student_type: string | null
          student_user_account: string | null
          validated_by: string | null
          validated_on: string | null
        }
        Insert: {
          created_by?: string | null
          created_on?: string | null
          id?: string
          photo?: string | null
          status?: string | null
          student_number?: string | null
          student_type?: string | null
          student_user_account?: string | null
          validated_by?: string | null
          validated_on?: string | null
        }
        Update: {
          created_by?: string | null
          created_on?: string | null
          id?: string
          photo?: string | null
          status?: string | null
          student_number?: string | null
          student_type?: string | null
          student_user_account?: string | null
          validated_by?: string | null
          validated_on?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "students_created_by_users_id_fk"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_student_type_student_types_id_fk"
            columns: ["student_type"]
            isOneToOne: false
            referencedRelation: "student_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_student_user_account_users_id_fk"
            columns: ["student_user_account"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_validated_by_users_id_fk"
            columns: ["validated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      teachers: {
        Row: {
          id: string
          is_internal: boolean | null
          teacher_user_account: string | null
        }
        Insert: {
          id?: string
          is_internal?: boolean | null
          teacher_user_account?: string | null
        }
        Update: {
          id?: string
          is_internal?: boolean | null
          teacher_user_account?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "teachers_teacher_user_account_users_id_fk"
            columns: ["teacher_user_account"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          birth_date: string | null
          email: string
          first_name: string | null
          github_user: string | null
          gitlab_user: string | null
          id: string
          last_name: string | null
          mobile_phone: string | null
          other_email: string | null
          role: Database["public"]["Enums"]["UserType"] | null
        }
        Insert: {
          birth_date?: string | null
          email: string
          first_name?: string | null
          github_user?: string | null
          gitlab_user?: string | null
          id?: string
          last_name?: string | null
          mobile_phone?: string | null
          other_email?: string | null
          role?: Database["public"]["Enums"]["UserType"] | null
        }
        Update: {
          birth_date?: string | null
          email?: string
          first_name?: string | null
          github_user?: string | null
          gitlab_user?: string | null
          id?: string
          last_name?: string | null
          mobile_phone?: string | null
          other_email?: string | null
          role?: Database["public"]["Enums"]["UserType"] | null
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
      ClassroomType: "PC" | "cours"
      CourseType: "CM" | "TD" | "TP" | "Examen_CCI" | "Examen_CCF" | "Session_2"
      UserType: "admin" | "teacher" | "student"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never
