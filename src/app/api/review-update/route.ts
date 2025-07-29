import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

// 忘却曲線間隔（例: 1, 3, 7, 14, 30日...）
const intervals = [1, 3, 7, 14, 30, 60, 120];

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
    correct_streak = correct ? (review.correct_streak || 0) + 1 : 0;
    interval_days = correct ? intervals[Math.min(correct_streak, intervals.length - 1)] : 1;
  } else {
    correct_streak = correct ? 1 : 0;
    interval_days = 1;
  }

  const today = new Date();
  const next_review = new Date(today);
  next_review.setDate(today.getDate() + interval_days);

    // 問題を解いた時（正解・不正解問わず）、同じイディオムセット内の他の問題からランダム選択
  // 同じidiom_idを持つ他のクイズを取得
  const { data: sameIdiomQuizzes, error: idiomError } = await supabase
    .from('quizzes')
    .select('id')
    .eq('idiom_id', currentQuiz.idiom_id)
    .neq('id', quiz_id); // 現在の問題以外

  if (!idiomError && sameIdiomQuizzes && sameIdiomQuizzes.length > 0) {
    // ランダムに1問を選択
    const randomQuiz = sameIdiomQuizzes[Math.floor(Math.random() * sameIdiomQuizzes.length)];

    // 選択された問題の復習レコードを作成/更新
    const { data: randomQuizReviews, error: randomQuizError } = await supabase
      .from('quiz_reviews')
      .select('*')
      .eq('user_id', user_id)
      .eq('quiz_id', randomQuiz.id)
      .limit(1);

    const randomQuizReview = randomQuizReviews?.[0];
    const randomQuizUpsertData = {
      user_id,
      quiz_id: randomQuiz.id,
      last_reviewed_at: today.toISOString(),
      next_review_at: today.toISOString().slice(0, 10), // 今日
      interval_days: 1,
      correct_streak: 0,
    };

    if (randomQuizReview) {
      await supabase
        .from('quiz_reviews')
        .update(randomQuizUpsertData)
        .eq('id', randomQuizReview.id);
    } else {
      await supabase
        .from('quiz_reviews')
        .insert([{ ...randomQuizUpsertData, created_at: today.toISOString() }]);
    }
  }

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