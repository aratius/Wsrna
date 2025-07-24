"use client";
import { useState, useEffect } from "react";
import "@/styles/_base.scss";
import "@/styles/components/_button.scss";
import "@/styles/components/_form.scss";
import "@/styles/components/_card.scss";
import { useSession } from "@supabase/auth-helpers-react";
import supportedLanguages from "@/lib/supportedLanguages.json";

export default function QuizPage() {
  const session = useSession();
  const [topic, setTopic] = useState("");
  const [languagePairs, setLanguagePairs] = useState<any[]>([]);
  const [pairLoading, setPairLoading] = useState(false);
  const [pairError, setPairError] = useState("");
  const [selectedPairId, setSelectedPairId] = useState("");
  const [loading, setLoading] = useState(false);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [hintLevels, setHintLevels] = useState<{ [key: number]: number }>({});

  // Fetch language pairs for the user
  useEffect(() => {
    const fetchPairs = async () => {
      if (!session?.user?.id) return;
      setPairLoading(true);
      setPairError("");
      try {
        const res = await fetch(
          `/api/language-pairs?user_id=${session.user.id}`
        );
        const data = await res.json();
        if (data.error) setPairError(data.error);
        else setLanguagePairs(Array.isArray(data) ? data : [data]);
      } catch (e: any) {
        setPairError(e.message);
      } finally {
        setPairLoading(false);
      }
    };
    fetchPairs();
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPairId) return;
    setLoading(true);
    setError("");
    setQuizzes([]);
    setHintLevels({});
    const pair = languagePairs.find((lp) => lp.id === selectedPairId);
    if (!pair) {
      setError("Please select a language pair.");
      setLoading(false);
      return;
    }
    const fromLang = pair.from_lang;
    const toLang = pair.to_lang;
    try {
      const res = await fetch("/api/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, fromLang, toLang }),
      });
      const data = await res.json();
      if (data.error) setError(data.error);
      else if (Array.isArray(data)) setQuizzes(data);
      else if (typeof data === "object") setQuizzes([data]);
      else setError("API response is invalid: " + JSON.stringify(data));
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

  if (!session) return null;

  return (
    <div style={{ padding: "24px 0" }}>
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header" style={{ marginBottom: 12 }}>
          English Cloze Quiz Generator
        </div>
        <div className="card-body">
          {pairLoading && <div>Loading language pairs...</div>}
          {pairError && (
            <div style={{ color: "#d50000", marginBottom: 8 }}>{pairError}</div>
          )}
          {languagePairs.length === 0 && !pairLoading ? (
            <div style={{ color: "#d50000", marginBottom: 8 }}>
              No language pairs found. Please register a pair in My Page first.
            </div>
          ) : (
            <form
              className="quiz__form"
              onSubmit={handleSubmit}
              style={{ display: "flex", gap: 12, flexDirection: "column" }}
            >
              <select
                className="form-control"
                value={selectedPairId}
                onChange={(e) => setSelectedPairId(e.target.value)}
                required
              >
                <option value="">Select language pair (From → To)</option>
                {languagePairs.map((lp) => (
                  <option key={lp.id} value={lp.id}>
                    {supportedLanguages.find((l) => l.code === lp.from_lang)
                      ?.label || lp.from_lang}
                    {" → "}
                    {supportedLanguages.find((l) => l.code === lp.to_lang)
                      ?.label || lp.to_lang}
                  </option>
                ))}
              </select>
              <input
                className="form-control"
                type="text"
                placeholder="Topic (e.g. past tense, travel, etc)"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                required
              />
              <button
                className="btn"
                type="submit"
                disabled={loading || !selectedPairId}
              >
                {loading ? "Generating..." : "Generate Quiz"}
              </button>
            </form>
          )}
          {error && (
            <div
              className="quiz__error"
              style={{ color: "#d50000", marginTop: 8 }}
            >
              {error}
            </div>
          )}
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {quizzes.map((q, idx) => (
          <div className="card quiz__result" key={idx}>
            <div className="card-header" style={{ marginBottom: 8 }}>
              Quiz
            </div>
            <div className="card-body">
              <div className="quiz__question" style={{ marginBottom: 8 }}>
                {q.question}
              </div>
              <div className="quiz__answer" style={{ marginBottom: 8 }}>
                <b>Answer:</b> {q.answer}
              </div>
              <div
                className="quiz__sentence-translation"
                style={{ marginBottom: 8 }}
              >
                <b>Translation:</b> {q.sentence_translation}
              </div>
              <div className="quiz__dictionary" style={{ marginBottom: 8 }}>
                <b>Dictionary:</b>
                <ul style={{ margin: 0, paddingLeft: 16 }}>
                  {q.dictionary &&
                    Object.entries(q.dictionary).map(([word, meaning]) => (
                      <li key={word}>
                        <b>{word}</b>:{" "}
                        {Array.isArray(meaning)
                          ? meaning.join(", ")
                          : String(meaning)}
                      </li>
                    ))}
                </ul>
              </div>
              <div className="quiz__hints">
                <b>Hints:</b>
                <ul style={{ margin: 0, paddingLeft: 16 }}>
                  {q.hint_levels &&
                    q.hint_levels
                      .slice(0, hintLevels[idx] || 1)
                      .map((hint: string, i: number) => (
                        <li key={i}>{hint}</li>
                      ))}
                </ul>
                {q.hint_levels &&
                  (hintLevels[idx] || 1) < q.hint_levels.length && (
                    <button
                      className="btn btn--secondary"
                      type="button"
                      onClick={() => showNextHint(idx)}
                      style={{ marginTop: 8 }}
                    >
                      Show next hint
                    </button>
                  )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
