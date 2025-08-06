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

  // 1. idiomsテーブルから今日復習予定のidiomを取得
  // correct_streakが0のものを優先し、その後next_review_atで昇順ソート
  const { data: todayIdioms, error: todayError } = await supabase
    .from('idioms')
    .select('*')
    .eq('user_id', user_id)
    .eq('language_pair_id', language_pair_id)
    .lte('next_review_at', today)
    .order('correct_streak', { ascending: true })
    .order('next_review_at', { ascending: true });

  if (todayError) {
    return NextResponse.json({ error: todayError.message }, { status: 500 });
  }

  // 2. 各idiomに対応するクイズをランダムに1つ取得
  const result = [];
  for (const idiom of todayIdioms || []) {
    const { data: quizzes, error: quizError } = await supabase
      .from('quizzes')
      .select('*')
      .eq('idiom_id', idiom.id)

    if (quizError) {
      console.error(`Error fetching quizzes for idiom ${idiom.id}:`, quizError);
      continue;
    }

    if (quizzes && quizzes.length > 0) {
      result.push({
        ...idiom,
        quiz: quizzes[Math.floor(Math.random() * quizzes.length)]
      });
    }
  }

  // 3. 最大10問まで返す（1日の上限）
  const finalResult = result.slice(0, 10);
  return NextResponse.json(finalResult);
}