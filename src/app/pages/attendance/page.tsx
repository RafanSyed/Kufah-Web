"use client";
export const dynamic = "force-dynamic";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ApiService from "../../services/ApiService";
import { Home } from "lucide-react";

type ClassItem = {
  id: number;
  name: string;
  attendanceId: number;
  status: "Absent" | "In Person" | "Online" | "Recording";
  token: string;
};

const GOLD = "#FFD700";
const BLUE = "#191970";

const AttendanceContent: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const link = searchParams.get("token");

  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [studentName, setStudentName] = useState<string>("");
  const [attendanceDate, setAttendanceDate] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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
    if (!link) {
      setError("Missing link token");
      setLoading(false);
      return;
    }

    const initializeAttendance = async () => {
      try {
        let token = link;
        try {
          const parsed = new URL(link);
          token = parsed.searchParams.get("token") || link;
        } catch {}

        const response = await ApiService.get(`/attendance/email/${encodeURIComponent(token)}`);
        const records = response.records;

        if (!records || records.length === 0) {
          setError("No attendance found for this link");
          setLoading(false);
          return;
        }

        const firstDate = new Date(records[0].date);
        setAttendanceDate(
          `${firstDate.getMonth() + 1}/${firstDate.getDate()}/${firstDate.getFullYear()}`
        );

        const firstStudentId = records[0]?.student_id;
        if (firstStudentId) {
          try {
            const studentResp = await ApiService.get(`/students/${firstStudentId}`);
            const s = studentResp?.data ?? studentResp;
            const full = `${s?.firstName ?? ""} ${s?.lastName ?? ""}`.trim();
            setStudentName(full || "Student");
          } catch {
            setStudentName("Student");
          }
        }

        const classesWithNames: ClassItem[] = await Promise.all(
          records.map(async (row: any) => {
            const cls = await ApiService.get(`/classes/${row.class_id}`);
            const c = cls?.data ?? cls;
            return {
              id: row.class_id,
              name: c.name,
              attendanceId: row.id,
              status: row.status,
              token: row.token,
            };
          })
        );

        setClasses(classesWithNames);
        setLoading(false);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Failed to load attendance");
        setLoading(false);
      }
    };

    initializeAttendance();
  }, [link]);

  const markAttendance = async (classId: number, status: ClassItem["status"]) => {
    try {
      const cls = classes.find((c) => c.id === classId);
      if (!cls || !cls.token) return;

      const updated = await ApiService.put(`/attendance/${cls.attendanceId}`, { status });

      setClasses((prev) =>
        prev.map((c) => (c.id === classId ? { ...c, status: updated.status } : c))
      );

      setSuccessMessage("Attendance Updated");
      setTimeout(() => setSuccessMessage(null), 1800);
    } catch (err: any) {
      console.error("Failed to update attendance:", err);
    }
  };

  const StatusButton = ({
    active,
    label,
    onClick,
  }: {
    active: boolean;
    label: string;
    onClick: () => void;
  }) => (
    <button
      onClick={onClick}
      style={{
        borderRadius: 9999,
        fontWeight: 800,
        cursor: "pointer",
        border: `2px solid ${BLUE}`,
        color: active ? GOLD : BLUE,                 // ✅ gold when selected
        backgroundColor: active ? BLUE : "transparent",
        transition: "all 0.15s ease-in-out",
        padding: isMobile ? "12px 14px" : "14px 20px",
        fontSize: isMobile ? "16px" : "18px",
        minWidth: isMobile ? "48%" : "140px",
        boxShadow: active ? "0 6px 16px rgba(25,25,112,0.25)" : "none",
      }}
    >
      {label}
    </button>
  );

  if (loading) return <div style={{ padding: 16 }}>Loading...</div>;
  if (error) return <div style={{ padding: 16, color: "#b91c1c" }}>{error}</div>;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #f7f9ff 0%, #ffffff 60%)",
        padding: isMobile ? "16px" : "28px",
        fontFamily: "Comfortaa, system-ui, -apple-system, Segoe UI, Roboto, Arial",
      }}
    >
      {successMessage && (
        <div
          style={{
            position: "fixed",
            top: 18,
            right: 18,
            backgroundColor: "#d1fae5",
            color: "#065f46",
            padding: "10px 16px",
            borderRadius: 10,
            fontWeight: 700,
            boxShadow: "0 10px 18px rgba(0,0,0,0.12)",
            zIndex: 9999,
          }}
        >
          ✅ {successMessage}
        </div>
      )}

      {/* Top bar */}
      <div
        style={{
          maxWidth: 980,
          margin: "0 auto",
          display: "flex",
          alignItems: isMobile ? "flex-start" : "center",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: isMobile ? 12 : 18,
        }}
      >
        <div>
          <div
            style={{
              fontWeight: 900,
              color: BLUE,
              fontSize: isMobile ? 20 : 24,
              lineHeight: 1.1,
            }}
          >
            {studentName ? `Hi, ${studentName}` : "Hi"}
          </div>

          <div style={{ color: "#374151", fontSize: 13, opacity: 0.9, marginTop: 4 }}>
            {attendanceDate ? `Date: ${attendanceDate}` : ""}
          </div>

          <div style={{ color: "#374151", fontSize: 13, opacity: 0.8, marginTop: 2 }}>
            Mark your attendance for each class below.
          </div>
        </div>

        <button
          onClick={() => router.push(`/pages/studentDashboard?token=${link}`)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            backgroundColor: BLUE,
            color: GOLD,                               // ✅ gold text
            border: "none",
            borderRadius: 9999,
            padding: isMobile ? "10px 16px" : "12px 18px",
            fontWeight: 900,
            cursor: "pointer",
            boxShadow: "0 10px 18px rgba(25,25,112,0.25)",
            whiteSpace: "nowrap",
          }}
        >
          <Home style={{ width: isMobile ? 20 : 22, height: isMobile ? 20 : 22, color: GOLD }} />
          Home
        </button>
      </div>

      {/* Cards */}
      <div style={{ maxWidth: 980, margin: "0 auto" }}>
        {classes.length === 0 ? (
          <div style={{ textAlign: "center", color: "#4b5563", padding: 16 }}>
            No classes found.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? 14 : 18 }}>
            {classes.map((cls) => (
              <div
                key={cls.id}
                style={{
                  border: "2px solid rgba(25,25,112,0.22)",
                  borderRadius: 16,
                  backgroundColor: "white",
                  boxShadow: "0 10px 18px rgba(0,0,0,0.06)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: isMobile ? "column" : "row",
                    alignItems: isMobile ? "stretch" : "center",
                    justifyContent: "space-between",
                    gap: isMobile ? 12 : 18,
                    padding: isMobile ? 14 : 18,
                  }}
                >
                  <div
                    style={{
                      backgroundColor: BLUE,
                      color: GOLD,                         // ✅ gold class name text
                      fontWeight: 900,
                      textAlign: "center",
                      borderRadius: 12,
                      padding: isMobile ? "12px 12px" : "14px 18px",
                      fontSize: isMobile ? 18 : 20,
                      minWidth: isMobile ? "100%" : 220,
                      letterSpacing: 0.2,
                    }}
                  >
                    {cls.name}
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 10,
                      justifyContent: isMobile ? "space-between" : "flex-end",
                      flex: 1,
                    }}
                  >
                    <StatusButton
                      label="In Person"
                      active={cls.status === "In Person"}
                      onClick={() => markAttendance(cls.id, "In Person")}
                    />
                    <StatusButton
                      label="Online"
                      active={cls.status === "Online"}
                      onClick={() => markAttendance(cls.id, "Online")}
                    />
                    <StatusButton
                      label="Recording"
                      active={cls.status === "Recording"}
                      onClick={() => markAttendance(cls.id, "Recording")}
                    />
                    <StatusButton
                      label="Absent"
                      active={cls.status === "Absent"}
                      onClick={() => markAttendance(cls.id, "Absent")}
                    />
                  </div>
                </div>

                <div
                  style={{
                    padding: isMobile ? "10px 14px" : "10px 18px",
                    borderTop: "1px solid rgba(25,25,112,0.12)",
                    color: "#374151",
                    fontSize: 13,
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <span>
                    Selected: <b style={{ color: BLUE }}>{cls.status}</b>
                  </span>
                  <span style={{ opacity: 0.7 }}>Tap to update</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const LoadingFallback: React.FC = () => (
  <div style={{ padding: 24, maxWidth: 980, margin: "0 auto" }}>
    <div style={{ textAlign: "center" }}>Loading attendance...</div>
  </div>
);

const AttendancePage: React.FC = () => (
  <Suspense fallback={<LoadingFallback />}>
    <AttendanceContent />
  </Suspense>
);

export default AttendancePage;
