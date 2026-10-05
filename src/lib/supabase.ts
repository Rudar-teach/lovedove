import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  email: string;
  full_name: string;
  username: string;
  avatar_url: string | null;
  cover_image_url: string | null;
  partner_id: string | null;
  bio: string | null;
  date_of_birth: string | null;
  anniversary_date: string | null;
  theme_color: string;
  created_at: string;
  updated_at: string;
};

export type BirthdaySite = {
  id: string;
  user_id: string;
  name: string;
  message: string;
  photos: string[];
  theme: string;
  slug: string;
  is_public: boolean;
  view_count: number;
  created_at: string;
};

export type FriendRequest = {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
};

export type GameSession = {
  id: string;
  game_type: string;
  players: string[];
  current_turn: string;
  game_state: Record<string, any>;
  status: 'waiting' | 'active' | 'completed';
  winner_id: string | null;
  started_at: string;
  ended_at: string | null;
};

export type Badge = {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement_type: string;
  requirement_value: number;
};

export type UserBadge = {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: string;
  badge?: Badge;
};

export type GameStats = {
  id: string;
  user_id: string;
  game_type: string;
  games_played: number;
  total_time_played: number;
  wins: number;
  losses: number;
  last_played: string;
};
