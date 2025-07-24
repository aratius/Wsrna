"use client";
import { useEffect, useState } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import { useRouter } from "next/navigation";
import supportedLanguages from "@/lib/supportedLanguages.json";

export default function SavedIdiomsPage() {
  const router = useRouter();
  const session = useSession();
  const [idioms, setIdioms] = useState<any[]>([]);
  const [languagePairs, setLanguagePairs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [explanationOpen, setExplanationOpen] = useState<{
    [id: string]: boolean;
  }>({});
  const [selectedPairId, setSelectedPairId] = useState<string>("");

  // idioms取得
  useEffect(() => {
    const fetchIdioms = async () => {
      if (!session?.user?.id) return;
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/idioms?user_id=${session.user.id}`);
        const data = await res.json();
        if (data.error) setError(data.error);
        else setIdioms(data || []);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchIdioms();
  }, [session]);

  // Language Pair取得
  useEffect(() => {
    const fetchPairs = async () => {
      if (!session?.user?.id) return;
      try {
        const res = await fetch(
          `/api/language-pairs?user_id=${session.user.id}`
        );
        const data = await res.json();
        if (Array.isArray(data)) {
          setLanguagePairs(data);
          if (!selectedPairId && data.length > 0) setSelectedPairId(data[0].id);
        }
      } catch {}
    };
    fetchPairs();
  }, [session]);

  if (!session) return null;

  // 選択中のLanguage Pairのidiomsのみ表示
  const filteredIdioms = selectedPairId
    ? idioms.filter((i) => i.language_pair_id === selectedPairId)
    : idioms;

  return (
    <div
      style={{
        background: "#f2f2f7",
        minHeight: "100vh",
        padding: "24px 20px",
      }}
    >
      <button
        onClick={() => router.back()}
        className="btn"
        style={{ marginBottom: 16 }}
      >
        &lt; 戻る
      </button>
      <h2
        style={{
          fontSize: 20,
          fontWeight: 700,
          margin: "0 0 20px 0",
          textAlign: "center",
        }}
      >
        Saved Idioms
      </h2>
      {/* タブUI */}
      <nav
        style={{
          display: "flex",
          gap: 0,
          marginBottom: 20,
          overflowX: "auto",
          borderBottom: "1.5px solid #e0e0e0",
          WebkitOverflowScrolling: "touch",
        }}
        className="tab-scrollbar"
      >
        {languagePairs.map((lp) => {
          const active = selectedPairId === lp.id;
          return (
            <button
              key={lp.id}
              onClick={() => setSelectedPairId(lp.id)}
              style={{
                background: "none",
                border: "none",
                outline: "none",
                borderBottom: active
                  ? "3px solid #007aff"
                  : "3px solid transparent",
                color: active ? "#007aff" : "#888",
                fontWeight: active ? 700 : 500,
                fontSize: 16,
                padding: "10px 18px",
                cursor: "pointer",
                transition: "color 0.2s, border-bottom 0.2s",
                backgroundColor: "transparent",
                whiteSpace: "nowrap",
                marginRight: 2,
              }}
            >
              {(lp.from_lang || "").toUpperCase()}
              <span
                style={{
                  margin: "0 4px",
                  fontSize: 18,
                  fontWeight: 700,
                  color: "inherit",
                }}
              >
                ›
              </span>
              {(lp.to_lang || "").toUpperCase()}
            </button>
          );
        })}
      </nav>
      {loading && <div>Loading...</div>}
      {error && (
        <div style={{ color: "#d50000", marginBottom: 12 }}>{error}</div>
      )}
      {filteredIdioms.length === 0 && !loading ? (
        <div>No idioms saved for this language pair.</div>
      ) : (
        <ul style={{ padding: 0, margin: 0 }}>
          {filteredIdioms.map((idiom, idx) => (
            <li
              key={idiom.id}
              style={{
                marginBottom: 0,
                borderBottom:
                  idx !== filteredIdioms.length - 1
                    ? "1px solid #e0e0e0"
                    : "none",
                padding: "16px 0",
              }}
            >
              <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 4 }}>
                {idiom.main_word}
              </div>
              <div style={{ color: "#888", marginBottom: 8 }}>
                {Array.isArray(idiom.main_word_translations)
                  ? idiom.main_word_translations.join(", ")
                  : idiom.main_word_translations}
              </div>
              <button
                type="button"
                className="btn btn--secondary"
                style={{ fontSize: 15, padding: "4px 12px", marginBottom: 4 }}
                onClick={() =>
                  setExplanationOpen((prev) => ({
                    ...prev,
                    [idiom.id]: !prev[idiom.id],
                  }))
                }
              >
                {explanationOpen[idiom.id]
                  ? "Hide Explanation"
                  : "Show Explanation"}
              </button>
              {explanationOpen[idiom.id] && (
                <div
                  style={{
                    marginTop: 8,
                    color: "#fff",
                    background: "#222",
                    fontSize: 15,
                    borderRadius: 8,
                    padding: "12px 16px",
                  }}
                >
                  {idiom.explanation}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
