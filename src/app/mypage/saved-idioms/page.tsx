"use client";
import { useEffect, useState } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import { useRouter } from "next/navigation";

export default function SavedIdiomsPage() {
  const router = useRouter();
  const session = useSession();
  const [idioms, setIdioms] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [explanationOpen, setExplanationOpen] = useState<{
    [id: string]: boolean;
  }>({});

  useEffect(() => {
    const fetchIdioms = async () => {
      if (!session?.user?.id) return;
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/idioms?user_id=${session.user.id}`);
        const data = await res.json();
        if (data.error) setError(data.error);
        else setIdioms(data || []);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchIdioms();
  }, [session]);

  if (!session) return null;

  return (
    <div
      style={{
        background: "#f2f2f7",
        minHeight: "100vh",
        padding: "24px 20px",
      }}
    >
      <button
        onClick={() => router.back()}
        className="btn"
        style={{ marginBottom: 16 }}
      >
        &lt; 戻る
      </button>
      <h2
        style={{
          fontSize: 20,
          fontWeight: 700,
          margin: "0 0 20px 0",
          textAlign: "center",
        }}
      >
        Saved Idioms
      </h2>
      {loading && <div>Loading...</div>}
      {error && (
        <div style={{ color: "#d50000", marginBottom: 12 }}>{error}</div>
      )}
      {idioms.length === 0 && !loading ? (
        <div>No idioms saved.</div>
      ) : (
        <ul style={{ padding: 0, margin: 0 }}>
          {idioms.map((idiom, idx) => (
            <li
              key={idiom.id}
              style={{
                marginBottom: 0,
                borderBottom:
                  idx !== idioms.length - 1 ? "1px solid #e0e0e0" : "none",
                padding: "16px 0",
              }}
            >
              <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 4 }}>
                {idiom.main_word}
              </div>
              <div style={{ color: "#888", marginBottom: 8 }}>
                {Array.isArray(idiom.main_word_translations)
                  ? idiom.main_word_translations.join(", ")
                  : idiom.main_word_translations}
              </div>
              <button
                type="button"
                className="btn btn--secondary"
                style={{ fontSize: 15, padding: "4px 12px", marginBottom: 4 }}
                onClick={() =>
                  setExplanationOpen((prev) => ({
                    ...prev,
                    [idiom.id]: !prev[idiom.id],
                  }))
                }
              >
                {explanationOpen[idiom.id]
                  ? "Hide Explanation"
                  : "Show Explanation"}
              </button>
              {explanationOpen[idiom.id] && (
                <div
                  style={{
                    marginTop: 8,
                    color: "#fff",
                    background: "#222",
                    fontSize: 15,
                    borderRadius: 8,
                    padding: "12px 16px",
                  }}
                >
                  {idiom.explanation}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
