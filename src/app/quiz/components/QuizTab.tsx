"use client";
import supportedLanguages from "@/lib/supportedLanguages.json";
import styles from "../quiz.module.scss";

interface QuizTabProps {
  languagePairs: any[];
  selectedPairId: string;
  onSelectPair: (pairId: string) => void;
}

function getAbbr(code: string) {
  const lang = (supportedLanguages as any[]).find((l) => l.code === code);
  return lang?.abbr || code.toUpperCase();
}

export default function QuizTab({
  languagePairs,
  selectedPairId,
  onSelectPair,
}: QuizTabProps) {
  return (
    <nav className={styles["quiz__tab"]}>
      {languagePairs.map((lp) => {
        const active = selectedPairId === lp.id;
        return (
          <button
            key={lp.id}
            onClick={() => onSelectPair(lp.id)}
            className={[
              styles["quiz__tab__button"],
              active ? styles["quiz__tab__button--active"] : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {getAbbr(lp.from_lang)}
            <span className={styles["quiz__tab-arrow"]}>›</span>
            {getAbbr(lp.to_lang)}
          </button>
        );
      })}
    </nav>
  );
}
