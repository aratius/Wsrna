import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(req: NextRequest) {
  const { user_id, level, question, choices, answer, explanation, hint_levels } = await req.json();

  if (!user_id || !question || !choices || answer === undefined) {
    return NextResponse.json({ error: '必須項目が不足しています' }, { status: 400 });
  }

  const { data, error } = await supabase.from('quizzes').insert([
    { user_id, level, question, choices, answer, explanation, hint_levels }
  ]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data });
}