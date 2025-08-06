import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

// 連続記録ベースの間隔設定（連続正解回数に応じて間隔を延長）
const getIntervalDays = (consecutiveCorrect: number): number => {
  if (consecutiveCorrect === 0) return 1; // 不正解時は翌日
  if (consecutiveCorrect === 1) return 2; // 1回正解: 2日後
  if (consecutiveCorrect === 2) return 4; // 2回連続正解: 4日後
  if (consecutiveCorrect === 3) return 7; // 3回連続正解: 7日後
  if (consecutiveCorrect === 4) return 14; // 4回連続正解: 14日後
  if (consecutiveCorrect === 5) return 30; // 5回連続正解: 30日後
  if (consecutiveCorrect === 6) return 60; // 6回連続正解: 60日後
  return 120; // 7回以上連続正解: 120日後
};

export async function POST(req: NextRequest) {
  const { user_id, idiom_id, correct } = await req.json();
  if (!user_id || !idiom_id || typeof correct !== 'boolean') {
    return NextResponse.json({ error: 'user_id, idiom_id, correct are required' }, { status: 400 });
  }

  // 現在のidiomの進捗を取得
  const { data: idioms, error: getError } = await supabase
    .from('idioms')
    .select('*')
    .eq('id', idiom_id)
    .eq('user_id', user_id)
    .limit(1);

  if (getError) {
    return NextResponse.json({ error: getError.message }, { status: 500 });
  }

  const idiom = idioms?.[0];
  if (!idiom) {
    return NextResponse.json({ error: 'Idiom not found' }, { status: 404 });
  }

  // 連続記録ベースの計算
  const previousStreak = idiom.correct_streak || 0;
  const correct_streak = correct ? previousStreak + 1 : 0;
  const interval_days = getIntervalDays(correct_streak);

  console.log('Idiom update:', {
    user_id,
    idiom_id,
    correct,
    previousStreak,
    newCorrectStreak: correct_streak,
    interval_days
  });

  const today = new Date();
  const next_review = new Date(today);
  next_review.setDate(today.getDate() + interval_days);

  // idiomsテーブルを更新
  const { data, error } = await supabase
    .from('idioms')
    .update({
      correct_streak,
      next_review_at: next_review.toISOString().slice(0, 10)
    })
    .eq('id', idiom_id)
    .select();

  if (error) {
    console.error('Database operation failed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  console.log('Database operation successful:', {
    operation: 'update',
    result: data
  });

  return NextResponse.json(data);
}