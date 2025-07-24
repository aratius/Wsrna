"use client";
import { useState, useEffect } from "react";
import "@/styles/_base.scss";
import "@/styles/components/_button.scss";
import "@/styles/components/_form.scss";
import "@/styles/components/_card.scss";
import { useSession } from "@supabase/auth-helpers-react";
import supportedLanguages from "@/lib/supportedLanguages.json";
import { supabase } from "@/lib/supabaseClient";

function QuizPreviewModal({
  open,
  onClose,
  quizzes,
  onSubmit,
  submitting,
}: any) {
  if (!open) return null;
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.3)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          maxWidth: 400,
          width: "90vw",
          maxHeight: "90vh",
          overflowY: "auto",
          padding: 24,
          boxShadow: "0 4px 32px rgba(0,0,0,0.15)",
        }}
      >
        <h2 style={{ marginBottom: 16 }}>Quiz Preview</h2>
        {quizzes.map((q: any, idx: number) => (
          <div
            key={idx}
            style={{
              marginBottom: 20,
              borderBottom: "1px solid #eee",
              paddingBottom: 12,
            }}
          >
            {q.main_word && (
              <div style={{ marginBottom: 8 }}>
                <b>Main word:</b> {q.main_word}
                {Array.isArray(q.main_word_translations) &&
                  q.main_word_translations.length > 0 && (
                    <span style={{ marginLeft: 8, color: "#007AFF" }}>
                      [
                      {q.main_word_translations.map((t: string, i: number) => (
                        <span key={i}>
                          {t}
                          {i < q.main_word_translations.length - 1 ? ", " : ""}
                        </span>
                      ))}
                      ]
                    </span>
                  )}
              </div>
            )}
            <div style={{ marginBottom: 8 }}>
              <b>Quiz:</b> {q.question}
            </div>
            <div style={{ marginBottom: 8 }}>
              <b>Answer:</b> {q.answer}
            </div>
            <div style={{ marginBottom: 8 }}>
              <b>Translation:</b> {q.sentence_translation}
            </div>
          </div>
        ))}
        <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
          <button
            className="btn"
            onClick={onClose}
            style={{ flex: 1, background: "#ccc", color: "#222" }}
          >
            Close
          </button>
          <button
            className="btn"
            onClick={onSubmit}
            style={{ flex: 2 }}
            disabled={submitting}
          >
            {submitting ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CreatePage() {
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
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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

  // Restore last selected language pair from localStorage
  useEffect(() => {
    const lastPairId = localStorage.getItem("lastSelectedPairId");
    if (lastPairId) setSelectedPairId(lastPairId);
  }, []);

  // Save selected language pair to localStorage
  useEffect(() => {
    if (selectedPairId) {
      localStorage.setItem("lastSelectedPairId", selectedPairId);
    }
  }, [selectedPairId]);

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
        body: JSON.stringify({
          topic: String(topic),
          fromLang: String(fromLang),
          toLang: String(toLang),
        }),
      });
      const data = await res.json();
      if (data.error) setError(data.error);
      else if (Array.isArray(data)) setQuizzes(data);
      else if (Array.isArray(data.questions)) setQuizzes(data.questions);
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

  // Submit quizzes to Supabase
  const handleSubmitQuizzes = async () => {
    if (!session?.user?.id || quizzes.length === 0) return;
    setSubmitting(true);
    try {
      // 既存main_word一覧を取得
      const { data: existing, error: fetchError } = await supabase
        .from("quizzes")
        .select("main_word")
        .eq("user_id", session.user.id);
      if (fetchError) {
        alert("Failed to check existing quizzes: " + fetchError.message);
        setSubmitting(false);
        return;
      }
      const existingWords = (existing || []).map((q: any) => q.main_word);
      // 重複しないクイズだけをinsert
      const newQuizzes = quizzes.filter(
        (q: any) => q.main_word && !existingWords.includes(q.main_word)
      );
      if (newQuizzes.length === 0) {
        alert("All main words are already registered.");
        setSubmitting(false);
        return;
      }
      // idiomsテーブルにinsert（未登録なら）し、idiom_idを取得
      const quizPayload = [];
      for (const q of newQuizzes) {
        // idioms APIにPOST
        const idiomRes = await fetch("/api/idioms", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: session.user.id,
            main_word: q.main_word,
            main_word_translations: q.main_word_translations,
            explanation: q.explanation,
          }),
        });
        const idiom = await idiomRes.json();
        if (idiom.error || !idiom.id) {
          alert("Failed to save idiom: " + (idiom.error || "No idiom id"));
          setSubmitting(false);
          return;
        }
        quizPayload.push({
          user_id: session.user.id,
          idiom_id: idiom.id,
          question: q.question,
          answer: q.answer,
          main_word: q.main_word,
          main_word_translations: q.main_word_translations,
          sentence_translation: q.sentence_translation,
          explanation: q.explanation,
          topic: q.topic || topic,
          created_at: new Date().toISOString(),
        });
      }
      const { error } = await supabase.from("quizzes").insert(quizPayload);
      if (error) alert("Failed to save quizzes: " + error.message);
      else {
        // 新規クイズ保存後、quiz_reviewsもinsert
        const { data: inserted } = await supabase
          .from("quizzes")
          .select("id")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false })
          .limit(quizPayload.length);
        if (inserted && inserted.length > 0) {
          const reviewPayload = inserted.map((q: any) => ({
            user_id: session.user.id,
            quiz_id: q.id,
            last_reviewed_at: new Date().toISOString(),
            next_review_at: new Date().toISOString().slice(0, 10),
            interval_days: 1,
            correct_streak: 0,
            created_at: new Date().toISOString(),
          }));
          await supabase.from("quiz_reviews").insert(reviewPayload);
        }
        alert("Quizzes saved!");
        setShowModal(false);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!session) return null;

  return (
    <div style={{ padding: "24px 0" }}>
      <QuizPreviewModal
        open={showModal}
        onClose={() => setShowModal(false)}
        quizzes={quizzes}
        onSubmit={handleSubmitQuizzes}
        submitting={submitting}
      />
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header" style={{ marginBottom: 12 }}>
          English Cloze Quiz Creation
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
                {loading ? "Creating..." : "Create"}
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
          {quizzes.length > 0 && (
            <button
              className="btn"
              style={{ marginTop: 16 }}
              onClick={() => setShowModal(true)}
            >
              Preview
            </button>
          )}
        </div>
      </div>
      {/* Remove non-modal quiz preview. Only keep modal-based preview. */}
    </div>
  );
}
