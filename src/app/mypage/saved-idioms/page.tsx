"use client";
import { useEffect, useState } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import supportedLanguages from "@/lib/supportedLanguages.json";
import styles from "./saved-idioms.module.scss";
import { motion } from "framer-motion";
import {
  AnimatedMypageContent,
  AnimatedCard,
  AnimatedListItem,
} from "../components/AnimatedMypageContent";
import { playButtonClick, playTransition } from "@/lib/soundManager";

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
  const [selectedPairId, setSelectedPairIdState] = useState<string>("");

  // localStorage key for saved-idioms
  const LS_KEY = "saved-idioms_selectedPairId";

  // 初期化時にlocalStorageからselectedPairIdを取得
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(LS_KEY);
      if (stored) setSelectedPairIdState(stored);
    }
  }, []);

  // localStorageに直接値を設定する関数
  const setSelectedPairId = (id: string) => {
    setSelectedPairIdState(id);
    if (typeof window !== "undefined") {
      localStorage.setItem(LS_KEY, id);
    }
  };

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

          // 初回読み込み時のみ初期化処理を行う
          if (data.length > 0 && !selectedPairId) {
            // localStorageに保存された値がある場合、その値が有効な言語ペアIDかチェック
            const stored = localStorage.getItem(LS_KEY);
            if (stored) {
              const isValidPair = data.some((pair) => pair.id === stored);
              if (isValidPair) {
                setSelectedPairId(stored);
              } else {
                setSelectedPairId(data[0].id);
              }
            } else {
              setSelectedPairId(data[0].id);
            }
          }
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

  function getAbbr(code: string) {
    const lang = (supportedLanguages as any[]).find((l) => l.code === code);
    return lang?.abbr || code.toUpperCase();
  }

  return (
    <AnimatedMypageContent isLoading={loading} className={styles["saved"]}>
      <div className={styles["saved__container"]}>
        <motion.h2
          className={styles["saved__title"]}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2, delay: 0 }}
        >
          Saved Idioms
        </motion.h2>
        {/* タブUI */}
        <nav className={styles["saved__tab"]}>
          {languagePairs.map((lp, index) => {
            const active = selectedPairId === lp.id;
            return (
              <motion.button
                key={lp.id}
                onClick={() => {
                  setSelectedPairId(lp.id);
                  playButtonClick();
                }}
                className={[
                  styles["saved__tab__button"],
                  active ? styles["active"] : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  duration: 0.2,
                  delay: index * 0.02,
                }}
              >
                {getAbbr(lp.from_lang)}
                <span className={styles["saved__tab-arrow"]}>›</span>
                {getAbbr(lp.to_lang)}
              </motion.button>
            );
          })}
        </nav>
        <div className={styles["saved__content"]}>
          {error && (
            <motion.div
              className={styles["saved__error"]}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              {error}
            </motion.div>
          )}
          {filteredIdioms.length === 0 && !loading ? (
            <motion.div
              className={styles["saved__no-idioms"]}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div>
                <p>No idioms saved for this language pair.</p>
                <button
                  className={styles["saved__create-button"]}
                  onClick={() => {
                    playButtonClick();
                    window.location.href = `/create?lang_pair=${selectedPairId}`;
                  }}
                >
                  Create New Idioms
                </button>
              </div>
            </motion.div>
          ) : (
            <ul className={styles["saved__list"]}>
              {filteredIdioms.map((idiom, idx) => (
                <AnimatedListItem key={idiom.id} index={idx}>
                  <li className={styles["saved__list-item"]}>
                    <div className={styles["saved__list-item__main-word"]}>
                      {idiom.main_word}
                    </div>
                    <div className={styles["saved__list-item__translations"]}>
                      {Array.isArray(idiom.main_word_translations)
                        ? idiom.main_word_translations.join(", ")
                        : idiom.main_word_translations}
                    </div>
                    <div className={styles["saved__list-item__buttons"]}>
                      <button
                        type="button"
                        className={[
                          styles["saved__list-item__explanation-btn"],
                          explanationOpen[idiom.id] ? " " + styles["open"] : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        onClick={() => {
                          playTransition(!explanationOpen[idiom.id]);
                          setExplanationOpen((prev) => ({
                            ...prev,
                            [idiom.id]: !prev[idiom.id],
                          }));
                        }}
                      >
                        {explanationOpen[idiom.id]
                          ? "- Hide Explanation!"
                          : "+ Show Explanation!"}
                      </button>
                      <button
                        type="button"
                        className={styles["saved__list-item__recreate-btn"]}
                        onClick={async () => {
                          const confirmed = window.confirm(
                            "Would you delete this idiom and regenerate a new one?"
                          );

                          if (confirmed && session?.user?.id) {
                            try {
                              // idiomを削除
                              const deleteRes = await fetch(
                                `/api/idioms?idiom_id=${idiom.id}&user_id=${session.user.id}`,
                                { method: "DELETE" }
                              );

                              if (deleteRes.ok) {
                                // /createに遷移（from、to、lang_pairのクエリパラメータ付き）
                                const fromParam = encodeURIComponent(
                                  idiom.main_word_translations || ""
                                );
                                const toParam = encodeURIComponent(
                                  idiom.main_word || ""
                                );
                                const langPairParam = encodeURIComponent(
                                  idiom.language_pair_id || ""
                                );
                                window.location.href = `/create?from=${fromParam}&to=${toParam}&lang_pair=${langPairParam}`;
                              } else {
                                alert(
                                  "Failed to delete idiom. Please try again."
                                );
                              }
                            } catch (error) {
                              console.error("Error deleting idiom:", error);
                              alert("An error occurred. Please try again.");
                            }
                          }
                        }}
                      >
                        Weird!
                      </button>
                    </div>
                    {explanationOpen[idiom.id] && (
                      <div
                        className={styles["saved__list-item__explanation-box"]}
                      >
                        <div
                          className={styles["saved__list-item__explanation"]}
                        >
                          {idiom.explanation}
                        </div>
                        {idiom.example_sentence && (
                          <div className={styles["saved__list-item__example"]}>
                            <div
                              className={
                                styles["saved__list-item__example-label"]
                              }
                            >
                              Example:
                            </div>
                            <div
                              className={
                                styles["saved__list-item__example-sentence"]
                              }
                            >
                              {idiom.example_sentence}
                              <br />
                              <span className={styles["translation"]}>
                                -{idiom.sentence_translation}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </li>
                </AnimatedListItem>
              ))}
            </ul>
          )}
        </div>
      </div>
    </AnimatedMypageContent>
  );
}
