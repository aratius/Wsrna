import Link from "next/link";

const menuItems = [
  { label: "Account Info", href: "/mypage/account" },
  { label: "Language Pairs", href: "/mypage/language-pairs" },
  { label: "Saved Idioms", href: "/mypage/saved-idioms" },
  // 必要に応じて他のメニューも追加
];

export default function MyPage() {
  return (
    <div
      style={{
        background: "#f2f2f7",
        minHeight: "100vh",
        padding: "24px 20px",
      }}
    >
      <h1
        style={{
          fontSize: 24,
          fontWeight: 700,
          margin: "0 0 24px 0",
          textAlign: "center",
        }}
      >
        My Page
      </h1>
      <ul style={{ padding: 0, margin: 0 }}>
        {menuItems.map((item, idx) => (
          <li
            key={item.href}
            style={{
              borderBottom:
                idx !== menuItems.length - 1 ? "1px solid #e0e0e0" : "none",
              background: "none",
            }}
          >
            <Link
              href={item.href}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "18px 20px",
                textDecoration: "none",
                color: "#222",
                fontSize: 17,
              }}
            >
              {item.label}
              <span style={{ color: "#bbb", fontSize: 22 }}>&gt;</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
