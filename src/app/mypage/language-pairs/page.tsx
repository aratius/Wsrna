"use client";
import { useEffect, useState } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import supportedLanguages from "@/lib/supportedLanguages.json";
import { useRouter } from "next/navigation";

export default function LanguagePairsPage() {
  const router = useRouter();
  const session = useSession();
  const [languagePairs, setLanguagePairs] = useState<any[]>([]);
  const [lpLoading, setLpLoading] = useState(false);
  const [lpError, setLpError] = useState("");
  const [fromLang, setFromLang] = useState("");
  const [toLang, setToLang] = useState("");
  const [lpAdding, setLpAdding] = useState(false);

  useEffect(() => {
    const fetchLanguagePairs = async () => {
      if (!session?.user?.id) return;
      setLpLoading(true);
      setLpError("");
      try {
        const res = await fetch(
          `/api/language-pairs?user_id=${session.user.id}`
        );
        const data = await res.json();
        if (data.error) setLpError(data.error);
        else {
          const newPairs = Array.isArray(data) ? data : [data];
          setLanguagePairs(newPairs);
          setFromLang("");
          setToLang("");
        }
      } catch (e: any) {
        setLpError(e.message);
      } finally {
        setLpLoading(false);
      }
    };
    fetchLanguagePairs();
  }, [session]);

  const handleAddPair = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session || !fromLang || !toLang || fromLang === toLang) return;
    const exists = languagePairs.some(
      (lp) =>
        lp.from_lang === fromLang &&
        lp.to_lang === toLang &&
        lp.user_id === session.user.id
    );
    if (exists) {
      setLpError("This language pair already exists.");
      return;
    }
    setLpAdding(true);
    setLpError("");
    try {
      const res = await fetch("/api/language-pairs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: session.user.id,
          from_lang: fromLang,
          to_lang: toLang,
        }),
      });
      const data = await res.json();
      if (data.error) setLpError(data.error);
      else {
        const newPairs = Array.isArray(data) ? data : [data];
        setLanguagePairs((prev) => {
          const merged = [...prev, ...newPairs];
          return merged.filter(
            (pair, idx, arr) =>
              arr.findIndex(
                (p) =>
                  p.from_lang === pair.from_lang &&
                  p.to_lang === pair.to_lang &&
                  p.user_id === pair.user_id
              ) === idx
          );
        });
        setFromLang("");
        setToLang("");
      }
    } catch (e: any) {
      setLpError(e.message);
    } finally {
      setLpAdding(false);
    }
  };

  const handleDeletePair = async (id: string) => {
    if (!confirm("Delete this language pair?")) return;
    setLpError("");
    try {
      const res = await fetch("/api/language-pairs", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (data.error) setLpError(data.error);
      else setLanguagePairs((prev) => prev.filter((lp) => lp.id !== id));
    } catch (e: any) {
      setLpError(e.message);
    }
  };

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
        Language Pairs
      </h2>
      {lpLoading && <div>Loading...</div>}
      {lpError && (
        <div style={{ color: "#d50000", marginBottom: 12 }}>{lpError}</div>
      )}
      <form
        onSubmit={handleAddPair}
        style={{ display: "flex", gap: 8, marginBottom: 16 }}
      >
        <select
          className="form-control"
          value={fromLang}
          onChange={(e) => setFromLang(e.target.value)}
          required
          style={{
            minWidth: 120,
            background: "#fff",
            borderRadius: 8,
            border: "1px solid #e0e0e0",
          }}
        >
          <option value="">From</option>
          {supportedLanguages.map((l) => (
            <option key={l.code} value={l.code}>
              {l.label}
            </option>
          ))}
        </select>
        <span style={{ alignSelf: "center" }}>→</span>
        <select
          className="form-control"
          value={toLang}
          onChange={(e) => setToLang(e.target.value)}
          required
          style={{
            minWidth: 120,
            background: "#fff",
            borderRadius: 8,
            border: "1px solid #e0e0e0",
          }}
        >
          <option value="">To</option>
          {supportedLanguages.map((l) => (
            <option key={l.code} value={l.code}>
              {l.label}
            </option>
          ))}
        </select>
        <button
          className="btn"
          type="submit"
          disabled={lpAdding || !fromLang || !toLang || fromLang === toLang}
        >
          Add
        </button>
      </form>
      <ul style={{ padding: 0, margin: 0 }}>
        {languagePairs.map((lp, idx) => (
          <li
            key={lp.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 6,
              borderBottom:
                idx !== languagePairs.length - 1 ? "1px solid #e0e0e0" : "none",
              padding: "12px 0",
              position: "relative",
            }}
          >
            <span style={{ minWidth: 90 }}>
              {supportedLanguages.find((l) => l.code === lp.from_lang)?.label ||
                lp.from_lang}
            </span>
            <span style={{ fontSize: 18 }}>→</span>
            <span style={{ minWidth: 90 }}>
              {supportedLanguages.find((l) => l.code === lp.to_lang)?.label ||
                lp.to_lang}
            </span>
            <div style={{ flex: 1 }} />
            <button
              className="btn btn--error"
              style={{ marginLeft: "auto", display: "block" }}
              type="button"
              onClick={() => handleDeletePair(lp.id)}
            >
              Delete
            </button>
          </li>
        ))}
        {languagePairs.length === 0 && !lpLoading && (
          <li key="empty">No language pairs found.</li>
        )}
      </ul>
    </div>
  );
}
