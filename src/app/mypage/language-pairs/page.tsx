"use client";
import { useEffect, useState } from "react";
import supportedLanguages from "@/lib/supportedLanguages.json";
import { useRouter } from "next/navigation";
import styles from "./language-pairs.module.scss";
import { motion } from "framer-motion";
import {
  AnimatedMypageContent,
  AnimatedCard,
  AnimatedFormField,
} from "../components/AnimatedMypageContent";
import { useAppSelector, useAppDispatch } from "@/lib/hooks";
import {
  addLanguagePair,
  deleteLanguagePair,
  setError,
} from "@/lib/slices/languagePairsSlice";

interface LanguagePair {
  id: string;
  user_id: string;
  from_lang: string;
  to_lang: string;
  created_at: string;
}

export default function LanguagePairsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const {
    pairs: languagePairs,
    isLoading: lpLoading,
    error: lpError,
  } = useAppSelector((state) => state.languagePairs) as {
    pairs: LanguagePair[];
    isLoading: boolean;
    error: string | null;
  };
  const [fromLang, setFromLang] = useState("");
  const [toLang, setToLang] = useState("");
  const [lpAdding, setLpAdding] = useState(false);

  // Reduxストアからlanguage_pairsが自動的に取得されるため、useEffectは不要

  const handleAddPair = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !fromLang || !toLang || fromLang === toLang) return;

    const exists = languagePairs.some(
      (lp: LanguagePair) =>
        lp.from_lang === fromLang &&
        lp.to_lang === toLang &&
        lp.user_id === user.id
    );

    if (exists) {
      dispatch(setError("This language pair already exists."));
      return;
    }

    setLpAdding(true);
    dispatch(setError(null));

    try {
      await dispatch(
        addLanguagePair({
          user_id: user.id,
          from_lang: fromLang,
          to_lang: toLang,
        })
      ).unwrap();

      setFromLang("");
      setToLang("");
    } catch (e: any) {
      dispatch(setError(e.message));
    } finally {
      setLpAdding(false);
    }
  };

  const handleDeletePair = async (id: string) => {
    if (!confirm("Delete this language pair?")) return;
    dispatch(setError(null));

    try {
      await dispatch(deleteLanguagePair(id)).unwrap();
    } catch (e: any) {
      dispatch(setError(e.message));
    }
  };

  if (!user) return null;

  return (
    <AnimatedMypageContent isLoading={lpLoading} className={styles["lang"]}>
      <motion.h2
        className={styles["lang__title"]}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        Language Pairs
      </motion.h2>
      <AnimatedFormField delay={0.1}>
        <form onSubmit={handleAddPair} className={styles["lang__form"]}>
          <select
            className={styles["lang__form__select"]}
            value={fromLang}
            onChange={(e) => setFromLang(e.target.value)}
            required
          >
            <option value="">From</option>
            {supportedLanguages.map((l) => (
              <option key={l.code} value={l.code}>
                {l.label}
              </option>
            ))}
          </select>
          <span className={styles["lang__form__arrow"]}>›</span>
          <select
            className={styles["lang__form__select"]}
            value={toLang}
            onChange={(e) => setToLang(e.target.value)}
            required
          >
            <option value="">To</option>
            {supportedLanguages.map((l) => (
              <option key={l.code} value={l.code}>
                {l.label}
              </option>
            ))}
          </select>
          <button
            className={styles["lang__form__add-btn"]}
            type="submit"
            disabled={lpAdding || !fromLang || !toLang || fromLang === toLang}
          >
            Add
          </button>
        </form>
      </AnimatedFormField>
      <ul className={styles["lang__list"]}>
        {languagePairs.map((lp: LanguagePair, idx: number) => (
          <AnimatedCard key={lp.id} delay={idx * 0.02 + 0.2}>
            <li className={styles["lang__list-item"]}>
              <span className={styles["lang__label"]}>
                {supportedLanguages.find((l) => l.code === lp.from_lang)
                  ?.label || lp.from_lang}
              </span>
              <span className={styles["lang__arrow"]}>›</span>
              <span className={styles["lang__label"]}>
                {supportedLanguages.find((l) => l.code === lp.to_lang)?.label ||
                  lp.to_lang}
              </span>
              <button
                className={styles["lang__delete-btn"]}
                type="button"
                onClick={() => handleDeletePair(lp.id)}
              >
                Delete
              </button>
            </li>
          </AnimatedCard>
        ))}
        {languagePairs.length === 0 && !lpLoading && (
          <AnimatedCard delay={0.1}>
            <li className={styles["lang__empty"]}>No language pairs found.</li>
          </AnimatedCard>
        )}
      </ul>
    </AnimatedMypageContent>
  );
}
