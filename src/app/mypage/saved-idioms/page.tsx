"use client";
import { useEffect, useState } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import { useRouter } from "next/navigation";
import supportedLanguages from "@/lib/supportedLanguages.json";
import styles from "./saved-idioms.module.scss";
import { motion } from "framer-motion";
import {
  AnimatedMypageContent,
  AnimatedCard,
  AnimatedListItem,
} from "../components/AnimatedMypageContent";

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

  function getAbbr(code: string) {
    const lang = (supportedLanguages as any[]).find((l) => l.code === code);
    return lang?.abbr || code.toUpperCase();
  }

  return (
    <AnimatedMypageContent isLoading={loading} className={styles["saved"]}>
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
              onClick={() => setSelectedPairId(lp.id)}
              className={[
                styles["saved__tab__button"],
                active ? styles["saved__tab__button--active"] : "",
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
          className={styles["saved__error"]}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          No idioms saved for this language pair.
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
                <button
                  type="button"
                  className={[
                    styles["saved__list-item__explanation-btn"],
                    explanationOpen[idiom.id]
                      ? styles["saved__list-item__explanation-btn--open"]
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
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
                  <div className={styles["saved__list-item__explanation-box"]}>
                    {idiom.explanation}
                  </div>
                )}
              </li>
            </AnimatedListItem>
          ))}
        </ul>
      )}
    </AnimatedMypageContent>
  );
}
