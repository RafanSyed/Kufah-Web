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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);

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

  const deleteAttendance = async (classId: number) => {
    try {
      const cls = classes.find((c) => c.id === classId);
      if (!cls) return;

      await ApiService.delete(`/attendance/${cls.attendanceId}`);

      setClasses((prev) => prev.filter((c) => c.id !== classId));

      setSuccessMessage("Attendance Deleted");
      setTimeout(() => setSuccessMessage(null), 1800);
      setShowDeleteConfirm(null);
    } catch (err: any) {
      console.error("Failed to delete attendance:", err);
      setShowDeleteConfirm(null);
    }
  };

  const StatusButton = ({
    active,
    label,
    onClick,
    isDelete = false,
  }: {
    active: boolean;
    label: string;
    onClick: () => void;
    isDelete?: boolean;
  }) => (
    <button
      onClick={onClick}
      style={{
        borderRadius: 9999,
        fontWeight: 800,
        cursor: "pointer",
        border: isDelete ? "2px solid #dc2626" : `2px solid ${BLUE}`,
        color: isDelete ? "#dc2626" : active ? GOLD : BLUE,
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

  // No classes state
  if (classes.length === 0) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(180deg, #f7f9ff 0%, #ffffff 60%)",
          padding: isMobile ? "16px" : "28px",
          fontFamily: "Comfortaa, system-ui, -apple-system, Segoe UI, Roboto, Arial",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center", maxWidth: 500 }}>
          <div
            style={{
              fontSize: isMobile ? 48 : 64,
              marginBottom: 20,
            }}
          >
            📚
          </div>
          <div
            style={{
              fontSize: isMobile ? 28 : 36,
              fontWeight: 900,
              color: BLUE,
              marginBottom: 12,
            }}
          >
            Sorry, No Classes Today
          </div>
          <div
            style={{
              fontSize: isMobile ? 16 : 18,
              color: "#4b5563",
              lineHeight: 1.6,
            }}
          >
            {studentName ? `${studentName}, you` : "You"} don't have any classes scheduled for {attendanceDate || "today"}.
          </div>
        </div>
      </div>
    );
  }

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

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm !== null && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10000,
            padding: 16,
          }}
          onClick={() => setShowDeleteConfirm(null)}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: 16,
              padding: isMobile ? "24px" : "32px",
              maxWidth: 400,
              width: "100%",
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                fontSize: isMobile ? 20 : 24,
                fontWeight: 900,
                color: "#dc2626",
                marginBottom: 12,
                textAlign: "center",
              }}
            >
              Are you sure?
            </div>
            <div
              style={{
                fontSize: 15,
                color: "#4b5563",
                marginBottom: 24,
                textAlign: "center",
              }}
            >
              You can't undo this. This will permanently delete this attendance record.
            </div>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button
                onClick={() => setShowDeleteConfirm(null)}
                style={{
                  padding: "12px 24px",
                  borderRadius: 9999,
                  fontWeight: 800,
                  cursor: "pointer",
                  border: `2px solid ${BLUE}`,
                  color: BLUE,
                  backgroundColor: "transparent",
                  fontSize: 16,
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => deleteAttendance(showDeleteConfirm)}
                style={{
                  padding: "12px 24px",
                  borderRadius: 9999,
                  fontWeight: 800,
                  cursor: "pointer",
                  border: "2px solid #dc2626",
                  color: "white",
                  backgroundColor: "#dc2626",
                  fontSize: 16,
                }}
              >
                Delete
              </button>
            </div>
          </div>
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
                    color: GOLD,
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
                  <StatusButton
                    label="No Class"
                    active={false}
                    onClick={() => setShowDeleteConfirm(cls.id)}
                    isDelete={true}
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
