import fs from "fs";
import path from "path";
import { remark } from "remark";
import html from "remark-html";
import Link from "next/link";
import styles from "../mypage.module.scss";

/**
 * @param {{ searchParams?: { [key: string]: string | string[] | undefined } }} param0
 */
export default async function HelpPage({
  searchParams,
}: {
  searchParams?: any;
}) {
  const langParam = searchParams?.lang;
  const lang = Array.isArray(langParam) ? langParam[0] : langParam;
  const langCode = lang === "en" ? "en" : "ja";
  const filePath = path.join(process.cwd(), `src/content/help.${langCode}.md`);
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
                langCode === "ja"
                  ? styles.helpLangActive
                  : styles.helpLangInactive
              }
            >
              日
            </span>
          </Link>
          <span className={styles.helpLangDivider}>/</span>
          <Link href="/mypage/help?lang=en">
            <span
              className={
                langCode === "en"
                  ? styles.helpLangActive
                  : styles.helpLangInactive
              }
            >
              EN
            </span>
          </Link>
        </div>
      </div>
      <h1 className={styles.title}>{langCode === "ja" ? "ヘルプ" : "Help"}</h1>
      <div
        className={styles.helpContent}
        dangerouslySetInnerHTML={{ __html: contentHtml }}
      />
    </div>
  );
}
