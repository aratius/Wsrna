"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import "@/styles/components/_bottomnav.scss";
import { useSession, useSessionContext } from "@supabase/auth-helpers-react";

const NAV_ITEMS = [
  {
    href: "/",
    label: "Home",
    icon: (
      <svg
        width="24"
        height="24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 12L12 3l9 9" />
        <path d="M9 21V9h6v12" />
      </svg>
    ),
  },
  {
    href: "/quiz",
    label: "Quiz",
    icon: (
      <svg
        width="24"
        height="24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="4" y="4" width="16" height="16" rx="2" />
        <path d="M8 10h8M8 14h6" />
      </svg>
    ),
  },
  {
    href: "/create",
    label: "Create",
    icon: (
      <svg
        width="24"
        height="24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    ),
  },
  {
    href: "/mypage",
    label: "My Page",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4 8-4 8-4s8 0 8 4" />
      </svg>
    ),
  },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { isLoading } = useSessionContext();
  const session = useSession();
  // Google avatar URL (if available)
  const avatarUrl = session?.user?.user_metadata?.avatar_url;
  console.log("session", session);
  if (session?.user?.user_metadata) {
    console.log("user_metadata:", session.user.user_metadata);
  }
  return (
    <nav className="bottom-nav">
      {NAV_ITEMS.map((item) => {
        const active = pathname === item.href;
        // My Pageアイコンだけ動的に差し替え
        if (item.href === "/mypage") {
          return (
            <Link
              href={item.href}
              key={item.href}
              className={"bottom-nav__item" + (active ? " is-active" : "")}
            >
              <span className="bottom-nav__icon">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Profile"
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: active ? "2px solid #4285F4" : "1px solid #ccc",
                      background: "#fff",
                    }}
                  />
                ) : (
                  item.icon
                )}
              </span>
              <span className="bottom-nav__label">{item.label}</span>
            </Link>
          );
        }
        return (
          <Link
            href={item.href}
            key={item.href}
            className={"bottom-nav__item" + (active ? " is-active" : "")}
          >
            <span className="bottom-nav__icon">{item.icon}</span>
            <span className="bottom-nav__label">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
