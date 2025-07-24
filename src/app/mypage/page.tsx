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
    <div
      className={
        styles.container + (isMobile ? " " + styles.containerMobile : "")
      }
    >
      <div>
        <h1 className={styles.title}>
          My Page !!
          <hr className={styles.gradientTextHr} />
        </h1>
        <ul className={styles.menuList}>
          {menuItems.map((item, idx) => (
            <li key={item.href} className={styles.menuItem}>
              <Link href={item.href} className={styles.menuLink}>
                {item.label}
                <span className={styles.arrow}>&gt;</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
