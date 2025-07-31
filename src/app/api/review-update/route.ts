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
  const { user_id, quiz_id, correct } = await req.json();
  if (!user_id || !quiz_id || typeof correct !== 'boolean') {
    return NextResponse.json({ error: 'user_id, quiz_id, correct are required' }, { status: 400 });
  }

  // 現在のクイズのidiom_idを取得
  const { data: currentQuiz, error: quizError } = await supabase
    .from('quizzes')
    .select('idiom_id')
    .eq('id', quiz_id)
    .single();

  if (quizError || !currentQuiz) {
    return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
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
    // 連続記録ベースの計算
    const previousStreak = review.correct_streak || 0;
    correct_streak = correct ? previousStreak + 1 : 0;
    interval_days = getIntervalDays(correct_streak);

    console.log('Review update - existing record:', {
      user_id,
      quiz_id,
      correct,
      previousStreak,
      newCorrectStreak: correct_streak,
      interval_days,
      review: review
    });
  } else {
    correct_streak = correct ? 1 : 0;
    interval_days = getIntervalDays(correct_streak);

    console.log('Review update - new record:', {
      user_id,
      quiz_id,
      correct,
      correct_streak,
      interval_days
    });
  }

  const today = new Date();
  const next_review = new Date(today);
  next_review.setDate(today.getDate() + interval_days);

  // 同一イディオムの即座追加を削除（重複出題を防ぐため）
  // 代わりに、適切な間隔で他の問題が自然に出題されるようにする

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
    console.error('Database operation failed:', result.error);
    return NextResponse.json({ error: result.error.message }, { status: 500 });
  }

  console.log('Database operation successful:', {
    operation: review ? 'update' : 'insert',
    result: result.data
  });

  return NextResponse.json(result.data);
}