import { motion, AnimatePresence } from "framer-motion";
import { ReactNode } from "react";
import LoadingWithSound from "./LoadingWithSound";

interface AnimatedPageProps {
  children: ReactNode;
  isLoading: boolean;
  className?: string;
}

export const AnimatedPage = ({
  children,
  isLoading,
  className,
}: AnimatedPageProps) => {
  return (
    <AnimatePresence mode="wait">
      {isLoading ? (
        <motion.div
          key="loading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className={className}
        >
          <LoadingWithSound />
        </motion.div>
      ) : (
        <motion.div
          key="content"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{
            duration: 0.4,
            ease: [0.25, 0.46, 0.45, 0.94],
            staggerChildren: 0.1,
          }}
          className={className}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// 子要素用のアニメーションコンポーネント
export const AnimatedItem = ({
  children,
  delay = 0,
}: {
  children: ReactNode;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{
      duration: 0.3,
      delay,
      ease: [0.25, 0.46, 0.45, 0.94],
    }}
  >
    {children}
  </motion.div>
);

// ページ遷移用のアニメーション
export const pageVariants = {
  initial: {
    opacity: 0,
    x: -20,
    scale: 0.98,
  },
  in: {
    opacity: 1,
    x: 0,
    scale: 1,
  },
  out: {
    opacity: 0,
    x: 20,
    scale: 0.98,
  },
};

export const pageTransition = {
  type: "tween",
  ease: [0.25, 0.46, 0.45, 0.94],
  duration: 0.3,
};
