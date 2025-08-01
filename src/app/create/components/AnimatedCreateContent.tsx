import { motion, AnimatePresence } from "framer-motion";
import { ReactNode } from "react";
import LoadingWithSound from "@/components/LoadingWithSound";

interface AnimatedCreateContentProps {
  children: ReactNode;
  isLoading: boolean;
  className?: string;
}

export const AnimatedCreateContent = ({
  children,
  isLoading,
  className,
}: AnimatedCreateContentProps) => {
  return (
    <AnimatePresence mode="wait">
      {isLoading ? (
        <motion.div
          key="loading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className={className}
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "200px",
          }}
        >
          <LoadingWithSound />
        </motion.div>
      ) : (
        <motion.div
          key="content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className={className}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// フォーム要素用のアニメーション
export const AnimatedFormField = ({
  children,
  delay = 0,
}: {
  children: ReactNode;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{
      duration: 0.2,
      delay,
    }}
  >
    {children}
  </motion.div>
);

// モーダル用のアニメーション
export const AnimatedModal = ({
  children,
  isOpen,
}: {
  children: ReactNode;
  isOpen: boolean;
}) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          zIndex: 1000,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3 }}
          style={{
            backgroundColor: "white",
            borderRadius: "8px",
            padding: "20px",
            maxWidth: "90vw",
            maxHeight: "90vh",
            overflow: "auto",
          }}
        >
          {children}
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

// クイズアイテム用のアニメーション
export const AnimatedQuizItem = ({
  children,
  index = 0,
}: {
  children: ReactNode;
  index?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, x: 10 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{
      duration: 0.2,
      delay: index * 0.02,
    }}
  >
    {children}
  </motion.div>
);
