import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

// 忘却曲線間隔（例: 1, 3, 7, 14, 30日...）
const intervals = [1, 3, 7, 14, 30, 60, 120];

export async function POST(req: NextRequest) {
  const { user_id, quiz_id, correct } = await req.json();
  if (!user_id || !quiz_id || typeof correct !== 'boolean') {
    return NextResponse.json({ error: 'user_id, quiz_id, correct are required' }, { status: 400 });
  }
  // 現在の進捗取得
  const { data: reviews, error: getError } = await supabase
    .from('quiz_reviews')
    .select('*')
    .eq('user_id', user_id)
    .eq('quiz_id', quiz_id)
    .limit(1);
  if (getError) {
    return NextResponse.json({ error: getError.message }, { status: 500 });
  }
  const review = reviews?.[0];
  let interval_days = 1;
  let correct_streak = 0;
  if (review) {
    correct_streak = correct ? (review.correct_streak || 0) + 1 : 0;
    interval_days = correct ? intervals[Math.min(correct_streak, intervals.length - 1)] : 1;
  } else {
    correct_streak = correct ? 1 : 0;
    interval_days = 1;
  }
  const today = new Date();
  const next_review = new Date(today);
  next_review.setDate(today.getDate() + interval_days);
  // レコードがあればupdate、なければinsert
  let upsertData: any = {
    user_id,
    quiz_id,
    last_reviewed_at: today.toISOString(),
    next_review_at: next_review.toISOString().slice(0, 10),
    interval_days,
    correct_streak,
  };
  let result;
  if (review) {
    const { data, error } = await supabase
      .from('quiz_reviews')
      .update(upsertData)
      .eq('id', review.id)
      .select();
    result = { data, error };
  } else {
    upsertData = { ...upsertData, created_at: today.toISOString() };
    const { data, error } = await supabase
      .from('quiz_reviews')
      .insert([upsertData])
      .select();
    result = { data, error };
  }
  if (result.error) {
    return NextResponse.json({ error: result.error.message }, { status: 500 });
  }
  return NextResponse.json(result.data);
}