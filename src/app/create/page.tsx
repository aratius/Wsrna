"use client";
import "@/styles/components/_button.scss";
import "@/styles/components/_form.scss";
import "@/styles/components/_card.scss";
import { useSession } from "@supabase/auth-helpers-react";
import Loading from "@/components/Loading";
import styles from "./create.module.scss";
import { useCreateData } from "./hooks/useCreateData";
import { useCreateState } from "./hooks/useCreateState";
import CreateForm from "./components/CreateForm";
import CreatePreviewModal from "./components/CreatePreviewModal";

export default function CreatePage() {
  const session = useSession();

  const {
    languagePairs,
    pairLoading,
    pairError,
    selectedPairId,
    setSelectedPairId,
    fromLangGreeting,
    toLangGreeting,
  } = useCreateData();

  const {
    fromTranslation,
    setFromTranslation,
    toText,
    setToText,
    loading,
    quizzes,
    error,
    showModal,
    setShowModal,
    submitting,
    handleSubmit,
    handleSubmitQuizzes,
  } = useCreateState();

  if (!session) return null;

  // スマホ判定
  const isMobile = typeof window !== "undefined" && window.innerWidth <= 600;

  const handleFormSubmit = (e: React.FormEvent) => {
    handleSubmit(e, selectedPairId, languagePairs);
  };

  const handleModalSubmit = () => {
    handleSubmitQuizzes(selectedPairId);
  };

  return (
    <>
      {loading && (
        <Loading
          message="Generating quiz..."
          subMessage="This may take up to 30 seconds."
          fullscreen
        />
      )}
      <CreatePreviewModal
        open={showModal}
        onClose={() => setShowModal(false)}
        quizzes={quizzes}
        onSubmit={handleModalSubmit}
        submitting={submitting}
      />
      <div className={styles["create__container"]}>
        <h1 className={styles["create__title"]}>Create Quiz !!</h1>
        <CreateForm
          languagePairs={languagePairs}
          pairLoading={pairLoading}
          pairError={pairError}
          selectedPairId={selectedPairId}
          fromTranslation={fromTranslation}
          toText={toText}
          fromLangGreeting={fromLangGreeting}
          toLangGreeting={toLangGreeting}
          loading={loading}
          error={error}
          onSelectPair={setSelectedPairId}
          onFromTranslationChange={setFromTranslation}
          onToTextChange={setToText}
          onSubmit={handleFormSubmit}
        />
      </div>
    </>
  );
}
