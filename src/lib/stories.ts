/**
 * Love Dove — Shared Story Wall
 *
 * Stories are little memory cards couples share. Each story has:
 *   - `audience`: 'partner' (only the couple can read it) or
 *     'community' (everyone on the site can read it, /stories page)
 *   - `is_anonymous`: post as "Anonymous" — no name, no @username
 *
 * Every query degrades to an empty result when the table hasn't been
 * migrated yet (PGRST205), so the UI can always render.
 */

import { supabase } from './supabase';

export interface Story {
  id: string;
  author_id: string;
  author_username: string | null;
  is_anonymous: boolean;
  title: string | null;
  body: string;
  emoji: string | null;
  audience: 'partner' | 'community';
  partner_id: string | null;
  likes_count: number;
  created_at: string;
  /** Populated by fetchStoryLikes for the current viewer. */
  liked_by_me?: boolean;
}

export interface StoryInput {
  title?: string;
  body: string;
  emoji?: string;
  audience: 'partner' | 'community';
  partnerId?: string | null;
  isAnonymous?: boolean;
}

function isTableMissing(error: { code?: string; message?: string } | null): boolean {
  return !!error && (error.code === 'PGRST205' || (error.message || '').includes('Could not find the table'));
}

/** Global wall — everything the community can see. */
export async function fetchCommunityStories(limit = 40): Promise<Story[]> {
  const { data, error } = await supabase
    .from('stories')
    .select('*')
    .eq('audience', 'community')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error || !data) return [];
  return data as Story[];
}

/** Private couple stories: mine-for-my-partner and partner's-for-me. */
export async function fetchPartnerStories(userId: string, partnerId: string): Promise<Story[]> {
  const { data, error } = await supabase
    .from('stories')
    .select('*')
    .eq('audience', 'partner')
    .or(`and(author_id.eq.${userId},partner_id.eq.${partnerId}),and(author_id.eq.${partnerId},partner_id.eq.${userId})`)
    .order('created_at', { ascending: false })
    .limit(60);
  if (error || !data) return [];
  return data as Story[];
}

/**
 * Create a story. The author's @username is denormalized into the row so
 * old posts keep their label if a username changes later.
 */
export async function addStory(authorId: string, input: StoryInput): Promise<{ ok: boolean; error?: string }> {
  const body = input.body.trim();
  if (body.length < 3) return { ok: false, error: 'Write a little more first' };

  const { data: me } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', authorId)
    .maybeSingle();

  const { error } = await supabase.from('stories').insert({
    author_id: authorId,
    author_username: me?.username ?? null,
    is_anonymous: input.isAnonymous ? true : false,
    title: input.title?.trim() || null,
    body,
    emoji: input.emoji || null,
    audience: input.audience,
    partner_id: input.partnerId || null,
  });

  if (error) {
    if (isTableMissing(error)) {
      return { ok: false, error: 'The story wall is still being set up — try again in a couple of minutes.' };
    }
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

/** Toggle a like (optimistic-safe: reads current state first). */
export async function toggleStoryLike(storyId: string, userId: string, currentlyLiked: boolean): Promise<void> {
  if (currentlyLiked) {
    await supabase.from('story_likes').delete().eq('story_id', storyId).eq('user_id', userId);
  } else {
    await supabase.from('story_likes').insert({ story_id: storyId, user_id: userId });
  }
}

/** Which of these stories has the current viewer already liked? */
export async function fetchStoryLikes(storyIds: string[], userId: string): Promise<Set<string>> {
  if (storyIds.length === 0) return new Set();
  const { data } = await supabase
    .from('story_likes')
    .select('story_id')
    .in('story_id', storyIds)
    .eq('user_id', userId);
  return new Set((data || []).map((r) => r.story_id));
}
