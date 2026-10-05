import { NextResponse } from 'next/server';
import { sendProposalEmail, ProposalEmailData } from '@/lib/email';
import { supabase } from '@/lib/supabase';

export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { to, proposalData } = body;

    // Validate required fields
    if (!proposalData || !proposalData.title) {
      return NextResponse.json(
        { error: 'Missing required proposal data' },
        { status: 400 }
      );
    }

    // Verify the user is authenticated
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Update the proposal to mark email as sent
    if (proposalData.proposalId) {
      await supabase
        .from('proposals')
        .update({ email_sent: true })
        .eq('id', proposalData.proposalId);
    }

    // Send the email
    const result = await sendProposalEmail(to, proposalData as ProposalEmailData);

    return NextResponse.json({
      success: result.success,
      dev: result.dev || false,
    });
  } catch (error: any) {
    console.error('API route error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
