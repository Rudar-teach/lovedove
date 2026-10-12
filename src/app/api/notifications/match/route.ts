import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { matchId, matchName, matchScore, reasons, matchedUserId } = body;

    if (!matchedUserId) {
      return NextResponse.json({ error: 'Missing matched user ID' }, { status: 400 });
    }

    // Get matched user's profile
    const { data: matchedUser } = await supabase
      .from('profiles')
      .select('full_name, username, email')
      .eq('id', matchedUserId)
      .single();

    if (!matchedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Send in-app notification
    await supabase.from('notifications').insert({
      user_id: matchedUserId,
      type: 'match_found',
      title: '💕 New Match Found!',
      message: `Someone matched with you on Love Dove! You have a ${matchScore || 'high'}% compatibility match. Login to connect!`,
      data: { matchId, matchScore, reasons },
    });

    // Attempt email notification
    try {
      await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'}/api/send-proposal-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: matchedUser.email,
          name: matchedUser.full_name || matchedUser.username,
          matchScore,
          reasons,
        }),
      });
    } catch (e) {
      console.log('Email notification could not be sent (email service may not be configured)');
    }

    return NextResponse.json({ success: true, message: 'Notifications sent' });
  } catch (error) {
    console.error('Notification error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
