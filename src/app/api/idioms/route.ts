import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

// GET: 一覧取得（ユーザーごと）
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const user_id = searchParams.get("user_id");
  // language_pair_idでのフィルタも将来的に可能
  // const language_pair_id = searchParams.get("language_pair_id");
  if (!user_id) return NextResponse.json({ error: "user_id required" }, { status: 400 });

  try {
    // idiomsとquizzesをJOINして一度に取得
    const { data: idiomsWithQuizzes, error } = await supabase
      .from("idioms")
      .select(`
        *,
        quizzes (
          question,
          answer,
          sentence_translation
        )
      `)
      .eq("user_id", user_id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error('Error fetching idioms with quizzes:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 各idiomに対して例文を処理
    const idiomsWithExamples = idiomsWithQuizzes.map((idiom) => {
      const quizzes = idiom.quizzes;
      let exampleSentence = null;
      let sentenceTranslation = null;

      // 最初のクイズから例文を取得
      if (quizzes && quizzes.length > 0) {
        const quiz = quizzes[0];
        if (quiz?.question && quiz?.answer) {
          exampleSentence = quiz.question.replace(/____/g, quiz.answer);
        }
        sentenceTranslation = quiz?.sentence_translation || null;
      }

      return {
        ...idiom,
        example_sentence: exampleSentence,
        sentence_translation: sentenceTranslation
      };
    });

    return NextResponse.json(idiomsWithExamples);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST: idiom追加・更新（main_word, main_word_translations, explanation, user_id, language_pair_id）
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { main_word, main_word_translations, explanation, user_id, language_pair_id } = body;
  if (!main_word || !user_id) {
    return NextResponse.json({ error: "main_word and user_id required" }, { status: 400 });
  }

  try {
    // 既存のidiomをチェック
    const { data: existing, error: findError } = await supabase
      .from("idioms")
      .select("id, created_at, correct_streak, next_review_at")
      .eq("user_id", user_id)
      .eq("main_word", main_word)
      .maybeSingle();

    if (findError) {
      console.error('Error finding existing idiom:', findError);
      return NextResponse.json({ error: findError.message }, { status: 500 });
    }

    let result;
    if (existing) {
      // 既存の場合は更新（created_at, correct_streak, next_review_atは保持）
      const { data, error: updateError } = await supabase
        .from("idioms")
        .update({
          main_word_translations,
          explanation,
          language_pair_id,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id)
        .select()
        .maybeSingle();

      if (updateError) {
        console.error('Error updating idiom:', updateError);
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }

      result = data;
    } else {
      // 新規の場合は挿入
      const { data, error: insertError } = await supabase
        .from("idioms")
        .insert([
          {
            user_id,
            main_word,
            main_word_translations,
            explanation,
            language_pair_id,
            created_at: new Date().toISOString(),
            correct_streak: -1, // 未出題を示す初期値
            next_review_at: new Date().toISOString(),
          },
        ])
        .select()
        .maybeSingle();

      if (insertError) {
        console.error('Error inserting idiom:', insertError);
        return NextResponse.json({ error: insertError.message }, { status: 500 });
      }

      result = data;
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE: idiom削除
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const idiom_id = searchParams.get("idiom_id");
  const user_id = searchParams.get("user_id");

  if (!idiom_id || !user_id) {
    return NextResponse.json({ error: "idiom_id and user_id required" }, { status: 400 });
  }

  try {
    // 関連するquizも削除
    const { error: quizError } = await supabase
      .from("quizzes")
      .delete()
      .eq("idiom_id", idiom_id)
      .eq("user_id", user_id);

    if (quizError) {
      return NextResponse.json({ error: quizError.message }, { status: 500 });
    }

    // idiomを削除
    const { error: idiomError } = await supabase
      .from("idioms")
      .delete()
      .eq("id", idiom_id)
      .eq("user_id", user_id);

    if (idiomError) {
      return NextResponse.json({ error: idiomError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}