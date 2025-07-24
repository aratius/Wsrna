"use client";
import { useEffect, useState } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import { supabase } from "@/lib/supabaseClient";
import "@/styles/_base.scss";
import "@/styles/components/_card.scss";
import supportedLanguages from "@/lib/supportedLanguages.json";

export default function MyQuizzesPage() {
  const session = useSession();
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Language pairs state
  const [languagePairs, setLanguagePairs] = useState<any[]>([]);
  const [lpLoading, setLpLoading] = useState(false);
  const [lpError, setLpError] = useState("");
  const [fromLang, setFromLang] = useState("");
  const [toLang, setToLang] = useState("");
  const [lpAdding, setLpAdding] = useState(false);

  // Fetch language pairs
  useEffect(() => {
    const fetchLanguagePairs = async () => {
      if (!session?.user?.id) return;
      setLpLoading(true);
      setLpError("");
      try {
        const res = await fetch(
          `/api/language-pairs?user_id=${session.user.id}`
        );
        const data = await res.json();
        if (data.error) setLpError(data.error);
        else {
          const newPairs = Array.isArray(data) ? data : [data];
          setLanguagePairs((prev) => [...prev, ...newPairs]);
          setFromLang("");
          setToLang("");
        }
      } catch (e: any) {
        setLpError(e.message);
      } finally {
        setLpLoading(false);
      }
    };
    fetchLanguagePairs();
  }, [session]);

  // Add language pair
  const handleAddPair = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromLang || !toLang || fromLang === toLang) return;
    setLpAdding(true);
    setLpError("");
    try {
      const res = await fetch("/api/language-pairs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: session.user.id,
          from_lang: fromLang,
          to_lang: toLang,
        }),
      });
      const data = await res.json();
      if (data.error) setLpError(data.error);
      else {
        const newPairs = Array.isArray(data) ? data : [data];
        setLanguagePairs((prev) => [...prev, ...newPairs]);
        setFromLang("");
        setToLang("");
      }
    } catch (e: any) {
      setLpError(e.message);
    } finally {
      setLpAdding(false);
    }
  };

  // Delete language pair
  const handleDeletePair = async (id: string) => {
    if (!confirm("Delete this language pair?")) return;
    setLpError("");
    try {
      const res = await fetch("/api/language-pairs", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (data.error) setLpError(data.error);
      else setLanguagePairs((prev) => prev.filter((lp) => lp.id !== id));
    } catch (e: any) {
      setLpError(e.message);
    }
  };

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
    <div style={{ padding: "24px 0" }}>
      {/* Language Pair Management Section */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header" style={{ marginBottom: 12 }}>
          Language Pairs
        </div>
        <div className="card-body">
          {lpLoading && <div>Loading...</div>}
          {lpError && (
            <div style={{ color: "#d50000", marginBottom: 8 }}>{lpError}</div>
          )}
          <form
            onSubmit={handleAddPair}
            style={{ display: "flex", gap: 8, marginBottom: 16 }}
          >
            <select
              className="form-control"
              value={fromLang}
              onChange={(e) => setFromLang(e.target.value)}
              required
              style={{ minWidth: 120 }}
            >
              <option value="">From</option>
              {supportedLanguages.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.label}
                </option>
              ))}
            </select>
            <span style={{ alignSelf: "center" }}>→</span>
            <select
              className="form-control"
              value={toLang}
              onChange={(e) => setToLang(e.target.value)}
              required
              style={{ minWidth: 120 }}
            >
              <option value="">To</option>
              {supportedLanguages.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.label}
                </option>
              ))}
            </select>
            <button
              className="btn"
              type="submit"
              disabled={lpAdding || !fromLang || !toLang || fromLang === toLang}
            >
              Add
            </button>
          </form>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {languagePairs.map((lp) => (
              <li
                key={lp.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 6,
                }}
              >
                <span style={{ minWidth: 90 }}>
                  {supportedLanguages.find((l) => l.code === lp.from_lang)
                    ?.label || lp.from_lang}
                </span>
                <span style={{ fontSize: 18 }}>→</span>
                <span style={{ minWidth: 90 }}>
                  {supportedLanguages.find((l) => l.code === lp.to_lang)
                    ?.label || lp.to_lang}
                </span>
                <button
                  className="btn"
                  style={{ marginLeft: 12, background: "#ff3b30" }}
                  type="button"
                  onClick={() => handleDeletePair(lp.id)}
                >
                  Delete
                </button>
              </li>
            ))}
            {languagePairs.length === 0 && !lpLoading && (
              <li key="empty">No language pairs found.</li>
            )}
          </ul>
        </div>
      </div>
      {/* Existing Quizzes Section */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header" style={{ marginBottom: 12 }}>
          Saved Quizzes
        </div>
        <div className="card-body">
          {loading && <div>Loading...</div>}
          {error && (
            <div
              className="myquizzes__error"
              style={{ color: "#d50000", marginTop: 8 }}
            >
              {error}
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {quizzes.length === 0 && !loading && <div>No quizzes found.</div>}
            {quizzes.map((quiz) => (
              <div className="card myquizzes__item" key={quiz.id}>
                <div className="card-header" style={{ marginBottom: 8 }}>
                  {quiz.question}
                </div>
                <div className="card-body">
                  <ul
                    className="myquizzes__choices"
                    style={{ marginBottom: 8 }}
                  >
                    {quiz.choices.map((c: string, i: number) => (
                      <li
                        key={i}
                        className={
                          i === quiz.answer
                            ? "myquizzes__choice myquizzes__choice--answer"
                            : "myquizzes__choice"
                        }
                        style={{
                          fontWeight: i === quiz.answer ? 600 : 400,
                          color: i === quiz.answer ? "#007AFF" : undefined,
                        }}
                      >
                        {c}
                      </li>
                    ))}
                  </ul>
                  <div
                    className="myquizzes__explanation"
                    style={{ marginBottom: 8 }}
                  >
                    {quiz.explanation}
                  </div>
                  <div
                    className="myquizzes__meta"
                    style={{ fontSize: 13, color: "#888" }}
                  >
                    <span>Topic: {quiz.topic}</span> /{" "}
                    <span>Level: {quiz.level || "Standard"}</span> /{" "}
                    <span>{new Date(quiz.created_at).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
