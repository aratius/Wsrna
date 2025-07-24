"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import "@/styles/components/_bottomnav.scss";

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
      <svg
        width="24"
        height="24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4 16-4 16 0" />
      </svg>
    ),
  },
];

export default function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="bottom-nav">
      {NAV_ITEMS.map((item) => {
        const active = pathname === item.href;
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
