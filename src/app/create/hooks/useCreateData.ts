import { useEffect, useState } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import supportedLanguages from "@/lib/supportedLanguages.json";

export function useCreateData() {
  const session = useSession();
  const [languagePairs, setLanguagePairs] = useState<any[]>([]);
  const [pairLoading, setPairLoading] = useState(false);
  const [pairError, setPairError] = useState("");
  const [selectedPairId, setSelectedPairId] = useState("");

  // Fetch language pairs for the user
  useEffect(() => {
    const fetchPairs = async () => {
      if (!session?.user?.id) return;
      setPairLoading(true);
      setPairError("");
      try {
        const res = await fetch(
          `/api/language-pairs?user_id=${session.user.id}`
        );
        const data = await res.json();
        if (data.error) setPairError(data.error);
        else setLanguagePairs(Array.isArray(data) ? data : [data]);
      } catch (e: any) {
        setPairError(e.message);
      } finally {
        setPairLoading(false);
      }
    };
    fetchPairs();
  }, [session]);

  // Restore last selected language pair from localStorage
  useEffect(() => {
    const lastPairId = localStorage.getItem("lastSelectedPairId");
    if (lastPairId) setSelectedPairId(lastPairId);
  }, []);

  // Save selected language pair to localStorage
  useEffect(() => {
    if (selectedPairId) {
      localStorage.setItem("lastSelectedPairId", selectedPairId);
    }
  }, [selectedPairId]);

  // 選択中の言語ペアのラベル取得
  const selectedPair = languagePairs.find((lp) => lp.id === selectedPairId);
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