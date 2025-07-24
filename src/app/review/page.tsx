"use client";
import { useEffect, useState } from "react";
import { useSession } from "@supabase/auth-helpers-react";

export default function ReviewPage() {
  const session = useSession();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [answers, setAnswers] = useState<{ [id: string]: string }>({});
  const [results, setResults] = useState<{ [id: string]: boolean | null }>({});
  const [updating, setUpdating] = useState<{ [id: string]: boolean }>({});

  useEffect(() => {
    const fetchReviews = async () => {
      if (!session?.user?.id) return;
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/review-list", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: session.user.id }),
        });
        const data = await res.json();
        if (data.error) setError(data.error);
        else setReviews(data || []);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [session]);

  const handleAnswer = async (review: any) => {
    const quiz = review.quizzes;
    const userAnswer = answers[review.id]?.trim();
    if (!userAnswer) return;
    const isCorrect = userAnswer === quiz.answer;
    setResults((prev) => ({ ...prev, [review.id]: isCorrect }));
    setUpdating((prev) => ({ ...prev, [review.id]: true }));
    // 進捗更新API呼び出し
    await fetch("/api/review-update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: review.user_id,
        quiz_id: review.quiz_id,
        correct: isCorrect,
      }),
    });
    setUpdating((prev) => ({ ...prev, [review.id]: false }));
  };

  return (
    <div className="review">
      <h1 className="review__title">今日の復習リスト</h1>
      {loading && <div>読み込み中...</div>}
      {error && <div className="review__error">{error}</div>}
      <div className="review__list">
        {reviews.length === 0 && !loading && (
          <div>復習すべきクイズはありません。</div>
        )}
        {reviews.map((review) => {
          const quiz = review.quizzes;
          return (
            <div className="card review__item" key={review.id}>
              <div className="review__question">{quiz.question}</div>
              <form
                className="review__form"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAnswer(review);
                }}
              >
                <input
                  className="review__input"
                  type="text"
                  placeholder="空欄に入る語を入力"
                  value={answers[review.id] || ""}
                  onChange={(e) =>
                    setAnswers((a) => ({ ...a, [review.id]: e.target.value }))
                  }
                  disabled={results[review.id] !== undefined}
                />
                <button
                  className="btn"
                  type="submit"
                  disabled={
                    updating[review.id] || results[review.id] !== undefined
                  }
                >
                  回答
                </button>
              </form>
              {results[review.id] !== undefined && (
                <div
                  className={
                    results[review.id]
                      ? "review__result review__result--correct"
                      : "review__result review__result--wrong"
                  }
                >
                  {results[review.id]
                    ? "正解！"
                    : `不正解。正解: ${quiz.answer}`}
                </div>
              )}
              <div className="review__sentence-translation">
                訳: {quiz.sentence_translation}
              </div>
              <div className="review__dictionary">
                <b>辞書:</b>
                <ul>
                  {quiz.dictionary &&
                    Object.entries(quiz.dictionary).map(([word, meaning]) => (
                      <li key={word}>
                        <b>{word}</b>: {String(meaning)}
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
