"use client";
import { useEffect, useState } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import { useRouter } from "next/navigation";
import supportedLanguages from "@/lib/supportedLanguages.json";
import styles from "./saved-idioms.module.scss";

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
    <div className={styles.container}>
      <button
        onClick={() => router.back()}
        className={`btn ${styles.backButton}`}
      >
        &lt; 戻る
      </button>
      <h2 className={styles.title}>Saved Idioms</h2>
      {/* タブUI */}
      <nav className={styles.tabNav + " tab-scrollbar"}>
        {languagePairs.map((lp) => {
          const active = selectedPairId === lp.id;
          return (
            <button
              key={lp.id}
              onClick={() => setSelectedPairId(lp.id)}
              className={
                styles.tabButton + (active ? " " + styles.activeTab : "")
              }
            >
              {(lp.from_lang || "").toUpperCase()}
              <span className={styles.tabArrow}>›</span>
              {(lp.to_lang || "").toUpperCase()}
            </button>
          );
        })}
      </nav>
      {loading && <div>Loading...</div>}
      {error && <div className={styles.error}>{error}</div>}
      {filteredIdioms.length === 0 && !loading ? (
        <div>No idioms saved for this language pair.</div>
      ) : (
        <ul className={styles.idiomList}>
          {filteredIdioms.map((idiom, idx) => (
            <li
              key={idiom.id}
              className={styles.idiomItem}
              style={{
                borderBottom:
                  idx !== filteredIdioms.length - 1
                    ? "1px solid #e0e0e0"
                    : "none",
              }}
            >
              <div className={styles.mainWord}>{idiom.main_word}</div>
              <div className={styles.translations}>
                {Array.isArray(idiom.main_word_translations)
                  ? idiom.main_word_translations.join(", ")
                  : idiom.main_word_translations}
              </div>
              <button
                type="button"
                className={`btn btn--secondary ${styles.explanationBtn}`}
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
                <div className={styles.explanationBox}>{idiom.explanation}</div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
