import fs from "fs";
import path from "path";
import { remark } from "remark";
import html from "remark-html";
import Link from "next/link";
import styles from "../mypage.module.scss";

interface Props {
  searchParams?: { lang?: string };
}

export default async function HelpPage({ searchParams }: Props) {
  const lang = searchParams?.lang === "en" ? "en" : "ja";
  const filePath = path.join(process.cwd(), `src/content/help.${lang}.md`);
  const markdown = fs.readFileSync(filePath, "utf8");
  const result = await remark().use(html).process(markdown);
  const contentHtml = result.toString();

  return (
    <div className={styles.helpWrapper}>
      <div className={styles.helpHeader}>
        <Link href="/mypage">
          <button
            className={
              styles.button +
              " " +
              styles.buttonOutlined +
              " " +
              styles.helpBackBtn
            }
          >
            戻る
          </button>
        </Link>
        <div className={styles.helpLangSwitch}>
          <Link href="/mypage/help?lang=ja">
            <span
              className={
                lang === "ja" ? styles.helpLangActive : styles.helpLangInactive
              }
            >
              日
            </span>
          </Link>
          <span className={styles.helpLangDivider}>/</span>
          <Link href="/mypage/help?lang=en">
            <span
              className={
                lang === "en" ? styles.helpLangActive : styles.helpLangInactive
              }
            >
              EN
            </span>
          </Link>
        </div>
      </div>
      <h1 className={styles.title}>{lang === "ja" ? "ヘルプ" : "Help"}</h1>
      <div
        className={styles.helpContent}
        dangerouslySetInnerHTML={{ __html: contentHtml }}
      />
    </div>
  );
}
