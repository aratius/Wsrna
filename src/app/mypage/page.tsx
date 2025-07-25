"use client";
import Link from "next/link";
import styles from "./mypage.module.scss";
import { useEffect, useState } from "react";

const menuItems = [
  { label: "Account Info", href: "/mypage/account" },
  { label: "Language Pairs", href: "/mypage/language-pairs" },
  { label: "Saved Idioms", href: "/mypage/saved-idioms" },
  // 必要に応じて他のメニューも追加
];

export default function MyPage() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 600);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <div className={styles["mypage"]}>
      <h1 className={styles["mypage__title"]}>My Page !!</h1>
      <ul className={styles["mypage__menu-list"]}>
        {menuItems.map((item) => (
          <li key={item.href} className={styles["mypage__menu-item"]}>
            <Link href={item.href} className={styles["mypage__menu-link"]}>
              {item.label}
              <span className={styles["mypage__arrow"]}>&gt;</span>
            </Link>
          </li>
        ))}
        <li className={styles["mypage__menu-item"]}>
          <Link href="/mypage/help" className={styles["mypage__menu-link"]}>
            Help
            <span className={styles["mypage__arrow"]}>&gt;</span>
          </Link>
        </li>
      </ul>
    </div>
  );
}
