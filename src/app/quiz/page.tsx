"use client";
import { useState } from "react";

const LANGS = [
  { code: "ja", label: "日本語" },
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "zh", label: "中文" },
  // 必要に応じて追加
];

export default function QuizPage() {
  const [topic, setTopic] = useState("");
  const [fromLang, setFromLang] = useState("ja");
  const [toLang, setToLang] = useState("en");
  const [loading, setLoading] = useState(false);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [hintLevels, setHintLevels] = useState<{ [key: number]: number }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setQuizzes([]);
    setHintLevels({});
    try {
      const res = await fetch("/api/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, fromLang, toLang }),
      });
      const data = await res.json();
      if (data.error) setError(data.error);
      else if (Array.isArray(data)) setQuizzes(data);
      else setError("APIレスポンスが不正です");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const showNextHint = (idx: number) => {
    setHintLevels((prev) => ({
      ...prev,
      [idx]: Math.min((prev[idx] || 0) + 1, 4),
    }));
  };

  return (
    <div className="quiz">
      <h1 className="quiz__title">多言語クローズ問題生成</h1>
      <form className="quiz__form" onSubmit={handleSubmit}>
        <input
          className="quiz__input"
          type="text"
          placeholder="トピック（例: 過去形, 食べる, 旅行, etc）"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          required
        />
        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
          <select
            className="quiz__input"
            value={fromLang}
            onChange={(e) => setFromLang(e.target.value)}
          >
            {LANGS.map((l) => (
              <option key={l.code} value={l.code}>
                {l.label}
              </option>
            ))}
          </select>
          <span style={{ alignSelf: "center" }}>→</span>
          <select
            className="quiz__input"
            value={toLang}
            onChange={(e) => setToLang(e.target.value)}
          >
            {LANGS.map((l) => (
              <option key={l.code} value={l.code}>
                {l.label}
              </option>
            ))}
          </select>
        </div>
        <button className="btn" type="submit" disabled={loading}>
          {loading ? "生成中..." : "問題を生成"}
        </button>
      </form>
      {error && <div className="quiz__error">{error}</div>}
      <div className="quiz__list">
        {quizzes.map((q, idx) => (
          <div className="card quiz__result" key={idx}>
            <div className="quiz__question">{q.question}</div>
            <div className="quiz__answer">
              正解: <b>{q.answer}</b>
            </div>
            <div className="quiz__sentence-translation">
              訳: {q.sentence_translation}
            </div>
            <div className="quiz__dictionary">
              <b>辞書:</b>
              <ul>
                {q.dictionary &&
                  Object.entries(q.dictionary).map(([word, meaning]) => (
                    <li key={word}>
                      <b>{word}</b>: {String(meaning)}
                    </li>
                  ))}
              </ul>
            </div>
            <div className="quiz__hints">
              <b>ヒント:</b>
              <ul>
                {q.hint_levels &&
                  q.hint_levels
                    .slice(0, hintLevels[idx] || 1)
                    .map((hint: string, i: number) => <li key={i}>{hint}</li>)}
              </ul>
              {q.hint_levels &&
                (hintLevels[idx] || 1) < q.hint_levels.length && (
                  <button
                    className="btn btn--secondary"
                    type="button"
                    onClick={() => showNextHint(idx)}
                  >
                    次のヒントを見る
                  </button>
                )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
