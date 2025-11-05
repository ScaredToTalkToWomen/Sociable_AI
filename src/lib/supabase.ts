import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://zzbiglgjbbjhtraiiddn.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6YmlnbGdqYmJqaHRyYWlpZGRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyNTk0ODIsImV4cCI6MjA3NzgzNTQ4Mn0.aT7wCxwXWcMHEy7x-nA32yFC9geBT-sn6GQsaUJNwRc';

console.log('🔧 Supabase Config:', {
  url: supabaseUrl,
  hasKey: !!supabaseAnonKey,
  envUrl: import.meta.env.VITE_SUPABASE_URL,
  envKey: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'present' : 'missing'
});

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    }
  }
);

export { supabaseUrl, supabaseAnonKey };

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          updated_at?: string;
        };
      };
      social_accounts: {
        Row: {
          id: string;
          user_id: string;
          platform: 'twitter' | 'linkedin' | 'instagram' | 'facebook';
          account_name: string;
          account_handle: string;
          is_connected: boolean;
          access_token: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      content_posts: {
        Row: {
          id: string;
          user_id: string;
          content: string;
          platforms: string[];
          status: 'draft' | 'scheduled' | 'published' | 'failed';
          scheduled_for: string | null;
          published_at: string | null;
          media_urls: string[];
          created_at: string;
          updated_at: string;
        };
      };
      analytics_data: {
        Row: {
          id: string;
          user_id: string;
          post_id: string | null;
          platform: string;
          likes: number;
          comments: number;
          shares: number;
          views: number;
          engagement_rate: number;
          recorded_at: string;
          created_at: string;
        };
      };
      ai_suggestions: {
        Row: {
          id: string;
          user_id: string;
          suggestion_type: 'content' | 'time' | 'hashtag';
          suggestion_data: any;
          status: 'pending' | 'accepted' | 'rejected';
          created_at: string;
        };
      };
    };
  };
};
