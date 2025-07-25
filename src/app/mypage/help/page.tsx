import fs from "fs";
import path from "path";
import { remark } from "remark";
import html from "remark-html";
import Link from "next/link";
import styles from "./help.module.scss";

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
    <div className={styles["help"]}>
      <div className={styles["help__header"]}>
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
      </div>
      <div
        className={styles["help__content"]}
        dangerouslySetInnerHTML={{ __html: contentHtml }}
      />
    </div>
  );
}
