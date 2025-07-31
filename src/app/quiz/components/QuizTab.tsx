"use client";
import supportedLanguages from "@/lib/supportedLanguages.json";
import styles from "../quiz.module.scss";
import { motion } from "framer-motion";

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
      {languagePairs.map((lp, index) => {
        const active = selectedPairId === lp.id;
        return (
          <motion.button
            key={lp.id}
            onClick={() => onSelectPair(lp.id)}
            className={
              styles["quiz__tab__button"] +
              (active ? " " + styles["active"] : "")
            }
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: 0.2,
              delay: index * 0.02,
            }}
          >
            {getAbbr(lp.from_lang)}
            <span className={styles["quiz__tab-arrow"]}>›</span>
            {getAbbr(lp.to_lang)}
          </motion.button>
        );
      })}
    </nav>
  );
}
