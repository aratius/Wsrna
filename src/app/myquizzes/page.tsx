"use client";
import { useEffect, useState } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import { supabase } from "@/lib/supabaseClient";

export default function MyQuizzesPage() {
  const session = useSession();
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchQuizzes = async () => {
      if (!session?.user?.id) return;
      setLoading(true);
      setError("");
      try {
        const { data, error } = await supabase
          .from("quizzes")
          .select("*")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false });
        if (error) setError(error.message);
        else setQuizzes(data || []);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchQuizzes();
  }, [session]);

  if (!session) return null;

  return (
    <div className="myquizzes">
      <h1 className="myquizzes__title">保存済みクイズ一覧</h1>
      {loading && <div>読み込み中...</div>}
      {error && <div className="myquizzes__error">{error}</div>}
      <div className="myquizzes__list">
        {quizzes.length === 0 && !loading && <div>クイズがありません。</div>}
        {quizzes.map((quiz) => (
          <div className="card myquizzes__item" key={quiz.id}>
            <div className="myquizzes__question">{quiz.question}</div>
            <ul className="myquizzes__choices">
              {quiz.choices.map((c: string, i: number) => (
                <li
                  key={i}
                  className={
                    i === quiz.answer
                      ? "myquizzes__choice myquizzes__choice--answer"
                      : "myquizzes__choice"
                  }
                >
                  {c}
                </li>
              ))}
            </ul>
            <div className="myquizzes__explanation">{quiz.explanation}</div>
            <div className="myquizzes__meta">
              <span>トピック: {quiz.topic}</span> /{" "}
              <span>難易度: {quiz.level || "標準"}</span> /{" "}
              <span>{new Date(quiz.created_at).toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
