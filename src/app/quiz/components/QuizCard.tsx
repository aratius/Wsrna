"use client";
import { useState, useEffect } from "react";
import styles from "../quiz.module.scss";
import QuizHintModal from "./QuizHintModal";
import { motion } from "framer-motion";
import supportedLanguages from "../../../lib/supportedLanguages.json";
import {
  playButtonClick,
  playTransition,
  playType,
} from "../../../lib/soundManager";

interface QuizCardProps {
  idiom: any;
  currentIndex: number;
  totalCount: number;
  answers: { [id: string]: string };
  results: { [id: string]: boolean | null };
  attempts: { [id: string]: number };
  updating: { [id: string]: boolean };
  hintIndexes: { [id: string]: number };
  showHintModal: { [id: string]: boolean };
  detailsOpen: { [id: string]: boolean };
  dailyProgress: number;
  dailyQuizLimit: number;
  onAnswer: (idiom: any) => void;
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
  idiom,
  currentIndex,
  totalCount,
  answers,
  results,
  attempts,
  updating,
  hintIndexes,
  showHintModal,
  detailsOpen,
  dailyProgress,
  dailyQuizLimit,
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

  console.log("idiom.quiz", idiom.quiz.main_word);
  console.log("idiom.quiz", idiom.quiz.sentence_translation);

  // ポップアップの状態を管理
  const [popupState, setPopupState] = useState<{
    isVisible: boolean;
    word: string;
    meanings: string[];
    x: number;
    y: number;
  }>({
    isVisible: false,
    word: "",
    meanings: [],
    x: 0,
    y: 0,
  });

  // 言語ペアの状態を管理
  const [languagePair, setLanguagePair] = useState<any>(null);

  // 問題文読み上げ機能
  const speakQuestion = (question: string, answer: string) => {
    if ("speechSynthesis" in window) {
      // 穴抜き部分を正解で埋めた完成版の問題文を作成
      const completedQuestion = question.replace("____", answer);

      const utterance = new SpeechSynthesisUtterance(completedQuestion);

      // 取得した言語ペアからto_langを使用
      const toLangCode = languagePair?.to_lang || "en";
      const language = supportedLanguages.find(
        (lang) => lang.code === toLangCode
      );
      const toLang = language?.locale || "en-US";
      utterance.lang = toLang;
      utterance.rate = 0.8; // 少しゆっくりめ
      utterance.pitch = 1.0;
      utterance.volume = 0.8;

      // 音声リストの読み込みを待つ関数
      const speakWithVoices = () => {
        const voices = speechSynthesis.getVoices();

        // デバッグ情報
        console.log("Speech synthesis debug:", {
          question: completedQuestion,
          toLang: idiom.quiz?.toLang,
          speechLang: toLang,
          availableVoices: voices.length,
          japaneseVoices: voices.filter((v) => v.lang.includes("ja")).length,
          allVoices: voices.map((v) => `${v.name} (${v.lang})`),
        });

        // 日本語音声が利用可能かチェック
        const japaneseVoices = voices.filter((voice) =>
          voice.lang.includes("ja")
        );

        if (japaneseVoices.length > 0 && toLang.includes("ja")) {
          // 日本語音声がある場合は、最適な音声を選択
          const preferredJapaneseVoice =
            japaneseVoices.find(
              (voice) => voice.lang === "ja-JP" || voice.lang === "ja"
            ) || japaneseVoices[0];

          utterance.voice = preferredJapaneseVoice;
          console.log(
            "Selected Japanese voice:",
            preferredJapaneseVoice.name,
            preferredJapaneseVoice.lang
          );
        } else if (japaneseVoices.length === 0 && toLang.includes("ja")) {
          console.warn(
            "No Japanese voices available. Available voices:",
            voices.map((v) => `${v.name} (${v.lang})`)
          );
          // 日本語音声がない場合は英語でフォールバック
          utterance.lang = "en-US";
        }

        // 既存の読み上げを停止してから新しい読み上げを開始
        speechSynthesis.cancel();
        speechSynthesis.speak(utterance);
      };

      // 音声リストが既に読み込まれているかチェック
      if (speechSynthesis.getVoices().length > 0) {
        speakWithVoices();
      } else {
        // 音声リストの読み込みを待つ
        speechSynthesis.onvoiceschanged = speakWithVoices;
      }
    } else {
      console.error("Speech synthesis not supported");
    }
  };

  // 言語ペアを取得
  useEffect(() => {
    const fetchLanguagePair = async () => {
      if (!idiom.quiz?.language_pair_id) return;

      try {
        const res = await fetch(
          `/api/language-pairs/${idiom.quiz.language_pair_id}`
        );
        const data = await res.json();
        if (!data.error) {
          setLanguagePair(data);
        }
      } catch (error) {
        console.error("Failed to fetch language pair:", error);
      }
    };

    fetchLanguagePair();
  }, [idiom.quiz?.language_pair_id]);

  // ポップアップ外クリックで閉じる処理
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      const popupElement = target.closest(
        `.${styles["quiz__word-with-popup"]}`
      );

      if (!popupElement && popupState.isVisible) {
        setPopupState((prev) => ({ ...prev, isVisible: false }));
      }
    };

    if (popupState.isVisible) {
      document.addEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [popupState.isVisible, styles]);

  // 進捗に応じた色を決定
  let progressColorClass = "";
  const progressRatio = dailyProgress / dailyQuizLimit; // 動的な制限に基づく
  if (progressRatio >= 0.99) {
    progressColorClass = "green";
  } else if (progressRatio >= 0.7) {
    progressColorClass = "orange";
  }

  // 文字単位での部分正解判定
  const getPartialCorrectIndexes = (
    userAnswer: string,
    correctAnswer: string
  ): number[] => {
    if (!userAnswer || !correctAnswer) return [];

    const userChars = userAnswer.trim().split("");
    const correctChars = correctAnswer.trim().split("");
    const indexes: number[] = [];

    // 頭から一致している文字のインデックスを収集
    for (let i = 0; i < Math.min(userChars.length, correctChars.length); i++) {
      if (userChars[i].toLowerCase() === correctChars[i].toLowerCase()) {
        indexes.push(i);
      } else {
        // 一致しない文字が見つかったら終了
        break;
      }
    }

    return indexes;
  };

  // inputのchangeイベント（部分正解の計算は行わない）
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    playType();
    const userAnswer = e.target.value;

    // 既存のonSetAnswersを呼び出し
    onSetAnswers((a) => ({
      ...a,
      [idiom.id]: userAnswer,
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
    const isCorrect = results[idiom.id] === true;
    const isIncorrect = results[idiom.id] === false;
    const attemptsCount = attempts[idiom.id] || 0;
    const isShowFullAnswer = isCorrect || (isIncorrect && attemptsCount >= 3);

    // 正解/不正解確定時は全文字表示
    if (isShowFullAnswer) {
      return true;
    }

    // 部分正解の判定（文字単位）
    const partialIndexes = partialCorrectIndexes[idiom.id] || [];
    const answerWords = splitAnswerIntoWords(idiom.quiz.answer);

    // 現在の文字の全体インデックスを計算
    let globalCharIndex = 0;
    for (let i = 0; i < wordIndex; i++) {
      globalCharIndex += answerWords[i].length;
    }
    globalCharIndex += charIndex;

    if (partialIndexes.includes(globalCharIndex)) {
      return true;
    }

    // それ以外は透明（文字は配置されているが非表示）
    return false;
  };

  // 文字の色を決定する関数
  const getCharColorClass = (wordIndex: number, charIndex: number) => {
    const isCorrect = results[idiom.id] === true;
    const isIncorrect = results[idiom.id] === false;
    const attemptsCount = attempts[idiom.id] || 0;
    const isShowFullAnswer = isCorrect || (isIncorrect && attemptsCount >= 3);

    if (isShowFullAnswer) {
      if (isCorrect) {
        return styles["quiz__word-blank__char--correct"];
      } else if (isIncorrect) {
        return styles["quiz__word-blank__char--incorrect"];
      }
    }

    // 部分正解時は青色で表示（文字単位）
    const partialIndexes = partialCorrectIndexes[idiom.id] || [];
    const answerWords = splitAnswerIntoWords(idiom.quiz.answer);

    // 現在の文字の全体インデックスを計算
    let globalCharIndex = 0;
    for (let i = 0; i < wordIndex; i++) {
      globalCharIndex += answerWords[i].length;
    }
    globalCharIndex += charIndex;

    if (partialIndexes.includes(globalCharIndex)) {
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
        idiom={idiom}
        hintIndexes={hintIndexes}
        showHintModal={showHintModal}
        onShowHint={onShowHint}
        onSetShowHintModal={onSetShowHintModal}
        onSetHintIndexes={onSetHintIndexes}
      />

      {/* Quiz部分 */}
      <div className={styles["quiz__section"]}>
        <div className={styles["quiz__section__header"]}>
          <div className={styles["quiz__section__label-container"]}>
            <span
              className={styles["quiz__section__label"] + " " + styles["quiz"]}
            >
              Quiz
            </span>
            {/* 正解/不正解確定時に再生アイコンを表示 */}
            {(() => {
              const isCorrect = results[idiom.id] === true;
              const isIncorrect = results[idiom.id] === false;
              const attemptsCount = attempts[idiom.id] || 0;
              const isDetermined =
                isCorrect || (isIncorrect && attemptsCount >= 3);

              if (isDetermined && idiom.quiz?.question) {
                return (
                  <button
                    className={styles["quiz__play-button"]}
                    onClick={() => {
                      speakQuestion(idiom.quiz.question, idiom.quiz.answer);
                    }}
                    title="再生"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </button>
                );
              }
              return null;
            })()}
          </div>
        </div>
        <div className={styles["quiz__section__text"]}>
          {(() => {
            // idiom.quizがnullの場合のエラーハンドリング
            if (!idiom.quiz) {
              return (
                <div className={styles["quiz__error"]}>
                  Quiz data not found. Please try refreshing the page.
                </div>
              );
            }

            const answer = idiom.quiz.answer;
            const attemptsCount = attempts[idiom.id] || 0;
            const isCorrect = results[idiom.id] === true;
            const isShowFullAnswer =
              isCorrect || (results[idiom.id] === false && attemptsCount >= 3);

            // 1つのテンプレートにまとめ、if分岐で内容を切り替える
            const parts = idiom.quiz.question.split("____");
            const answerWords = splitAnswerIntoWords(answer);
            const dictionary = idiom.quiz.dictionary || {};

            // 単語にポップアップを追加する関数
            const renderWordWithPopup = (
              word: string,
              key: string,
              isClickable: boolean = true
            ) => {
              const meanings = dictionary[word];
              if (
                meanings &&
                Array.isArray(meanings) &&
                meanings.length > 0 &&
                isClickable
              ) {
                const isPopupVisible =
                  popupState.isVisible && popupState.word === word;
                return (
                  <span
                    key={key}
                    className={styles["quiz__word-with-popup"]}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (isPopupVisible) {
                        setPopupState((prev) => ({
                          ...prev,
                          isVisible: false,
                        }));
                      } else {
                        setPopupState({
                          isVisible: true,
                          word: word,
                          meanings: meanings,
                          x: 0,
                          y: 0,
                        });
                      }
                    }}
                  >
                    {word}
                    {isPopupVisible && (
                      <motion.span
                        className={styles["quiz__popup"]}
                        initial={{ opacity: 0, y: 5, x: "-50%" }}
                        animate={{ opacity: 1, y: 0, x: "-50%" }}
                        exit={{ opacity: 0, y: 5, x: "-50%" }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                      >
                        <span className={styles["quiz__popup__content"]}>
                          <span className={styles["quiz__popup__word"]}>
                            {word}
                          </span>
                          <span className={styles["quiz__popup__meanings"]}>
                            {meanings.join(", ")}
                          </span>
                        </span>
                        <span className={styles["quiz__popup__arrow"]}></span>
                      </motion.span>
                    )}
                  </span>
                );
              }
              return (
                <span key={key} className={styles["quiz__word-normal"]}>
                  {word}
                </span>
              );
            };

            // dictionaryのキーを長い順にソート（最長一致を優先）
            const dictionaryKeys = Object.keys(dictionary).sort(
              (a, b) => b.length - a.length
            );

            // テキスト内でdictionaryに含まれる単語を検索する関数
            const findDictionaryWords = (
              text: string
            ): Array<{
              word: string;
              startIndex: number;
              endIndex: number;
              meanings: string[];
            }> => {
              const foundWords: Array<{
                word: string;
                startIndex: number;
                endIndex: number;
                meanings: string[];
              }> = [];

              // 各dictionaryキーについて、テキスト内で最初の一語のみ検索
              for (const key of dictionaryKeys) {
                const meanings = dictionary[key];
                if (!Array.isArray(meanings) || meanings.length === 0) continue;

                const index = text.indexOf(key);
                if (index === -1) continue;

                // 既に他の単語でカバーされている範囲かチェック
                const isOverlapping = foundWords.some(
                  (found) =>
                    (index >= found.startIndex && index < found.endIndex) ||
                    (index + key.length > found.startIndex &&
                      index + key.length <= found.endIndex) ||
                    (index <= found.startIndex &&
                      index + key.length >= found.endIndex)
                );

                if (!isOverlapping) {
                  foundWords.push({
                    word: key,
                    startIndex: index,
                    endIndex: index + key.length,
                    meanings: meanings,
                  });
                }
              }

              // 開始位置でソート
              return foundWords.sort((a, b) => a.startIndex - b.startIndex);
            };

            // テキストを単語に分割してポップアップを適用する関数
            const renderTextWithPopups = (text: string, baseKey: string) => {
              if (!text) return null;

              // テキスト内のdictionary単語を検索
              const foundWords = findDictionaryWords(text);

              // テキストをdictionary単語とそれ以外の部分に分割
              const segments: Array<{
                text: string;
                isDictionaryWord: boolean;
                word?: string;
                meanings?: string[];
              }> = [];

              let lastIndex = 0;
              for (const found of foundWords) {
                // dictionary単語の前のテキスト
                if (found.startIndex > lastIndex) {
                  segments.push({
                    text: text.slice(lastIndex, found.startIndex),
                    isDictionaryWord: false,
                  });
                }

                // dictionary単語
                segments.push({
                  text: found.word,
                  isDictionaryWord: true,
                  word: found.word,
                  meanings: found.meanings,
                });

                lastIndex = found.endIndex;
              }

              // 残りのテキスト
              if (lastIndex < text.length) {
                segments.push({
                  text: text.slice(lastIndex),
                  isDictionaryWord: false,
                });
              }

              // セグメントをレンダリング
              return segments.map((segment, index) => {
                const key = `${baseKey}-${index}`;

                if (
                  segment.isDictionaryWord &&
                  segment.word &&
                  segment.meanings
                ) {
                  // dictionary単語の場合
                  const isPopupVisible =
                    popupState.isVisible && popupState.word === segment.word;
                  return (
                    <span
                      key={key}
                      className={styles["quiz__word-with-popup"]}
                      onClick={(e) => {
                        playButtonClick();
                        e.preventDefault();
                        e.stopPropagation();
                        if (isPopupVisible) {
                          setPopupState((prev) => ({
                            ...prev,
                            isVisible: false,
                          }));
                        } else {
                          setPopupState({
                            isVisible: true,
                            word: segment.word!,
                            meanings: segment.meanings!,
                            x: 0,
                            y: 0,
                          });
                        }
                      }}
                    >
                      {segment.text}
                      {isPopupVisible && (
                        <motion.span
                          className={styles["quiz__popup"]}
                          initial={{ opacity: 0, y: 5, x: "-50%" }}
                          animate={{ opacity: 1, y: 0, x: "-50%" }}
                          exit={{ opacity: 0, y: 5, x: "-50%" }}
                          transition={{ duration: 0.2, ease: "easeOut" }}
                        >
                          <span className={styles["quiz__popup__content"]}>
                            <span className={styles["quiz__popup__word"]}>
                              {segment.word}
                            </span>
                            <span className={styles["quiz__popup__meanings"]}>
                              {segment.meanings.join(", ")}
                            </span>
                          </span>
                          <span className={styles["quiz__popup__arrow"]}></span>
                        </motion.span>
                      )}
                    </span>
                  );
                } else {
                  // 通常のテキストの場合
                  return (
                    <span key={key} className={styles["quiz__word-normal"]}>
                      {segment.text}
                    </span>
                  );
                }
              });
            };

            // 全体のテキストを一度に処理する関数
            const renderFullTextWithBlanks = () => {
              const fullText = idiom.quiz.question;
              const blankIndex = fullText.indexOf("____");

              if (blankIndex === -1) {
                // 穴埋めがない場合は通常の処理
                return renderTextWithPopups(fullText, "full");
              }

              // 全体のテキストでdictionary単語を検索
              const foundWords = findDictionaryWords(fullText);

              // テキストをセグメントに分割（穴埋め部分を含む）
              const segments: Array<{
                text: string;
                isDictionaryWord: boolean;
                isBlank: boolean;
                word?: string;
                meanings?: string[];
              }> = [];

              let lastIndex = 0;
              for (const found of foundWords) {
                // 穴埋め部分より前のdictionary単語
                if (found.startIndex < blankIndex) {
                  // dictionary単語の前のテキスト
                  if (found.startIndex > lastIndex) {
                    segments.push({
                      text: fullText.slice(lastIndex, found.startIndex),
                      isDictionaryWord: false,
                      isBlank: false,
                    });
                  }

                  // dictionary単語
                  segments.push({
                    text: found.word,
                    isDictionaryWord: true,
                    isBlank: false,
                    word: found.word,
                    meanings: found.meanings,
                  });

                  lastIndex = found.endIndex;
                }
              }

              // 穴埋め前の残りのテキスト
              if (lastIndex < blankIndex) {
                segments.push({
                  text: fullText.slice(lastIndex, blankIndex),
                  isDictionaryWord: false,
                  isBlank: false,
                });
              }

              // 穴埋め部分
              segments.push({
                text: "____",
                isDictionaryWord: false,
                isBlank: true,
              });

              // 穴埋め後のdictionary単語を検索
              lastIndex = blankIndex + 4;
              for (const found of foundWords) {
                if (found.startIndex >= blankIndex + 4) {
                  // dictionary単語の前のテキスト
                  if (found.startIndex > lastIndex) {
                    segments.push({
                      text: fullText.slice(lastIndex, found.startIndex),
                      isDictionaryWord: false,
                      isBlank: false,
                    });
                  }

                  // dictionary単語
                  segments.push({
                    text: found.word,
                    isDictionaryWord: true,
                    isBlank: false,
                    word: found.word,
                    meanings: found.meanings,
                  });

                  lastIndex = found.endIndex;
                }
              }

              // 残りのテキスト
              if (lastIndex < fullText.length) {
                segments.push({
                  text: fullText.slice(lastIndex),
                  isDictionaryWord: false,
                  isBlank: false,
                });
              }

              // セグメントをレンダリング
              return segments.map((segment, index) => {
                const key = `segment-${index}`;

                if (segment.isBlank) {
                  // 穴埋め部分
                  return (
                    <span
                      key={key}
                      className={styles["quiz__blanks-container"]}
                    >
                      {answerWords.map((word, wordIndex) => {
                        const style = {
                          "--word-length": word.length,
                          "--min-width": `${Math.max(word.length * 0.6, 1)}em`,
                        } as React.CSSProperties;

                        let blankClass = styles["quiz__word-blank"];
                        if (isCorrect) blankClass += " " + styles["correct"];
                        if (results[idiom.id] === false && attemptsCount >= 3)
                          blankClass += " " + styles["incorrect"];

                        return (
                          <span
                            key={wordIndex}
                            className={blankClass}
                            style={style}
                          >
                            {word.split("").map((char, charIndex) => {
                              const showChar = shouldShowChar(
                                wordIndex,
                                charIndex,
                                word
                              );
                              const colorClass = getCharColorClass(
                                wordIndex,
                                charIndex
                              );

                              return (
                                <span
                                  key={charIndex}
                                  className={`${
                                    styles["quiz__word-blank__char"]
                                  } ${colorClass} ${
                                    showChar
                                      ? styles[
                                          "quiz__word-blank__char--visible"
                                        ]
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
                  );
                } else if (
                  segment.isDictionaryWord &&
                  segment.word &&
                  segment.meanings
                ) {
                  // dictionary単語の場合
                  return renderWordWithPopup(segment.word, key);
                } else {
                  // 通常のテキストの場合
                  return (
                    <span key={key} className={styles["quiz__word-normal"]}>
                      {segment.text}
                    </span>
                  );
                }
              });
            };

            return renderFullTextWithBlanks();
          })()}
        </div>
        {idiom.quiz?.sentence_translation && (
          <div className={styles["quiz__section__translation"]}>
            - {idiom.quiz.sentence_translation}
          </div>
        )}
      </div>

      {/* Answer部分 */}
      <div className={styles["quiz__section"]}>
        <div className={styles["quiz__section__header"]}>
          <span
            className={styles["quiz__section__label"] + " " + styles["answer"]}
          >
            Answer
          </span>
        </div>
        <form
          className={styles["quiz__form"]}
          onSubmit={(e) => {
            e.preventDefault();
            onAnswer(idiom);
          }}
        >
          <input
            id={`answer-${idiom.id}`}
            key={attempts[idiom.id] || 0}
            className={
              styles["quiz__form__control"] +
              " " +
              styles["flex"] +
              (results[idiom.id] === true
                ? " " + styles["correct"]
                : results[idiom.id] === false && (attempts[idiom.id] || 0) > 0
                ? " " + styles["incorrect"]
                : "")
            }
            type="text"
            placeholder="Answer"
            value={answers[idiom.id] || ""}
            onChange={handleInputChange}
            disabled={
              results[idiom.id] === true ||
              (results[idiom.id] === false && (attempts[idiom.id] || 0) >= 3)
            }
          />
          {/* ボタン切り替えロジック */}
          {results[idiom.id] === undefined ||
          (results[idiom.id] === false && (attempts[idiom.id] || 0) < 3) ? (
            <button
              className={styles["quiz__form__button"]}
              type="submit"
              disabled={updating[idiom.id]}
              onClick={(e) => {
                // Answerボタンクリック時に部分正解を計算
                const userAnswer = answers[idiom.id] || "";
                const correctAnswer = idiom.quiz.answer;
                const partialIndexes = getPartialCorrectIndexes(
                  userAnswer,
                  correctAnswer
                );
                setPartialCorrectIndexes((prev) => ({
                  ...prev,
                  [idiom.id]: partialIndexes,
                }));
              }}
            >
              Answer
            </button>
          ) : (
            <button
              className={styles["quiz__form__button"]}
              type="button"
              onClick={() => {
                playButtonClick();
                onNext();
              }}
            >
              Next
            </button>
          )}

          {/* + Details 注釈リンクとアコーディオン（Nextボタンと同じ条件で表示） */}
          {(results[idiom.id] === true ||
            (results[idiom.id] === false &&
              (attempts[idiom.id] || 0) >= 3)) && (
            <div className={styles["quiz__details__wrapper"]}>
              <button
                className={styles["quiz__details__toggle"]}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();

                  // ボタンクリック音を再生
                  playTransition(!detailsOpen[idiom.id]);

                  onSetDetailsOpen((prev) => ({
                    ...prev,
                    [idiom.id]: !prev[idiom.id],
                  }));
                }}
              >
                {detailsOpen[idiom.id] ? "− Details" : "+ Details"}
              </button>
              <div
                className={
                  styles["quiz__details__content"] +
                  (detailsOpen[idiom.id] ? " " + styles["open"] : "")
                }
              >
                {/* Main word/訳語 */}
                {idiom.quiz?.main_word && (
                  <div className={styles["quiz__details__main-word__block"]}>
                    <span className={styles["quiz__details__main-word__text"]}>
                      {idiom.quiz.main_word}
                    </span>
                    {Array.isArray(idiom.quiz.main_word_translations) &&
                      idiom.quiz.main_word_translations.length > 0 && (
                        <span
                          className={
                            styles["quiz__details__main-word__translation"]
                          }
                        >
                          [
                          {idiom.quiz.main_word_translations.map(
                            (t: string, i: number) => (
                              <span key={i}>
                                {t}
                                {i <
                                idiom.quiz.main_word_translations.length - 1
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
                {idiom.quiz?.explanation && (
                  <div className={styles["quiz__details__explanation__box"]}>
                    <span
                      className={styles["quiz__details__explanation__label"]}
                    >
                      Explanation
                    </span>
                    <span
                      className={styles["quiz__details__explanation__text"]}
                    >
                      {idiom.quiz.explanation}
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
