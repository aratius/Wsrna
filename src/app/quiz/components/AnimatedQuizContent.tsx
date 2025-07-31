import { motion, AnimatePresence } from "framer-motion";
import { ReactNode } from "react";
import Loading from "@/components/Loading";

interface AnimatedQuizContentProps {
  children: ReactNode;
  isLoading: boolean;
  className?: string;
}

export const AnimatedQuizContent = ({
  children,
  isLoading,
  className,
}: AnimatedQuizContentProps) => {
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
          <Loading />
        </motion.div>
      ) : (
        <motion.div
          key="content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: 0.2,
          }}
          className={className}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Quizカード用のアニメーション
export const AnimatedQuizCard = ({
  children,
  delay = 0,
}: {
  children: ReactNode;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{
      duration: 0.2,
      delay,
    }}
  >
    {children}
  </motion.div>
);

// Quizタブ用のアニメーション
export const AnimatedQuizTab = ({
  children,
  delay = 0,
}: {
  children: ReactNode;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{
      duration: 0.2,
      delay,
    }}
  >
    {children}
  </motion.div>
);

// 完了メッセージ用のアニメーション
export const AnimatedCompletionMessage = ({
  children,
}: {
  children: ReactNode;
}) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{
      duration: 0.3,
    }}
    style={{
      textAlign: "center",
      padding: "2rem",
    }}
  >
    {children}
  </motion.div>
);
