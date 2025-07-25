"use client";
import { useEffect, useState } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import supportedLanguages from "@/lib/supportedLanguages.json";
import { useRouter } from "next/navigation";
import styles from "./language-pairs.module.scss";

export default function LanguagePairsPage() {
  const router = useRouter();
  const session = useSession();
  const [languagePairs, setLanguagePairs] = useState<any[]>([]);
  const [lpLoading, setLpLoading] = useState(false);
  const [lpError, setLpError] = useState("");
  const [fromLang, setFromLang] = useState("");
  const [toLang, setToLang] = useState("");
  const [lpAdding, setLpAdding] = useState(false);

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
          setLanguagePairs(newPairs);
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

  const handleAddPair = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session || !fromLang || !toLang || fromLang === toLang) return;
    const exists = languagePairs.some(
      (lp) =>
        lp.from_lang === fromLang &&
        lp.to_lang === toLang &&
        lp.user_id === session.user.id
    );
    if (exists) {
      setLpError("This language pair already exists.");
      return;
    }
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
        setLanguagePairs((prev) => {
          const merged = [...prev, ...newPairs];
          return merged.filter(
            (pair, idx, arr) =>
              arr.findIndex(
                (p) =>
                  p.from_lang === pair.from_lang &&
                  p.to_lang === pair.to_lang &&
                  p.user_id === pair.user_id
              ) === idx
          );
        });
        setFromLang("");
        setToLang("");
      }
    } catch (e: any) {
      setLpError(e.message);
    } finally {
      setLpAdding(false);
    }
  };

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

  if (!session) return null;

  return (
    <div className={styles["lang"]}>
      <h2 className={styles["lang__title"]}>Language Pairs</h2>
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
      <ul className={styles["lang__list"]}>
        {languagePairs.map((lp, idx) => (
          <li key={lp.id} className={styles["lang__list-item"]}>
            <span className={styles["lang__label"]}>
              {supportedLanguages.find((l) => l.code === lp.from_lang)?.label ||
                lp.from_lang}
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
        ))}
        {languagePairs.length === 0 && !lpLoading && (
          <li className={styles["lang__empty"]}>No language pairs found.</li>
        )}
      </ul>
    </div>
  );
}
