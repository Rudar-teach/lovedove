import { createClient } from '@supabase/supabase-js';
import { type Profile } from '@/lib/supabase';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: Request) {
  try {
    const code = new URL(request.url).searchParams.get('code');
    const next = new URL(request.url).searchParams.get('next') ?? '/dashboard';

    if (code) {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      if (error || !data.user) {
        return Response.redirect(
          `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/auth/login?error=auth_callback_error`,
          302
        );
      }

      // Ensure a profile row exists for the new user
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', data.user.id)
        .maybeSingle();

      if (!existingProfile) {
        const userName =
          (data.user.user_metadata?.full_name as string | undefined) ??
          (data.user.user_metadata?.name as string | undefined) ??
          data.user.email?.split('@')[0] ??
          'User';

        const username = userName
          .toLowerCase()
          .replace(/[^a-z0-9_]/g, '_')
          .replace(/_+/g, '_')
          .slice(0, 30);

        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email: data.user.email ?? '',
            full_name: userName,
            username,
            avatar_url: (data.user.user_metadata?.avatar_url as string | null) ?? null,
            cover_image_url: null,
            partner_id: null,
            bio: null,
            date_of_birth: null,
            anniversary_date: null,
            theme_color: '#e91e63',
          } as Partial<Profile>);

        if (insertError) {
          console.error('Profile creation error:', insertError);
        }
      }
    }

    return Response.redirect(
      `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}${next}`,
      302
    );
  } catch {
    return Response.json(
      { error: 'Authentication callback failed' },
      { status: 500 }
    );
  }
}
