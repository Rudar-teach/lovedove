import { Profile } from './supabase';

export type MatchPreferences = {
  id: string;
  user_id: string;
  my_gender: 'male' | 'female' | 'other';
  looking_for: 'male' | 'female' | 'other';
  partner_gender: 'male' | 'female' | 'other' | 'any';
  preferred_age_min: number;
  preferred_age_max: number;
  partner_type: string;
  partner_type_emoji: string;
  description: string | null;
  interests: string[];
  location: string | null;
  looking_for_relationship: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Match = {
  id: string;
  user1_id: string;
  user2_id: string;
  user1_preference: any;
  user2_preference: any;
  match_score: number;
  match_percentage: number;
  status: 'pending' | 'accepted' | 'rejected' | 'connected';
  notified_user1: boolean;
  notified_user2: boolean;
  notification_sent_at: string | null;
  email_sent: boolean;
  whatsapp_sent: boolean;
  created_at: string;
  responded_at: string | null;
};

export type Message = {
  id: string;
  match_id: string;
  sender_id: string;
  receiver_id: string;
  message_text: string;
  message_type: 'text' | 'image' | 'emoji' | 'system';
  read: boolean;
  read_at: string | null;
  created_at: string;
};

export type ChatbotConversation = {
  id: string;
  user_id: string;
  match_id: string | null;
  title: string;
  created_at: string;
  updated_at: string;
};

export type ChatbotMessage = {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
};

export type NotificationType = {
  id: string;
  user_id: string;
  type: 'proposal_received' | 'proposal_accepted' | 'proposal_declined' | 'friend_request' | 'game_invite' | 'match_found';
  title: string;
  message: string;
  data: Record<string, any>;
  read: boolean;
  read_at: string | null;
  created_at: string;
};

export type LoginTracking = {
  id: string;
  user_id: string;
  email: string;
  logged_in_at: string;
  ip_address: string | null;
  user_agent: string | null;
};

export type ActiveUser = {
  user_id: string;
  last_active: string;
  page_url: string | null;
  is_online: boolean;
};

export type AdminStats = {
  totalUsers: number;
  todayLogins: number;
  weekLogins: number;
  monthLogins: number;
  currentlyOnline: number;
  peakHour: string;
  peakUsers: number;
  dailyData: { date: string; logins: number }[];
  hourlyData: { hour: string; users: number }[];
  categoryData: { name: string; count: number }[];
  genderData: { name: string; count: number }[];
};
