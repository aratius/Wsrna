import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import supportedLanguages from "@/lib/supportedLanguages.json";
import { useAppSelector } from "@/lib/hooks";

interface LanguagePair {
  id: string;
  user_id: string;
  from_lang: string;
  to_lang: string;
  created_at: string;
}

export function useCreateData() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);
  const { pairs: languagePairs, isLoading: pairLoading, error: pairError } = useAppSelector((state) => state.languagePairs) as {
    pairs: LanguagePair[];
    isLoading: boolean;
    error: string | null;
  };
  const [selectedPairId, setSelectedPairId] = useState("");

  // Reduxストアからlanguage_pairsが自動的に取得されるため、useEffectは不要

  // Set initial language pair from URL query parameter
  useEffect(() => {
    const langPairParam = searchParams.get("lang_pair");
    if (langPairParam && languagePairs.length > 0) {
      // Check if the language pair exists in user's pairs
      const pairExists = languagePairs.find((lp: LanguagePair) => lp.id === langPairParam);
      if (pairExists) {
        setSelectedPairId(langPairParam);
        // クエリストリングを削除
        router.replace("/create");
        return;
      }
    }
  }, [searchParams, languagePairs, router]);

  // Restore last selected language pair from localStorage (only if no query param)
  useEffect(() => {
    const langPairParam = searchParams.get("lang_pair");
    if (!langPairParam) {
      const lastPairId = localStorage.getItem("lastSelectedPairId");
      if (lastPairId) setSelectedPairId(lastPairId);
    }
  }, [searchParams]);

  // Save selected language pair to localStorage
  useEffect(() => {
    if (selectedPairId) {
      localStorage.setItem("lastSelectedPairId", selectedPairId);
    }
  }, [selectedPairId]);

  // 選択中の言語ペアのラベル取得
  const selectedPair = languagePairs.find((lp: LanguagePair) => lp.id === selectedPairId);
  const fromLangLabel = selectedPair
    ? supportedLanguages.find((l) => l.code === selectedPair.from_lang)
      ?.label || selectedPair.from_lang
    : "From";
  const toLangLabel = selectedPair
    ? supportedLanguages.find((l) => l.code === selectedPair.to_lang)?.label ||
    selectedPair.to_lang
    : "To";
  const fromLangGreeting = selectedPair
    ? supportedLanguages.find((l) => l.code === selectedPair.from_lang)
      ?.greeting || fromLangLabel
    : fromLangLabel;
  const toLangGreeting = selectedPair
    ? supportedLanguages.find((l) => l.code === selectedPair.to_lang)
      ?.greeting || toLangLabel
    : toLangLabel;

  return {
    languagePairs,
    pairLoading,
    pairError,
    selectedPairId,
    setSelectedPairId,
    selectedPair,
    fromLangLabel,
    toLangLabel,
    fromLangGreeting,
    toLangGreeting,
  };
}