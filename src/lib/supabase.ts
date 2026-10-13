import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

export interface Profile {
  id: string;
  username: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  cover_image_url: string | null;
  bio: string | null;
  date_of_birth: string | null;
  anniversary_date: string | null;
  partner_id: string | null;
  theme_color: string;
  created_at: string;
  updated_at: string;
}

export interface Badge {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  requirement_type: string;
  requirement_value: number;
  category: string;
  rarity: string;
}

export interface GameStats {
  id?: string;
  user_id: string;
  game_type: string;
  total_time_played: number;
  games_played: number;
  wins: number;
  losses: number;
  last_played: string;
}

export interface UserBadge {
  id?: string;
  user_id: string;
  badge_id: string;
  earned_at: string;
  progress: number;
  is_earned: boolean;
  badges?: Badge;
}

export interface GameSession {
  id?: string;
  player1_id: string;
  player2_id: string;
  game_type: string;
  status: string;
  started_at: string;
  ended_at: string;
  result: string;
}

export interface Friendship {
  id?: string;
  user_id: string;
  friend_id: string;
  status: string;
  created_at: string;
}

export type FriendRequest = Friendship;

export interface Notification {
  id?: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  link?: string | null;
  created_at: string;
}

export interface Proposal {
  id?: string;
  from_user_id: string;
  to_user_id: string;
  message: string;
  status: string;
  created_at: string;
}

export interface ProposalCategory {
  id: string;
  title: string;
  emoji: string;
  description: string;
  gradient: string;
  isCustom?: boolean;
}
