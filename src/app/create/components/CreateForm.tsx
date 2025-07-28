import React from "react";
import styles from "../create.module.scss";
import supportedLanguages from "@/lib/supportedLanguages.json";

interface CreateFormProps {
  languagePairs: any[];
  pairLoading: boolean;
  pairError: string;
  selectedPairId: string;
  fromTranslation: string;
  toText: string;
  fromLangGreeting: string;
  toLangGreeting: string;
  loading: boolean;
  error: string;
  onSelectPair: (pairId: string) => void;
  onFromTranslationChange: (value: string) => void;
  onToTextChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function CreateForm({
  languagePairs,
  pairLoading,
  pairError,
  selectedPairId,
  fromTranslation,
  toText,
  fromLangGreeting,
  toLangGreeting,
  loading,
  error,
  onSelectPair,
  onFromTranslationChange,
  onToTextChange,
  onSubmit,
}: CreateFormProps) {
  function getAbbr(code: string) {
    const lang = (supportedLanguages as any[]).find((l) => l.code === code);
    return lang?.label;
  }

  return (
    <div className={styles["create__form"]}>
      {pairError && (
        <div className={styles["create__form__error"]}>{pairError}</div>
      )}
      {languagePairs.length === 0 && !pairLoading ? (
        <div className={styles["create__form__error"]}>
          No language pairs found. Please register a pair in My Page first.
        </div>
      ) : (
        <form className={styles["create__form__container"]} onSubmit={onSubmit}>
          <div className={styles["create__form__field"]}>
            <label
              className={styles["create__form__field__label"]}
              htmlFor="language-pair-select"
            >
              Language
            </label>
            <select
              id="language-pair-select"
              className={
                styles["create__form__control"] +
                " " +
                styles["create__form__control--select"]
              }
              value={selectedPairId}
              onChange={(e) => onSelectPair(e.target.value)}
              required
            >
              <option value="">Select language pair (From → To)</option>
              {languagePairs.map((lp) => (
                <option key={lp.id} value={lp.id}>
                  {getAbbr(lp.from_lang)} › {getAbbr(lp.to_lang)}
                </option>
              ))}
            </select>
          </div>
          <div className={styles["create__form__field"]}>
            <label
              className={styles["create__form__field__label"]}
              htmlFor="from-translation"
            >
              From
            </label>
            <input
              id="from-translation"
              className={
                styles["create__form__control"] +
                " " +
                styles["create__form__control--input"]
              }
              type="text"
              placeholder={`ex: ${fromLangGreeting}`}
              value={fromTranslation}
              onChange={(e) => onFromTranslationChange(e.target.value)}
            />
          </div>
          <div className={styles["create__form__field"]}>
            <label
              className={styles["create__form__field__label"]}
              htmlFor="to-text"
            >
              To
              <span className={styles["create__form__field__required"]}>*</span>
            </label>
            <input
              id="to-text"
              className={
                styles["create__form__control"] +
                " " +
                styles["create__form__control--input"]
              }
              type="text"
              placeholder={`ex: ${toLangGreeting}`}
              value={toText}
              onChange={(e) => onToTextChange(e.target.value)}
              required
            />
          </div>
          <button
            className={styles["create__form__button"]}
            type="submit"
            disabled={loading || !selectedPairId}
          >
            {loading ? "Creating..." : "Create"}
          </button>
        </form>
      )}
      {error && <div className={styles["create__form__error"]}>{error}</div>}
    </div>
  );
}
