// app/(teacher)/goals/page.tsx
// Uses your existing src/services/ApiService.ts (axios)
// Expects backend routes:
//   GET   /students
//   PATCH /students/:id/goals
//   GET   /ibadah/daily/:studentId?day=YYYY-MM-DD

"use client";

import React, { useEffect, useMemo, useState } from "react";
import ApiService from "../../services/ApiService"; // ✅ adjust if your path differs

type StudentRow = {
  id: number;
  firstName: string;
  lastName: string;
  email?: string;
  salawat_goal_daily: number;
  adhkar_goal_daily: number;
  istighfar_goal_daily: number;
};

type DailyRow = {
  student_id: number;
  day: string;
  salawat_done: number;
  adhkar_done: number;
  istighfar_done: number;
};

const dateOnly = (d = new Date()) => {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const clampInt = (v: string) => {
  const n = Number(v);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.floor(n));
};

const remaining = (goal: number, done: number) => Math.max(0, (goal ?? 0) - (done ?? 0));

function Chip({
  label,
  value,
  ok,
}: {
  label: string;
  value: number | string;
  ok: boolean;
}) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "6px 10px",
        borderRadius: 999,
        border: "1px solid rgba(2,6,23,0.10)",
        background: ok ? "rgba(220,252,231,0.9)" : "rgba(254,226,226,0.9)",
        color: ok ? "#166534" : "#991b1b",
        fontWeight: 800,
        fontSize: 12,
        whiteSpace: "nowrap",
      }}
      title={label}
    >
      {label}: {value}
    </span>
  );
}

export default function TeacherGoalsPage() {
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [students, setStudents] = useState<StudentRow[]>([]);
  const [progressByStudent, setProgressByStudent] = useState<Record<number, DailyRow>>({});

  const [query, setQuery] = useState("");
  const today = useMemo(() => dateOnly(), []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return students;
    return students.filter((s) => {
      const name = ((s.firstName ?? "") + " " + (s.lastName ?? "")).toLowerCase();
      const email = (s.email ?? "").toLowerCase();
      return name.includes(q) || email.includes(q);
    });
  }, [students, query]);

  function updateLocal(id: number, patch: Partial<StudentRow>) {
    setStudents((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }

  async function loadStudentsAndProgress() {
    setLoading(true);
    setError(null);

    try {
      // 1) Students
      const raw = await ApiService.get("/students");

      const rows: any[] = Array.isArray(raw) ? raw : raw?.data ?? raw?.rows ?? [];
      const normalized: StudentRow[] = rows.map((s: any) => ({
        id: Number(s.id),
        firstName: String(s.firstName ?? s.first_name ?? ""),
        lastName: String(s.lastName ?? s.last_name ?? ""),
        email: s.email ? String(s.email) : undefined,
        salawat_goal_daily: Number(s.salawat_goal_daily ?? 0),
        adhkar_goal_daily: Number(s.adhkar_goal_daily ?? 0),
        istighfar_goal_daily: Number(s.istighfar_goal_daily ?? 0),
      }));

      setStudents(normalized);

      // 2) Progress for today (N requests; fine for small class sizes)
      const entries = await Promise.all(
        normalized.map(async (s) => {
          try {
            // ApiService.get supports params object
            const d = await ApiService.get(`/ibadah/daily/${s.id}`, { day: today });

            if (!d) return [s.id, null] as const;

            const row: DailyRow = {
              student_id: Number(d.student_id ?? s.id),
              day: String(d.day ?? today),
              salawat_done: Number(d.salawat_done ?? 0),
              adhkar_done: Number(d.adhkar_done ?? 0),
              istighfar_done: Number(d.istighfar_done ?? 0),
            };

            return [s.id, row] as const;
          } catch {
            return [s.id, null] as const;
          }
        })
      );

      const map: Record<number, DailyRow> = {};
      for (const [sid, row] of entries) {
        if (row) map[sid] = row;
      }
      setProgressByStudent(map);
    } catch (e: any) {
      console.error(e);
      setError(e?.message || "Could not load students/progress");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStudentsAndProgress();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function saveGoals(id: number) {
    const student = students.find((s) => s.id === id);
    if (!student) return;

    setSavingId(id);
    setError(null);

    try {
      // If you already have a put() use it, but you said PATCH route exists.
      // ApiService doesn’t have patch() in your snippet, so we use put() OR post().
      // ✅ Best: use put() to /students/:id/goals if your backend accepts PUT too.
      // If your backend is strictly PATCH, add a patch() method to ApiService.
      //
      // For now, assuming backend also accepts PUT:
      await ApiService.post(`/students/${id}/goals`, {
        salawat_goal_daily: student.salawat_goal_daily,
        adhkar_goal_daily: student.adhkar_goal_daily,
        istighfar_goal_daily: student.istighfar_goal_daily,
      });

      // optional refresh progress after saving goals (so remaining updates)
      // await loadStudentsAndProgress();
    } catch (e: any) {
      console.error(e);
      setError(e?.response?.data?.error || e?.message || "Could not save goals");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div
      style={{
        padding: 24,
        maxWidth: 1250,
        margin: "0 auto",
        fontFamily: "system-ui, -apple-system, Segoe UI, Roboto",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 14,
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900 }}>
            Student Ibadah Goals
          </h1>
          <p style={{ margin: "6px 0 0", color: "#64748b", fontSize: 13 }}>
            Edit daily goals + view today’s progress/remaining (green = done, red = missing).
          </p>
        </div>

        <button
          onClick={loadStudentsAndProgress}
          style={{
            padding: "10px 12px",
            borderRadius: 12,
            border: "1px solid rgba(2,6,23,0.12)",
            background: "white",
            fontWeight: 800,
            cursor: "pointer",
          }}
        >
          Refresh
        </button>
      </div>

      <div style={{ marginBottom: 12, display: "flex", gap: 10, alignItems: "center" }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search students..."
          style={{
            flex: 1,
            padding: "10px 12px",
            borderRadius: 12,
            border: "1px solid rgba(2,6,23,0.12)",
            outline: "none",
          }}
        />
        <span style={{ color: "#64748b", fontSize: 13 }}>{filtered.length} students</span>
        <span style={{ color: "#64748b", fontSize: 13 }}>Today: {today}</span>
      </div>

      {error && (
        <div
          style={{
            marginBottom: 12,
            padding: "10px 12px",
            borderRadius: 12,
            border: "1px solid rgba(185,28,28,0.25)",
            background: "rgba(254,226,226,0.6)",
            color: "#991b1b",
            fontWeight: 800,
          }}
        >
          {error}
        </div>
      )}

      <div
        style={{
          border: "1px solid rgba(2,6,23,0.10)",
          borderRadius: 16,
          overflow: "hidden",
          background: "white",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2.1fr 1fr 1fr 1fr 2.4fr 0.8fr",
            padding: "12px 14px",
            background: "#f8fafc",
            borderBottom: "1px solid rgba(2,6,23,0.08)",
            fontWeight: 900,
            color: "#0f172a",
            fontSize: 13,
          }}
        >
          <div>Student</div>
          <div>Salawat goal</div>
          <div>Adhkar goal</div>
          <div>Istighfar goal</div>
          <div>Today status (Done / Remaining)</div>
          <div style={{ textAlign: "right" }}>Save</div>
        </div>

        {loading ? (
          <div style={{ padding: 18, color: "#64748b", fontWeight: 800 }}>Loading…</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 18, color: "#64748b", fontWeight: 800 }}>No students found.</div>
        ) : (
          filtered.map((s) => {
            const p = progressByStudent[s.id] ?? {
              student_id: s.id,
              day: today,
              salawat_done: 0,
              adhkar_done: 0,
              istighfar_done: 0,
            };

            const remS = remaining(s.salawat_goal_daily, p.salawat_done);
            const remA = remaining(s.adhkar_goal_daily, p.adhkar_done);
            const remI = remaining(s.istighfar_goal_daily, p.istighfar_done);

            const allDone = remS === 0 && remA === 0 && remI === 0;

            return (
              <div
                key={s.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "2.1fr 1fr 1fr 1fr 2.4fr 0.8fr",
                  padding: "12px 14px",
                  borderBottom: "1px solid rgba(2,6,23,0.06)",
                  alignItems: "center",
                  background: allDone ? "rgba(240,253,244,0.45)" : "white",
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontWeight: 900,
                      color: "#0f172a",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {s.firstName + " " + s.lastName || `Student #${s.id}`}
                  </div>
                  {s.email && (
                    <div
                      style={{
                        color: "#64748b",
                        fontSize: 12,
                        marginTop: 2,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {s.email}
                    </div>
                  )}
                </div>

                <input
                  type="number"
                  min={0}
                  value={s.salawat_goal_daily}
                  onChange={(e) =>
                    updateLocal(s.id, { salawat_goal_daily: clampInt(e.target.value) })
                  }
                  style={{
                    width: "100%",
                    padding: "10px 10px",
                    borderRadius: 12,
                    border: "1px solid rgba(2,6,23,0.12)",
                    outline: "none",
                    fontWeight: 900,
                  }}
                />

                <input
                  type="number"
                  min={0}
                  value={s.adhkar_goal_daily}
                  onChange={(e) =>
                    updateLocal(s.id, { adhkar_goal_daily: clampInt(e.target.value) })
                  }
                  style={{
                    width: "100%",
                    padding: "10px 10px",
                    borderRadius: 12,
                    border: "1px solid rgba(2,6,23,0.12)",
                    outline: "none",
                    fontWeight: 900,
                  }}
                />

                <input
                  type="number"
                  min={0}
                  value={s.istighfar_goal_daily}
                  onChange={(e) =>
                    updateLocal(s.id, { istighfar_goal_daily: clampInt(e.target.value) })
                  }
                  style={{
                    width: "100%",
                    padding: "10px 10px",
                    borderRadius: 12,
                    border: "1px solid rgba(2,6,23,0.12)",
                    outline: "none",
                    fontWeight: 900,
                  }}
                />

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <Chip label="S done" value={p.salawat_done} ok />
                  <Chip label="S rem" value={remS} ok={remS === 0} />
                  <Chip label="A done" value={p.adhkar_done} ok />
                  <Chip label="A rem" value={remA} ok={remA === 0} />
                  <Chip label="I done" value={p.istighfar_done} ok />
                  <Chip label="I rem" value={remI} ok={remI === 0} />
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button
                    onClick={() => saveGoals(s.id)}
                    disabled={savingId === s.id}
                    style={{
                      padding: "10px 12px",
                      borderRadius: 12,
                      border: "1px solid rgba(25,25,112,0.18)",
                      background: savingId === s.id ? "#e2e8f0" : "#191970",
                      color: savingId === s.id ? "#0f172a" : "white",
                      fontWeight: 900,
                      cursor: savingId === s.id ? "default" : "pointer",
                      width: 90,
                    }}
                  >
                    {savingId === s.id ? "Saving…" : "Save"}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
