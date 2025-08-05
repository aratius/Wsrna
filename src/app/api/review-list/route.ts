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

  // 1. 今日復習予定のクイズを取得（next_review_atで古い順に並べ替え）
  // correct_streakが0のものを優先し、その後next_review_atで昇順ソート
  const { data: todayReviews, error: todayError } = await supabase
    .from('quiz_reviews')
    .select('*, quiz:quizzes(*)')
    .eq('user_id', user_id)
    .lte('next_review_at', today)
    .eq('quiz.language_pair_id', language_pair_id)
    .order('correct_streak', { ascending: true })
    .order('next_review_at', { ascending: true });

  if (todayError) {
    if (todayError.message && todayError.message.includes('relation') && todayError.message.includes('does not exist')) {
      return NextResponse.json({ error: 'Quiz table does not exist. Please contact the administrator.' }, { status: 500 });
    }
    return NextResponse.json({ error: todayError.message }, { status: 500 });
  }

  // quizがnullのものを除外
  const validTodayReviews = (todayReviews || []).filter(r => r.quiz !== null);

    // 2. 最大10問まで返す（1日の上限）
  const result = validTodayReviews.slice(0, 10);
  return NextResponse.json(result);
}