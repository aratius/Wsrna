"use client";
import Link from "next/link";
import "../mypage/mypage.module.scss";
import styles from "../mypage/mypage.module.scss";
import { motion } from "framer-motion";

export default function MypageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <motion.div
      className={styles["mypage"]}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <motion.h1
        className={styles["mypage__title"]}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2, delay: 0.1 }}
      >
        <Link href="/mypage">My Page !!</Link>
      </motion.h1>
      {children}
    </motion.div>
  );
}
