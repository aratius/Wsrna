"use client";
import { useEffect, useState } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import "@/styles/_base.scss";
import "@/styles/components/_button.scss";
import "@/styles/components/_form.scss";
import "@/styles/components/_card.scss";

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
    <div style={{ padding: "24px 0" }}>
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header" style={{ marginBottom: 12 }}>
          Today's Review List
        </div>
        <div className="card-body">
          {loading && <div>Loading...</div>}
          {error && (
            <div
              className="review__error"
              style={{ color: "#d50000", marginTop: 8 }}
            >
              {error}
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {reviews.length === 0 && !loading && (
              <div>No quizzes to review.</div>
            )}
            {reviews.map((review) => {
              const quiz = review.quizzes;
              return (
                <div className="card review__item" key={review.id}>
                  <div className="card-header" style={{ marginBottom: 8 }}>
                    {quiz.question}
                  </div>
                  <div className="card-body">
                    <form
                      className="review__form"
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleAnswer(review);
                      }}
                      style={{
                        display: "flex",
                        gap: 8,
                        alignItems: "center",
                        marginBottom: 8,
                      }}
                    >
                      <input
                        className="form-control"
                        type="text"
                        placeholder="Enter the answer"
                        value={answers[review.id] || ""}
                        onChange={(e) =>
                          setAnswers((a) => ({
                            ...a,
                            [review.id]: e.target.value,
                          }))
                        }
                        disabled={results[review.id] !== undefined}
                        style={{ flex: 1 }}
                      />
                      <button
                        className="btn"
                        type="submit"
                        disabled={
                          updating[review.id] ||
                          results[review.id] !== undefined
                        }
                        style={{ minWidth: 80 }}
                      >
                        Submit
                      </button>
                    </form>
                    {results[review.id] !== undefined && (
                      <div
                        className={
                          results[review.id]
                            ? "review__result--correct"
                            : "review__result--incorrect"
                        }
                      >
                        {results[review.id] ? "Correct!" : "Incorrect."}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
