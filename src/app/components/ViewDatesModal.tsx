"use client";

import { useEffect, useMemo, useState } from "react";
import ApiService from "../services/ApiService";

interface Attendance {
  id: number;
  date: string;
  status: "Absent" | "In Person" | "Online" | "Recording";
  student_id: number;
  class_id: number;
}

interface AttendanceModalProps {
  studentId: number;
  classId: number;
  isOpen: boolean;
  onClose: () => void;
  onSave?: () => void;
}

const BLUE = "#191970";
const GOLD = "#FFD700";

const STATUS_OPTIONS = ["In Person", "Online", "Recording", "Absent"] as const;

const statusColor = (status: (typeof STATUS_OPTIONS)[number]) => {
  switch (status) {
    case "In Person":
      return "#10b981";
    case "Online":
      return "#3b82f6";
    case "Recording":
      return "#8b5cf6";
    case "Absent":
      return "#ef4444";
    default:
      return BLUE;
  }
};

const formatMMDD = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit" });

const AttendanceModal = ({ studentId, classId, isOpen, onClose, onSave }: AttendanceModalProps) => {
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [originalAttendance, setOriginalAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const [windowWidth, setWindowWidth] = useState<number>(
    typeof window !== "undefined" ? window.innerWidth : 1200
  );
  const isMobile = windowWidth <= 640;

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchAttendance();
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const data = await ApiService.get(`/attendance/student/${studentId}/class/${classId}`);
      setAttendance(data);
      setOriginalAttendance(JSON.parse(JSON.stringify(data)));
      setHasChanges(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (rowId: number, newStatus: Attendance["status"]) => {
    const updated = attendance.map((row) => (row.id === rowId ? { ...row, status: newStatus } : row));
    setAttendance(updated);
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const savePromises = attendance.map(async (row) => {
        const original = originalAttendance.find((orig) => orig.id === row.id);
        if (original && original.status !== row.status) {
          return ApiService.put(`/attendance/${row.id}`, { status: row.status });
        }
        return Promise.resolve();
      });

      await Promise.all(savePromises);

      setOriginalAttendance(JSON.parse(JSON.stringify(attendance)));
      setHasChanges(false);

      if (onSave) onSave();
    } catch (err) {
      console.error("Error saving attendance:", err);
      alert("Error saving changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (hasChanges && !window.confirm("You have unsaved changes. Close anyway?")) return;
    onClose();
  };

  const changedCount = useMemo(() => {
    let count = 0;
    for (const row of attendance) {
      const orig = originalAttendance.find((o) => o.id === row.id);
      if (orig && orig.status !== row.status) count++;
    }
    return count;
  }, [attendance, originalAttendance]);

  if (!isOpen) return null;

  return (
    <div
      onClick={handleClose}
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(2, 6, 23, 0.55)",
        display: "flex",
        alignItems: isMobile ? "flex-end" : "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: isMobile ? "10px" : "20px",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: "white",
          borderRadius: isMobile ? "18px" : "16px",
          width: "100%",
          maxWidth: "860px",
          maxHeight: isMobile ? "92vh" : "80vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          border: "1px solid rgba(25,25,112,0.12)",
          boxShadow: "0 18px 60px rgba(0,0,0,0.22)",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: isMobile ? "14px 14px" : "18px 20px",
            borderBottom: "1px solid #e5e7eb",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 10,
            background: "linear-gradient(180deg, rgba(25,25,112,0.06), rgba(255,255,255,1))",
          }}
        >
          <div>
            <h2
              style={{
                fontSize: isMobile ? "18px" : "22px",
                fontWeight: 800,
                color: BLUE,
                margin: 0,
                letterSpacing: 0.2,
              }}
            >
              Attendance Details
            </h2>
            <div style={{ fontSize: isMobile ? 12 : 13, color: "#64748b", marginTop: 4 }}>
              Update daily statuses. Changes will be saved together.
            </div>
          </div>

          <button
            onClick={handleClose}
            aria-label="Close"
            style={{
              width: isMobile ? 40 : 42,
              height: isMobile ? 40 : 42,
              borderRadius: 9999,
              border: "1px solid rgba(25,25,112,0.18)",
              backgroundColor: "white",
              cursor: "pointer",
              color: "#475569",
              fontSize: 22,
              lineHeight: 1,
              display: "grid",
              placeItems: "center",
            }}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: isMobile ? "12px" : "18px", flex: 1, overflowY: "auto" }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "36px 0", color: "#64748b" }}>Loading...</div>
          ) : attendance.length === 0 ? (
            <div style={{ textAlign: "center", padding: "36px 0", color: "#64748b" }}>
              No attendance records found.
            </div>
          ) : isMobile ? (
            // ✅ Mobile: cards
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {attendance.map((row) => (
                <div
                  key={row.id}
                  style={{
                    border: "1px solid rgba(25,25,112,0.16)",
                    borderRadius: 16,
                    backgroundColor: "white",
                    boxShadow: "0 10px 18px rgba(25,25,112,0.06)",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      padding: "12px 12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      borderBottom: "1px solid rgba(25,25,112,0.10)",
                      backgroundColor: "rgba(25,25,112,0.03)",
                    }}
                  >
                    <div style={{ fontWeight: 900, color: BLUE, fontSize: 14 }}>
                      Date: {formatMMDD(row.date)}
                    </div>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 900,
                        padding: "6px 10px",
                        borderRadius: 9999,
                        backgroundColor: row.status === "Absent" ? "#fee2e2" : "rgba(25,25,112,0.06)",
                        color: row.status === "Absent" ? "#b91c1c" : BLUE,
                        border: "1px solid rgba(25,25,112,0.14)",
                      }}
                    >
                      {row.status}
                    </span>
                  </div>

                  <div style={{ padding: 12, display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {STATUS_OPTIONS.map((opt) => {
                      const active = row.status === opt;
                      return (
                        <button
                          key={opt}
                          onClick={() => handleStatusChange(row.id, opt)}
                          style={{
                            flex: "1 1 46%",
                            padding: "11px 10px",
                            borderRadius: 9999,
                            fontWeight: 900,
                            fontSize: 14,
                            cursor: "pointer",
                            border: `2px solid ${active ? BLUE : "rgba(25,25,112,0.20)"}`,
                            color: active ? GOLD : BLUE,
                            backgroundColor: active ? BLUE : "rgba(25,25,112,0.04)",
                            boxShadow: active ? "0 10px 18px rgba(25,25,112,0.18)" : "none",
                            transition: "transform 0.08s ease, box-shadow 0.15s ease",
                          }}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>

                  <div style={{ padding: "10px 12px", fontSize: 12, color: "#64748b" }}>
                    Tip: Tap one option above.
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // ✅ Desktop: table
            <div
              style={{
                border: "1px solid rgba(25,25,112,0.18)",
                borderRadius: 16,
                overflow: "hidden",
                boxShadow: "0 10px 18px rgba(25,25,112,0.06)",
              }}
            >
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ backgroundColor: BLUE }}>
                    <th style={{ padding: "12px 14px", color: "white", textAlign: "left" }}>Date</th>
                    <th style={{ padding: "12px 14px", color: "white", textAlign: "right" }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.map((row, idx) => (
                    <tr
                      key={row.id}
                      style={{
                        backgroundColor: idx % 2 === 0 ? "#f8fafc" : "white",
                        borderTop: "1px solid rgba(25,25,112,0.10)",
                      }}
                    >
                      <td style={{ padding: "12px 14px", textAlign: "left", color: "#0f172a", fontWeight: 700 }}>
                        {formatMMDD(row.date)}
                      </td>

                      <td style={{ padding: "12px 14px", textAlign: "right" }}>
                        {STATUS_OPTIONS.map((opt) => {
                          const active = row.status === opt;
                          return (
                            <button
                              key={opt}
                              onClick={() => handleStatusChange(row.id, opt)}
                              style={{
                                marginLeft: 8,
                                padding: "8px 12px",
                                borderRadius: 9999,
                                fontWeight: 900,
                                cursor: "pointer",
                                border: active ? `2px solid ${BLUE}` : "2px solid rgba(25,25,112,0.20)",
                                color: active ? GOLD : BLUE,
                                backgroundColor: active ? BLUE : "rgba(25,25,112,0.04)",
                                boxShadow: active ? "0 10px 18px rgba(25,25,112,0.18)" : "none",
                                transition: "transform 0.08s ease, box-shadow 0.15s ease",
                              }}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: isMobile ? "12px" : "16px 20px",
            borderTop: "1px solid #e5e7eb",
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            justifyContent: "space-between",
            alignItems: isMobile ? "stretch" : "center",
            gap: 10,
            backgroundColor: "rgba(25,25,112,0.02)",
          }}
        >
          <div style={{ color: hasChanges ? "#b45309" : "#64748b", fontSize: 13, fontWeight: 700 }}>
            {hasChanges ? `• Unsaved changes (${changedCount})` : "No changes"}
          </div>

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button
              onClick={handleClose}
              disabled={saving}
              style={{
                backgroundColor: "#64748b",
                color: "white",
                padding: isMobile ? "12px 14px" : "10px 18px",
                border: "none",
                borderRadius: 12,
                fontSize: 15,
                fontWeight: 900,
                cursor: saving ? "not-allowed" : "pointer",
                opacity: saving ? 0.7 : 1,
                flex: isMobile ? 1 : "auto",
              }}
            >
              Cancel
            </button>

            <button
              onClick={handleSave}
              disabled={!hasChanges || saving}
              style={{
                backgroundColor: hasChanges ? "#10b981" : "#cbd5e1",
                color: hasChanges ? "white" : "#475569",
                padding: isMobile ? "12px 14px" : "10px 18px",
                border: "none",
                borderRadius: 12,
                fontSize: 15,
                fontWeight: 900,
                cursor: hasChanges && !saving ? "pointer" : "not-allowed",
                opacity: saving ? 0.7 : 1,
                flex: isMobile ? 1 : "auto",
              }}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceModal;
