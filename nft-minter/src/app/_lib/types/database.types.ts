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
      activity_log: {
        Row: {
          action_type: string
          collection_id: string | null
          created_at: string
          details: Json | null
          id: number
          nft_id: string | null
          related_user_id: string | null
          user_id: string
        }
        Insert: {
          action_type: string
          collection_id?: string | null
          created_at?: string
          details?: Json | null
          id?: number
          nft_id?: string | null
          related_user_id?: string | null
          user_id: string
        }
        Update: {
          action_type?: string
          collection_id?: string | null
          created_at?: string
          details?: Json | null
          id?: number
          nft_id?: string | null
          related_user_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_log_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_log_nft_id_fkey"
            columns: ["nft_id"]
            isOneToOne: false
            referencedRelation: "nfts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_log_related_user_id_fkey"
            columns: ["related_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      attributes: {
        Row: {
          created_at: string
          id: number
          name: string
        }
        Insert: {
          created_at?: string
          id?: number
          name: string
        }
        Update: {
          created_at?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      collections: {
        Row: {
          banner_image_url: string | null
          category_id: number | null
          chain_id: number | null
          chain_network: string | null
          contract_address: string | null
          created_at: string
          creator_id: string
          description: string | null
          id: string
          logo_image_url: string | null
          name: string
          predefined_trait_types: Json | null
          royalty_fee_bps: number
          royalty_recipient_address: string
          slug: string
          symbol: string | null
          updated_at: string
        }
        Insert: {
          banner_image_url?: string | null
          category_id?: number | null
          chain_id?: number | null
          chain_network?: string | null
          contract_address?: string | null
          created_at?: string
          creator_id: string
          description?: string | null
          id?: string
          logo_image_url?: string | null
          name: string
          predefined_trait_types?: Json | null
          royalty_fee_bps?: number
          royalty_recipient_address: string
          slug: string
          symbol?: string | null
          updated_at?: string
        }
        Update: {
          banner_image_url?: string | null
          category_id?: number | null
          chain_id?: number | null
          chain_network?: string | null
          contract_address?: string | null
          created_at?: string
          creator_id?: string
          description?: string | null
          id?: string
          logo_image_url?: string | null
          name?: string
          predefined_trait_types?: Json | null
          royalty_fee_bps?: number
          royalty_recipient_address?: string
          slug?: string
          symbol?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "collections_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "collections_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collections_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      collections_categories: {
        Row: {
          created_at: string
          id: number
          name: string
        }
        Insert: {
          created_at?: string
          id?: number
          name: string
        }
        Update: {
          created_at?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      featured_nft_banners: {
        Row: {
          created_at: string
          id: number
          nft_id: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          nft_id?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          nft_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "featured_nft_banners_nft_id_fkey"
            columns: ["nft_id"]
            isOneToOne: false
            referencedRelation: "nfts"
            referencedColumns: ["id"]
          },
        ]
      }
      nft_attributes: {
        Row: {
          attribute_id: number
          attribute_name: string | null
          created_at: string
          id: number
          nft_id: string
          updated_at: string | null
          user_id: string | null
          value: string
        }
        Insert: {
          attribute_id: number
          attribute_name?: string | null
          created_at?: string
          id?: number
          nft_id: string
          updated_at?: string | null
          user_id?: string | null
          value: string
        }
        Update: {
          attribute_id?: number
          attribute_name?: string | null
          created_at?: string
          id?: number
          nft_id?: string
          updated_at?: string | null
          user_id?: string | null
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "nft_attributes_attribute_id_fkey"
            columns: ["attribute_id"]
            isOneToOne: false
            referencedRelation: "attributes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nft_attributes_nft_id_fkey"
            columns: ["nft_id"]
            isOneToOne: false
            referencedRelation: "nfts"
            referencedColumns: ["id"]
          },
        ]
      }
      nfts: {
        Row: {
          chain_id: number
          collection_id: string | null
          contract_address: string
          created_at: string
          creator_id: string
          description: string
          id: string
          image_url: string
          last_sale_currency: string | null
          last_sale_price: string | null
          last_sale_time: string | null
          list_currency: string | null
          list_price: string | null
          list_status: string | null
          lister_address: string | null
          metadata: Json | null
          metadata_url: string | null
          minter_address: string | null
          name: string
          network: string | null
          owner_address: string
          owner_id: string
          status: string | null
          token_id: string | null
          token_uri: string | null
          transaction_hash: string
          updated_at: string
        }
        Insert: {
          chain_id: number
          collection_id?: string | null
          contract_address: string
          created_at?: string
          creator_id: string
          description: string
          id?: string
          image_url: string
          last_sale_currency?: string | null
          last_sale_price?: string | null
          last_sale_time?: string | null
          list_currency?: string | null
          list_price?: string | null
          list_status?: string | null
          lister_address?: string | null
          metadata?: Json | null
          metadata_url?: string | null
          minter_address?: string | null
          name: string
          network?: string | null
          owner_address: string
          owner_id: string
          status?: string | null
          token_id?: string | null
          token_uri?: string | null
          transaction_hash: string
          updated_at?: string
        }
        Update: {
          chain_id?: number
          collection_id?: string | null
          contract_address?: string
          created_at?: string
          creator_id?: string
          description?: string
          id?: string
          image_url?: string
          last_sale_currency?: string | null
          last_sale_price?: string | null
          last_sale_time?: string | null
          list_currency?: string | null
          list_price?: string | null
          list_status?: string | null
          lister_address?: string | null
          metadata?: Json | null
          metadata_url?: string | null
          minter_address?: string | null
          name?: string
          network?: string | null
          owner_address?: string
          owner_id?: string
          status?: string | null
          token_id?: string | null
          token_uri?: string | null
          transaction_hash?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "nfts_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nfts_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nfts_owner_address_fkey"
            columns: ["owner_address"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["wallet_address"]
          },
          {
            foreignKeyName: "nfts_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          blockchain_network: string | null
          buyer_address: string | null
          created_at: string
          currency: string
          currency_address: string | null
          deadline_timestamp: string | null
          expires_at: string | null
          id: string
          nft_address: string | null
          nft_id: string
          nonce: string | null
          offer_amount: string | null
          offer_type: string | null
          offerer_id: string
          offerer_wallet_address: string | null
          order_type: string | null
          price_wei: string | null
          seller_address: string | null
          signature: string | null
          status: string
          token_id: string | null
          transaction_hash: string | null
          updated_at: string
        }
        Insert: {
          blockchain_network?: string | null
          buyer_address?: string | null
          created_at?: string
          currency?: string
          currency_address?: string | null
          deadline_timestamp?: string | null
          expires_at?: string | null
          id?: string
          nft_address?: string | null
          nft_id: string
          nonce?: string | null
          offer_amount?: string | null
          offer_type?: string | null
          offerer_id: string
          offerer_wallet_address?: string | null
          order_type?: string | null
          price_wei?: string | null
          seller_address?: string | null
          signature?: string | null
          status?: string
          token_id?: string | null
          transaction_hash?: string | null
          updated_at?: string
        }
        Update: {
          blockchain_network?: string | null
          buyer_address?: string | null
          created_at?: string
          currency?: string
          currency_address?: string | null
          deadline_timestamp?: string | null
          expires_at?: string | null
          id?: string
          nft_address?: string | null
          nft_id?: string
          nonce?: string | null
          offer_amount?: string | null
          offer_type?: string | null
          offerer_id?: string
          offerer_wallet_address?: string | null
          order_type?: string | null
          price_wei?: string | null
          seller_address?: string | null
          signature?: string | null
          status?: string
          token_id?: string | null
          transaction_hash?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "nft_offers_nft_id_fkey"
            columns: ["nft_id"]
            isOneToOne: false
            referencedRelation: "nfts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nft_offers_offerer_id_fkey"
            columns: ["offerer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          email: string | null
          followers_count: number
          following_count: number
          id: string
          updated_at: string
          username: string | null
          wallet_address: string
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string | null
          followers_count?: number
          following_count?: number
          id?: string
          updated_at?: string
          username?: string | null
          wallet_address: string
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string | null
          followers_count?: number
          following_count?: number
          id?: string
          updated_at?: string
          username?: string | null
          wallet_address?: string
          website?: string | null
        }
        Relationships: []
      }
      transactions: {
        Row: {
          buyer_address: string
          created_at: string
          currency: string
          id: number
          nft_id: string
          price: string
          seller_address: string
          status: string
          transaction_hash: string
          transaction_time: string | null
          transaction_type: string
        }
        Insert: {
          buyer_address: string
          created_at?: string
          currency: string
          id?: number
          nft_id: string
          price: string
          seller_address: string
          status: string
          transaction_hash: string
          transaction_time?: string | null
          transaction_type: string
        }
        Update: {
          buyer_address?: string
          created_at?: string
          currency?: string
          id?: number
          nft_id?: string
          price?: string
          seller_address?: string
          status?: string
          transaction_hash?: string
          transaction_time?: string | null
          transaction_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_nft_id_fkey"
            columns: ["nft_id"]
            isOneToOne: false
            referencedRelation: "nfts"
            referencedColumns: ["id"]
          },
        ]
      }
      user_collections: {
        Row: {
          created_at: string
          id: number
          nft_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: number
          nft_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: number
          nft_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_collections_nft_id_fkey"
            columns: ["nft_id"]
            isOneToOne: false
            referencedRelation: "nfts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_collections_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_following: {
        Row: {
          created_at: string
          follower_id: string | null
          following_id: string | null
          id: number
        }
        Insert: {
          created_at?: string
          follower_id?: string | null
          following_id?: string | null
          id?: number
        }
        Update: {
          created_at?: string
          follower_id?: string | null
          following_id?: string | null
          id?: number
        }
        Relationships: [
          {
            foreignKeyName: "user_following_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_following_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_collections_with_filters_and_sort: {
        Args: {
          p_category_id?: number
          p_user_id?: string
          p_time_range?: string
          p_sort_by?: string
          p_sort_direction?: string
          p_limit?: number
          p_offset?: number
        }
        Returns: {
          id: string
          contract_address: string
          created_at: string
          name: string
          description: string
          logo_image_url: string
          banner_image_url: string
          creator_id: string
          creator: Json
          floor_price: number
          volume: number
          item_count: number
          owner_count: number
        }[]
      }
      get_unique_holders_for_collection: {
        Args: { target_collection_id: string }
        Returns: number
      }
      get_user_collections_with_stats: {
        Args: { p_user_id: string }
        Returns: {
          id: string
          created_at: string
          name: string
          description: string
          logo_image_url: string
          banner_image_url: string
          creator_id: string
          creator: Json
          floor_price: number
          volume: number
          item_count: number
          owner_count: number
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
