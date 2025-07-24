import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

// GET: 一覧取得（user_id必須）
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const user_id = searchParams.get('user_id');
  if (!user_id) {
    return NextResponse.json({ error: 'user_id is required' }, { status: 400 });
  }
  const { data, error } = await supabase
    .from('language_pairs')
    .select('*')
    .eq('user_id', user_id)
    .order('created_at', { ascending: true });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

// POST: 追加（user_id, from_lang, to_lang）
export async function POST(req: NextRequest) {
  const { user_id, from_lang, to_lang } = await req.json();
  if (!user_id || !from_lang || !to_lang) {
    return NextResponse.json({ error: 'user_id, from_lang, to_lang are required' }, { status: 400 });
  }
  const { data, error } = await supabase
    .from('language_pairs')
    .insert([{ user_id, from_lang, to_lang }])
    .select();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

// DELETE: 削除（id必須）
export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 });
  }
  const { error } = await supabase
    .from('language_pairs')
    .delete()
    .eq('id', id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}