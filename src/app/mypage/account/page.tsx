"use client";
import { useRouter } from "next/navigation";
import styles from "./account.module.scss";
import { supabase } from "@/lib/supabaseClient";
import { motion } from "framer-motion";
import {
  AnimatedMypageContent,
  AnimatedCard,
} from "../components/AnimatedMypageContent";
import { useAppSelector } from "@/lib/hooks";

export default function AccountInfoPage() {
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);
  const email = user?.email;
  const name =
    user?.user_metadata?.name || user?.user_metadata?.full_name || "-";
  const avatarUrl = user?.user_metadata?.avatar_url;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/auth");
  };

  return (
    <AnimatedMypageContent className={styles["account"]}>
      <motion.h2
        className={styles["account__title"]}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2, delay: 0.1 }}
      >
        Account Info
      </motion.h2>
      <AnimatedCard delay={0.2}>
        <div className={styles["account__info"]}>
          {avatarUrl && (
            <img
              src={avatarUrl}
              alt="avatar"
              className={styles["account__info__avatar"]}
            />
          )}
          <div className={styles["account__info__text"]}>
            <div className={styles["account__info__user-name"]}>{name}</div>
            <div className={styles["account__info__user-email"]}>
              {email || "-"}
            </div>
          </div>
        </div>
      </AnimatedCard>
      <AnimatedCard delay={0.3}>
        <button
          className={styles["account__logout-btn"]}
          onClick={handleLogout}
        >
          ログアウト
        </button>
      </AnimatedCard>
    </AnimatedMypageContent>
  );
}
