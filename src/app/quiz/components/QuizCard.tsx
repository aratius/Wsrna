"use client";
import { useState, useEffect } from "react";
import styles from "../quiz.module.scss";
import QuizHintModal from "./QuizHintModal";
import { motion } from "framer-motion";

interface QuizCardProps {
  review: any;
  currentIndex: number;
  totalCount: number;
  answers: { [id: string]: string };
  results: { [id: string]: boolean | null };
  attempts: { [id: string]: number };
  updating: { [id: string]: boolean };
  hintIndexes: { [id: string]: number };
  showHintModal: { [id: string]: boolean };
  detailsOpen: { [id: string]: boolean };
  onAnswer: (review: any) => void;
  onShowHint: (id: string, quiz: any) => void;
  onSetShowHintModal: (
    callback: (prev: { [id: string]: boolean }) => { [id: string]: boolean }
  ) => void;
  onSetDetailsOpen: (
    callback: (prev: { [id: string]: boolean }) => { [id: string]: boolean }
  ) => void;
  onSetAnswers: (
    callback: (prev: { [id: string]: string }) => { [id: string]: string }
  ) => void;
  onNext: () => void;
  onSetHintIndexes: (
    callback: (prev: { [id: string]: number }) => { [id: string]: number }
  ) => void;
}

export default function QuizCard({
  review,
  currentIndex,
  totalCount,
  answers,
  results,
  attempts,
  updating,
  hintIndexes,
  showHintModal,
  detailsOpen,
  onAnswer,
  onShowHint,
  onSetShowHintModal,
  onSetDetailsOpen,
  onSetAnswers,
  onNext,
  onSetHintIndexes,
}: QuizCardProps) {
  // 部分正解の状態を管理
  const [partialCorrectIndexes, setPartialCorrectIndexes] = useState<{
    [id: string]: number[];
  }>({});

  // 進捗に応じた色を決定
  let progressColorClass = "";
  const progressRatio = (currentIndex + 1) / totalCount;
  if (progressRatio >= 0.99) {
    progressColorClass = "green";
  } else if (progressRatio >= 0.7) {
    progressColorClass = "orange";
  }

  // 部分正解の判定ロジック
  const getPartialCorrectIndexes = (
    userAnswer: string,
    correctAnswer: string
  ): number[] => {
    if (!userAnswer || !correctAnswer) return [];

    const userWords = userAnswer.trim().split(/\s+/);
    const correctWords = correctAnswer.trim().split(/\s+/);
    const indexes: number[] = [];

    // 頭から一致している単語のインデックスを収集
    for (let i = 0; i < Math.min(userWords.length, correctWords.length); i++) {
      if (userWords[i].toLowerCase() === correctWords[i].toLowerCase()) {
        indexes.push(i);
      } else {
        // 一致しない単語が見つかったら終了
        break;
      }
    }

    return indexes;
  };

  // inputのchangeイベント（部分正解の計算は行わない）
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const userAnswer = e.target.value;

    // 既存のonSetAnswersを呼び出し
    onSetAnswers((a) => ({
      ...a,
      [review.id]: userAnswer,
    }));
  };

  // 正解を単語に分割し、各単語の文字数に基づいて空欄を生成
  const splitAnswerIntoWords = (answer: string) => {
    return answer.split(/\s+/).filter((word) => word.length > 0);
  };

  // 文字の表示状態を決定する関数
  const shouldShowChar = (
    wordIndex: number,
    charIndex: number,
    word: string
  ) => {
    const isCorrect = results[review.id] === true;
    const isIncorrect = results[review.id] === false;
    const attemptsCount = attempts[review.id] || 0;
    const isShowFullAnswer = isCorrect || (isIncorrect && attemptsCount >= 3);

    // 正解/不正解確定時は全文字表示
    if (isShowFullAnswer) {
      return true;
    }

    // 部分正解の判定
    const partialIndexes = partialCorrectIndexes[review.id] || [];
    if (partialIndexes.includes(wordIndex)) {
      return true;
    }

    // それ以外は透明（文字は配置されているが非表示）
    return false;
  };

  // 文字の色を決定する関数
  const getCharColorClass = (wordIndex: number) => {
    const isCorrect = results[review.id] === true;
    const isIncorrect = results[review.id] === false;
    const attemptsCount = attempts[review.id] || 0;
    const isShowFullAnswer = isCorrect || (isIncorrect && attemptsCount >= 3);

    if (isShowFullAnswer) {
      if (isCorrect) {
        return styles["quiz__word-blank__char--correct"];
      } else if (isIncorrect) {
        return styles["quiz__word-blank__char--incorrect"];
      }
    }

    // 部分正解時は青色で表示
    const partialIndexes = partialCorrectIndexes[review.id] || [];
    if (partialIndexes.includes(wordIndex)) {
      return styles["quiz__word-blank__char--partial"];
    }

    return "";
  };

  return (
    <motion.div
      className={styles["quiz__card"]}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* プログレスバー */}
      <div className={styles["quiz__progress__wrapper"]}>
        <div
          className={
            styles["quiz__progress__bar"] +
            (progressColorClass === "green"
              ? " " + styles["green"]
              : progressColorClass === "orange"
              ? " " + styles["orange"]
              : "")
          }
          style={{ width: `${progressRatio * 100}%` }}
        />
      </div>

      {/* ヒントモーダル */}
      <QuizHintModal
        review={review}
        hintIndexes={hintIndexes}
        showHintModal={showHintModal}
        onShowHint={onShowHint}
        onSetShowHintModal={onSetShowHintModal}
        onSetHintIndexes={onSetHintIndexes}
      />

      {/* Quiz部分 */}
      <div className={styles["quiz__section"]}>
        <span className={styles["quiz__section__label"] + " " + styles["quiz"]}>
          Quiz
        </span>
        <div className={styles["quiz__section__text"]}>
          {(() => {
            // review.quizがnullの場合のエラーハンドリング
            if (!review.quiz) {
              return (
                <div className={styles["quiz__error"]}>
                  Quiz data not found. Please try refreshing the page.
                </div>
              );
            }

            const answer = review.quiz.answer;
            const attemptsCount = attempts[review.id] || 0;
            const isCorrect = results[review.id] === true;
            const isShowFullAnswer =
              isCorrect || (results[review.id] === false && attemptsCount >= 3);

            // 1つのテンプレートにまとめ、if分岐で内容を切り替える
            const parts = review.quiz.question.split("____");
            const answerWords = splitAnswerIntoWords(answer);
            const dictionary = review.quiz.dictionary || {};

            // 単語にツールチップを追加する関数
            const renderWordWithTooltip = (word: string, key: string) => {
              const meanings = dictionary[word];
              if (meanings && Array.isArray(meanings) && meanings.length > 0) {
                return (
                  <span
                    key={key}
                    className={styles["quiz__word-with-tooltip"]}
                    title={meanings.join(", ")}
                  >
                    {word}
                  </span>
                );
              }
              return <span key={key}>{word}</span>;
            };

            // テキストを単語に分割してツールチップを適用する関数
            const renderTextWithTooltips = (text: string, baseKey: string) => {
              if (!text) return null;

              const words = text.split(/(\s+)/);
              return words.map((word, index) => {
                const key = `${baseKey}-${index}`;
                if (word.trim() === "") {
                  return <span key={key}>{word}</span>; // 空白文字はそのまま
                }
                return renderWordWithTooltip(word, key);
              });
            };

            return (
              <>
                {renderTextWithTooltips(parts[0], "part0")}
                <span className={styles["quiz__blanks-container"]}>
                  {answerWords.map((word, index) => {
                    const style = {
                      "--word-length": word.length,
                      "--min-width": `${Math.max(word.length * 0.6, 1)}em`,
                    } as React.CSSProperties;

                    let blankClass = styles["quiz__word-blank"];
                    if (isCorrect)
                      blankClass += " " + styles["quiz__word-blank--correct"];
                    if (results[review.id] === false && attemptsCount >= 3)
                      blankClass += " " + styles["quiz__word-blank--incorrect"];

                    return (
                      <span key={index} className={blankClass} style={style}>
                        {word.split("").map((char, charIndex) => {
                          const showChar = shouldShowChar(
                            index,
                            charIndex,
                            word
                          );
                          const colorClass = getCharColorClass(index);

                          return (
                            <span
                              key={charIndex}
                              className={`${
                                styles["quiz__word-blank__char"]
                              } ${colorClass} ${
                                showChar
                                  ? styles["quiz__word-blank__char--visible"]
                                  : styles["quiz__word-blank__char--hidden"]
                              }`}
                            >
                              {char}
                            </span>
                          );
                        })}
                      </span>
                    );
                  })}
                </span>
                {renderTextWithTooltips(parts[1], "part1")}
              </>
            );
          })()}
        </div>
        {review.quiz?.sentence_translation && (
          <div className={styles["quiz__section__translation"]}>
            - {review.quiz.sentence_translation}
          </div>
        )}
      </div>

      {/* Answer部分 */}
      <div className={styles["quiz__section"]}>
        <span
          className={styles["quiz__section__label"] + " " + styles["answer"]}
        >
          Answer
        </span>
        <form
          className={styles["quiz__form"]}
          onSubmit={(e) => {
            e.preventDefault();
            onAnswer(review);
          }}
        >
          <input
            id={`answer-${review.id}`}
            key={attempts[review.id] || 0}
            className={
              styles["quiz__form__control"] +
              " " +
              styles["flex"] +
              (results[review.id] === true
                ? " " + styles["correct"]
                : results[review.id] === false && (attempts[review.id] || 0) > 0
                ? " " + styles["incorrect"]
                : "")
            }
            type="text"
            placeholder="Answer"
            value={answers[review.id] || ""}
            onChange={handleInputChange}
            disabled={
              results[review.id] === true ||
              (results[review.id] === false && (attempts[review.id] || 0) >= 3)
            }
          />
          {/* ボタン切り替えロジック */}
          {results[review.id] === undefined ||
          (results[review.id] === false && (attempts[review.id] || 0) < 3) ? (
            <button
              className={styles["quiz__form__button"]}
              type="submit"
              disabled={updating[review.id]}
              onClick={(e) => {
                // Answerボタンクリック時に部分正解を計算
                const userAnswer = answers[review.id] || "";
                const correctAnswer = review.quiz.answer;
                const partialIndexes = getPartialCorrectIndexes(
                  userAnswer,
                  correctAnswer
                );
                setPartialCorrectIndexes((prev) => ({
                  ...prev,
                  [review.id]: partialIndexes,
                }));

                console.log("Answer button clicked:", {
                  reviewId: review.id,
                  answer: answers[review.id],
                  partialIndexes,
                });
              }}
            >
              Answer
            </button>
          ) : (
            <button
              className={styles["quiz__form__button"]}
              type="button"
              onClick={onNext}
            >
              Next
            </button>
          )}

          {/* + Details 注釈リンクとアコーディオン（Nextボタンと同じ条件で表示） */}
          {(results[review.id] === true ||
            (results[review.id] === false &&
              (attempts[review.id] || 0) >= 3)) && (
            <div className={styles["quiz__details__wrapper"]}>
              <button
                className={styles["quiz__details__toggle"]}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log("Details toggle clicked:", {
                    reviewId: review.id,
                    currentState: detailsOpen[review.id],
                  });
                  onSetDetailsOpen((prev) => ({
                    ...prev,
                    [review.id]: !prev[review.id],
                  }));
                }}
              >
                {detailsOpen[review.id] ? "− Details" : "+ Details"}
              </button>
              <div
                className={
                  styles["quiz__details__content"] +
                  (detailsOpen[review.id] ? " " + styles["open"] : "")
                }
              >
                {/* Main word/訳語 */}
                {review.quiz?.main_word && (
                  <div className={styles["quiz__details__main-word__block"]}>
                    <span className={styles["quiz__details__main-word__text"]}>
                      {review.quiz.main_word}
                    </span>
                    {Array.isArray(review.quiz.main_word_translations) &&
                      review.quiz.main_word_translations.length > 0 && (
                        <span
                          className={
                            styles["quiz__details__main-word__translation"]
                          }
                        >
                          [
                          {review.quiz.main_word_translations.map(
                            (t: string, i: number) => (
                              <span key={i}>
                                {t}
                                {i <
                                review.quiz.main_word_translations.length - 1
                                  ? ", "
                                  : ""}
                              </span>
                            )
                          )}
                          ]
                        </span>
                      )}
                  </div>
                )}
                {/* Explanation */}
                {review.quiz?.explanation && (
                  <div className={styles["quiz__details__explanation__box"]}>
                    <span
                      className={styles["quiz__details__explanation__label"]}
                    >
                      Explanation
                    </span>
                    <span
                      className={styles["quiz__details__explanation__text"]}
                    >
                      {review.quiz.explanation}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </form>
      </div>
    </motion.div>
  );
}
