import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

// GET: 一覧取得（ユーザーごと）
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const user_id = searchParams.get("user_id");
  // language_pair_idでのフィルタも将来的に可能
  // const language_pair_id = searchParams.get("language_pair_id");
  if (!user_id) return NextResponse.json({ error: "user_id required" }, { status: 400 });
  let query = supabase
    .from("idioms")
    .select("*")
    .eq("user_id", user_id)
    .order("created_at", { ascending: false });
  // if (language_pair_id) query = query.eq("language_pair_id", language_pair_id);
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST: idiom追加（main_word, main_word_translations, explanation, user_id, language_pair_id）
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { main_word, main_word_translations, explanation, user_id, language_pair_id } = body;
  if (!main_word || !user_id) {
    return NextResponse.json({ error: "main_word and user_id required" }, { status: 400 });
  }
  // 既存チェック
  const { data: existing, error: findError } = await supabase
    .from("idioms")
    .select("*")
    .eq("user_id", user_id)
    .eq("main_word", main_word)
    .maybeSingle();
  if (findError) return NextResponse.json({ error: findError.message }, { status: 500 });
  if (existing) return NextResponse.json(existing);
  // 新規insert
  const { data, error } = await supabase
    .from("idioms")
    .insert([
      {
        user_id,
        main_word,
        main_word_translations,
        explanation,
        language_pair_id,
        created_at: new Date().toISOString(),
      },
    ])
    .select()
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}