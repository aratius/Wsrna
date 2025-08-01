"use client";
import Link from "next/link";
import styles from "./mypage.module.scss";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AnimatedMenuItem } from "./components/AnimatedMypageContent";
import PwaInstallButton from "@/components/PwaInstallButton";

const menuItems = [
  { label: "Account Info", href: "/mypage/account" },
  { label: "Language Pairs", href: "/mypage/language-pairs" },
  { label: "Saved Idioms", href: "/mypage/saved-idioms" },
  { label: "Help", href: "/mypage/help" },
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
    <motion.ul
      className={styles["mypage__menu-list"]}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, delay: 0.2 }}
    >
      {menuItems.map((item, index) => (
        <AnimatedMenuItem key={item.href} index={index}>
          <li className={styles["mypage__menu-item"]}>
            <Link href={item.href} className={styles["mypage__menu-link"]}>
              {item.label}
              <span className={styles["mypage__arrow"]}>&gt;</span>
            </Link>
          </li>
        </AnimatedMenuItem>
      ))}

      {/* PWA Install Button */}
      <AnimatedMenuItem index={menuItems.length + 1}>
        <li className={styles["mypage__menu-item"]}>
          <PwaInstallButton />
        </li>
      </AnimatedMenuItem>
    </motion.ul>
  );
}
