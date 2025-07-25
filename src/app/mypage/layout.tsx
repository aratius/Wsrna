import Link from "next/link";
import "../mypage/mypage.module.scss";
import styles from "../mypage/mypage.module.scss";

export default function MypageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles["mypage"]}>
      <h1 className={styles["mypage__title"]}>
        <Link href="/mypage">My Page !!</Link>
      </h1>
      {children}
    </div>
  );
}
