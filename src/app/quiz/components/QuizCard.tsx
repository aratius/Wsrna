"use client";
import { useState } from "react";
import styles from "../quiz.module.scss";
import QuizHintModal from "./QuizHintModal";

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
  // 進捗に応じた色を決定
  let progressColorClass = "";
  const progressRatio = (currentIndex + 1) / totalCount;
  if (progressRatio >= 0.99) {
    progressColorClass = "green";
  } else if (progressRatio >= 0.7) {
    progressColorClass = "orange";
  }

  return (
    <div className={styles["quiz__card"]}>
      {/* プログレスバー */}
      <div className={styles["quiz__progress__wrapper"]}>
        <div
          className={
            styles["quiz__progress__bar"] +
            (progressColorClass === "green"
              ? " " + styles["quiz__progress__bar"] + "--green"
              : progressColorClass === "orange"
              ? " " + styles["quiz__progress__bar"] + "--orange"
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
        <span
          className={
            styles.quiz__section__label +
            " " +
            styles.quiz__section__label +
            "--quiz"
          }
        >
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
            const colorClass = isCorrect
              ? styles["quiz__answer"] + "--correct"
              : styles["quiz__answer"] + "--incorrect";

            // 正解を単語に分割し、各単語の文字数に基づいて空欄を生成
            const splitAnswerIntoWords = (answer: string) => {
              return answer.split(/\s+/).filter((word) => word.length > 0);
            };

            // 1つのテンプレートにまとめ、if分岐で内容を切り替える
            const parts = review.quiz.question.split("____");
            const answerWords = splitAnswerIntoWords(answer);

            return (
              <>
                {parts[0]}
                <span className={styles["quiz__blanks-container"]}>
                  {answerWords.map((word, index) => {
                    // isShowFullAnswer: 正解表示時（緑色で文字表示）
                    // 共通化: word blankの描画を1つの関数でまとめる
                    const renderWordBlank = ({
                      word,
                      index,
                      showFullAnswer,
                      isCorrect,
                      isIncorrect,
                    }: {
                      word: string;
                      index: number;
                      showFullAnswer: boolean;
                      isCorrect: boolean;
                      isIncorrect: boolean;
                    }) => {
                      const style = {
                        "--word-length": word.length,
                        "--min-width": `${Math.max(word.length * 0.6, 1)}em`,
                      } as React.CSSProperties;
                      let blankClass = styles["quiz__word-blank"];
                      if (isCorrect)
                        blankClass += " " + styles["quiz__word-blank--correct"];
                      if (isIncorrect)
                        blankClass +=
                          " " + styles["quiz__word-blank--incorrect"];

                      if (showFullAnswer) {
                        // 正解時: 全文字を緑色で表示
                        return (
                          <span
                            key={index}
                            className={blankClass}
                            style={style}
                          >
                            {word.split("").map((char, charIndex) => (
                              <span
                                key={charIndex}
                                className={
                                  styles["quiz__word-blank__char"] +
                                  " " +
                                  styles["quiz__word-blank__char--correct"]
                                }
                              >
                                {char}
                              </span>
                            ))}
                          </span>
                        );
                      } else {
                        // 通常時: 下線のみ
                        return (
                          <span
                            key={index}
                            className={blankClass}
                            style={style}
                          >
                            {word.split("").map((_, charIndex) => (
                              <span
                                key={charIndex}
                                className={styles["quiz__word-blank__char"]}
                              ></span>
                            ))}
                          </span>
                        );
                      }
                    };

                    return renderWordBlank({
                      word,
                      index,
                      showFullAnswer: isShowFullAnswer,
                      isCorrect:
                        isShowFullAnswer && results[review.id] === true,
                      isIncorrect:
                        isShowFullAnswer && results[review.id] === false,
                    });
                  })}
                </span>
                {parts[1]}
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
          className={
            styles.quiz__section__label +
            " " +
            styles.quiz__section__label +
            "--answer"
          }
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
              styles["quiz__form__control"] +
              "--flex" +
              (results[review.id] === true
                ? " " + styles["quiz__form__control"] + "--correct"
                : results[review.id] === false && (attempts[review.id] || 0) > 0
                ? " " + styles["quiz__form__control"] + "--incorrect"
                : "")
            }
            type="text"
            placeholder="Answer"
            value={answers[review.id] || ""}
            onChange={(e) =>
              onSetAnswers((a) => ({
                ...a,
                [review.id]: e.target.value,
              }))
            }
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
                console.log("Answer button clicked:", {
                  reviewId: review.id,
                  answer: answers[review.id],
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
                  (detailsOpen[review.id]
                    ? " " + styles["quiz__details__content"] + "--open"
                    : "")
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
    </div>
  );
}
