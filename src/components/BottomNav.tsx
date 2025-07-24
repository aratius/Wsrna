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
        <circle cx="12" cy="12" r="10" />
        <path d="M8 15h8M9 9h6" />
      </svg>
    ),
  },
  {
    href: "/review",
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
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        <path d="M22 4 12 14.01l-3-3" />
      </svg>
    ),
  },
  {
    href: "/myquizzes",
    label: "My Page",
    icon: (
      // Google G icon SVG (multicolor)
      <svg width="24" height="24" viewBox="0 0 24 24">
        <g>
          <path
            d="M21.805 10.023h-9.765v3.955h5.605c-.241 1.238-1.445 3.637-5.605 3.637-3.373 0-6.123-2.792-6.123-6.215s2.75-6.215 6.123-6.215c1.922 0 3.213.819 3.953 1.523l2.703-2.633c-1.703-1.582-3.902-2.555-6.656-2.555-5.523 0-10 4.477-10 10s4.477 10 10 10c5.77 0 9.605-4.045 9.605-9.75 0-.656-.07-1.156-.156-1.547z"
            fill="#4285F4"
          />
          <path
            d="M3.153 7.345l3.252 2.387c.885-1.682 2.617-2.855 4.635-2.855 1.322 0 2.5.453 3.428 1.344l2.57-2.57c-1.703-1.582-3.902-2.555-6.656-2.555-3.977 0-7.32 2.613-8.605 6.249z"
            fill="#34A853"
          />
          <path
            d="M12.04 22c2.7 0 4.963-.891 6.617-2.418l-3.07-2.52c-.822.555-1.875.885-3.547.885-2.73 0-5.045-1.844-5.872-4.32l-3.23 2.492c1.563 3.18 4.885 5.881 9.102 5.881z"
            fill="#FBBC05"
          />
          <path
            d="M21.805 10.023h-9.765v3.955h5.605c-.241 1.238-1.445 3.637-5.605 3.637-3.373 0-6.123-2.792-6.123-6.215s2.75-6.215 6.123-6.215c1.922 0 3.213.819 3.953 1.523l2.703-2.633c-1.703-1.582-3.902-2.555-6.656-2.555-5.523 0-10 4.477-10 10s4.477 10 10 10c5.77 0 9.605-4.045 9.605-9.75 0-.656-.07-1.156-.156-1.547z"
            fill="none"
          />
          <path
            d="M21.805 10.023h-9.765v3.955h5.605c-.241 1.238-1.445 3.637-5.605 3.637-3.373 0-6.123-2.792-6.123-6.215s2.75-6.215 6.123-6.215c1.922 0 3.213.819 3.953 1.523l2.703-2.633c-1.703-1.582-3.902-2.555-6.656-2.555-5.523 0-10 4.477-10 10s4.477 10 10 10c5.77 0 9.605-4.045 9.605-9.75 0-.656-.07-1.156-.156-1.547z"
            fill="#EA4335"
            fillOpacity=".7"
          />
        </g>
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
        if (item.href === "/myquizzes") {
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
