"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./help.module.scss";
import { motion } from "framer-motion";
import { AnimatedMypageContent } from "../components/AnimatedMypageContent";

export default function HelpPage({ searchParams }: { searchParams?: any }) {
  const [contentHtml, setContentHtml] = useState("");
  const [loading, setLoading] = useState(true);

  const langParam = searchParams?.lang;
  const lang = Array.isArray(langParam) ? langParam[0] : langParam;
  const langCode = lang === "en" ? "en" : "ja";

  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/help?lang=${langCode}`);
        const data = await response.json();
        if (data.content) {
          setContentHtml(data.content);
        }
      } catch (error) {
        console.error("Failed to load help content:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [langCode]);

  return (
    <AnimatedMypageContent isLoading={loading} className={styles["help"]}>
      <motion.div
        className={styles["help__header"]}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2, delay: 0.1 }}
      >
        <h1 className={styles["help__header__title"]}>
          {langCode === "ja" ? "ヘルプ" : "Help"}
        </h1>
        <div className={styles["help__header__lang-switch"]}>
          <Link href="/mypage/help?lang=ja">
            <span
              className={
                langCode === "ja"
                  ? styles["help__header__lang-switch__lang--active"]
                  : styles["help__header__lang-switch__lang--inactive"]
              }
            >
              日
            </span>
          </Link>
          <span className={styles["help__header__lang-switch__divider"]}>
            /
          </span>
          <Link href="/mypage/help?lang=en">
            <span
              className={
                langCode === "en"
                  ? styles["help__header__lang-switch__lang--active"]
                  : styles["help__header__lang-switch__lang--inactive"]
              }
            >
              EN
            </span>
          </Link>
        </div>
      </motion.div>
      <motion.div
        className={styles["help__content"]}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2, delay: 0.2 }}
        dangerouslySetInnerHTML={{ __html: contentHtml }}
      />
    </AnimatedMypageContent>
  );
}
