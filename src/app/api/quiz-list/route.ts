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

  try {
    // 1. 今日復習予定のidiomを取得（優先順位付き、最大10件）
    const { data: todayIdioms, error: idiomsError } = await supabase
      .from('idioms')
      .select('*')
      .eq('user_id', user_id)
      .eq('language_pair_id', language_pair_id)
      .lte('next_review_at', today)
      .order('correct_streak', { ascending: true })
      .order('next_review_at', { ascending: true })
      .limit(10);

    if (idiomsError) {
      console.error('Error fetching idioms:', idiomsError);
      return NextResponse.json({ error: idiomsError.message }, { status: 500 });
    }

    if (!todayIdioms || todayIdioms.length === 0) {
      return NextResponse.json([]);
    }

    // 2. idiomのクイズ一覧を取得
    const idiomIds = todayIdioms.map(idiom => idiom.id);
    const { data: quizzes, error: quizzesError } = await supabase
      .from('quizzes')
      .select('*')
      .in('idiom_id', idiomIds);

    if (quizzesError) {
      console.error('Error fetching quizzes:', quizzesError);
      return NextResponse.json({ error: quizzesError.message }, { status: 500 });
    }

    // 3. idiom_idごとにクイズをグループ化し、ランダム選択
    const quizzesByIdiom = quizzes.reduce((acc, quiz) => {
      if (!acc[quiz.idiom_id]) {
        acc[quiz.idiom_id] = [];
      }
      acc[quiz.idiom_id].push(quiz);
      return acc;
    }, {} as Record<string, typeof quizzes>);

    // 4. 各idiomに対してランダムなクイズを1つ選択
    const result = todayIdioms
      .map(idiom => {
        const idiomQuizzes = quizzesByIdiom[idiom.id];
        if (!idiomQuizzes || idiomQuizzes.length === 0) {
          return null;
        }

        // ほぼ同一タイミングでのリクエストに対して、同じクイズを返すようにする
        const randomId = new Date().getHours() % idiomQuizzes.length;
        const randomQuiz = idiomQuizzes[randomId];
        return {
          ...idiom,
          quiz: randomQuiz
        };
      })
      .filter(Boolean);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}