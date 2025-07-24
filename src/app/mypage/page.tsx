import Link from "next/link";
import styles from "./mypage.module.scss";

const menuItems = [
  { label: "Account Info", href: "/mypage/account" },
  { label: "Language Pairs", href: "/mypage/language-pairs" },
  { label: "Saved Idioms", href: "/mypage/saved-idioms" },
  // 必要に応じて他のメニューも追加
];

export default function MyPage() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>My Page</h1>
      <ul className={styles.menuList}>
        {menuItems.map((item, idx) => (
          <li
            key={item.href}
            className={styles.menuItem}
            style={{
              borderBottom:
                idx !== menuItems.length - 1 ? "1px solid #e0e0e0" : "none",
              background: "none",
            }}
          >
            <Link href={item.href} className={styles.menuLink}>
              {item.label}
              <span className={styles.arrow}>&gt;</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
