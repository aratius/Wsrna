import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(req: NextRequest) {
  const { user_id, language_pair_id } = await req.json();
  if (!user_id) {
    return NextResponse.json({ error: 'user_id is required' }, { status: 400 });
  }
  if (!language_pair_id) {
    return NextResponse.json({ error: 'language_pair_id is required' }, { status: 400 });
  }
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  const { data, error } = await supabase
    .from('quiz_reviews')
    .select('*, quiz:quizzes(*)')
    .eq('user_id', user_id)
    .lte('next_review_at', today)
    .eq('quiz.language_pair_id', language_pair_id)
    .order('next_review_at', { ascending: true })
    .limit(10);

  if (error) {
    if (error.message && error.message.includes('relation') && error.message.includes('does not exist')) {
      return NextResponse.json({ error: 'Quiz table does not exist. Please contact the administrator.' }, { status: 500 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // quizがnullのものを除外
  const filtered = (data || []).filter(r => r.quiz !== null);
  return NextResponse.json(filtered);
}