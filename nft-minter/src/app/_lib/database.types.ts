export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          user_id: string
          username: string | null
          wallet_address: string
          bio: string | null
          avatar_url: string | null
          website: string | null
          twitter: string | null
          instagram: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          username?: string | null
          wallet_address: string
          bio?: string | null
          avatar_url?: string | null
          website?: string | null
          twitter?: string | null
          instagram?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          username?: string | null
          wallet_address?: string
          bio?: string | null
          avatar_url?: string | null
          website?: string | null
          twitter?: string | null
          instagram?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      nfts: {
        Row: {
          id: string
          title: string
          description: string | null
          image_url: string
          creator_id: string
          owner_id: string
          contract_address: string | null
          token_id: string | null
          chain_id: number
          price: number | null
          currency: string | null
          is_listed: boolean
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          image_url: string
          creator_id: string
          owner_id: string
          contract_address?: string | null
          token_id?: string | null
          chain_id: number
          price?: number | null
          currency?: string | null
          is_listed?: boolean
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          image_url?: string
          creator_id?: string
          owner_id?: string
          contract_address?: string | null
          token_id?: string | null
          chain_id?: number
          price?: number | null
          currency?: string | null
          is_listed?: boolean
          created_at?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "nfts_creator_id_fkey"
            columns: ["creator_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nfts_owner_id_fkey"
            columns: ["owner_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      collections: {
        Row: {
          id: string
          name: string
          description: string | null
          image_url: string | null
          banner_url: string | null
          creator_id: string
          contract_address: string | null
          chain_id: number | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          image_url?: string | null
          banner_url?: string | null
          creator_id: string
          contract_address?: string | null
          chain_id?: number | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          image_url?: string | null
          banner_url?: string | null
          creator_id?: string
          contract_address?: string | null
          chain_id?: number | null
          created_at?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "collections_creator_id_fkey"
            columns: ["creator_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
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