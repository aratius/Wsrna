import { motion, AnimatePresence } from "framer-motion";
import { ReactNode } from "react";
import LoadingWithSound from "@/components/LoadingWithSound";

interface AnimatedMypageContentProps {
  children: ReactNode;
  isLoading?: boolean;
  className?: string;
}

export const AnimatedMypageContent = ({
  children,
  isLoading = false,
  className,
}: AnimatedMypageContentProps) => {
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

// メニューアイテム用のアニメーション
export const AnimatedMenuItem = ({
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

// カード要素用のアニメーション
export const AnimatedCard = ({
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

// リストアイテム用のアニメーション
export const AnimatedListItem = ({
  children,
  index = 0,
}: {
  children: ReactNode;
  index?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{
      duration: 0.2,
      delay: index * 0.05,
    }}
  >
    {children}
  </motion.div>
);

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
