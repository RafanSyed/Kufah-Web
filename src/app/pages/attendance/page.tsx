'use client';
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

const AttendanceContent: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const link = searchParams.get("token"); // the token from the URL query

  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attendanceDate, setAttendanceDate] = useState<string>("");

  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [windowWidth, setWindowWidth] = useState<number>(
    typeof window !== "undefined" ? window.innerWidth : 1200
  );

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getResponsive = () => {
    if (windowWidth <= 640) {
      return {
        titleFont: "1.8rem",
        homeBtn: { padding: "8px 20px", fontSize: "18px", minWidth: "110px", minHeight: "50px" },
        homeIcon: { width: "28px", height: "28px" },
        classBox: { fontSize: "16px", width: "200px", padding: "12px 0" },
        attBtn: { fontSize: "16px", padding: "10px 20px" },
      };
    } else if (windowWidth <= 1024) {
      return {
        titleFont: "2.2rem",
        homeBtn: { padding: "12px 28px", fontSize: "22px", minWidth: "140px", minHeight: "60px" },
        homeIcon: { width: "40px", height: "40px" },
        classBox: { fontSize: "20px", width: "240px", padding: "14px 0" },
        attBtn: { fontSize: "18px", padding: "14px 28px" },
      };
    } else {
      return {
        titleFont: "2.8rem",
        homeBtn: { padding: "15px 35px", fontSize: "26px", minWidth: "170px", minHeight: "70px" },
        homeIcon: { width: "48px", height: "48px" },
        classBox: { fontSize: "24px", width: "300px", padding: "18px 0" },
        attBtn: { fontSize: "20px", padding: "18px 36px" },
      };
    }
  };

  const sizes = getResponsive();

  useEffect(() => {
    if (!link) {
      setError("Missing link token");
      setLoading(false);
      return;
    }

    const initializeAttendance = async () => {
      try {
        // Extract token safely from a full link if needed
        let token = link;
        try {
          const parsed = new URL(link);
          token = parsed.searchParams.get("token") || link;
        } catch (err) {
          // If link is already a token, ignore
        }

        const response = await ApiService.get(`/attendance/email/${encodeURIComponent(token)}`);
        const records = response.records;

        if (!records || records.length === 0) {
          setError("No attendance found for this link");
          setLoading(false);
          return;
        }

        // Use the date from the first record for header
        const firstDate = new Date(records[0].date);
        setAttendanceDate(`${firstDate.getMonth() + 1}/${firstDate.getDate()}/${firstDate.getFullYear()}`);

        const classesWithNames: ClassItem[] = await Promise.all(
          records.map(async (row: any) => {
            const cls = await ApiService.get(`/classes/${row.class_id}`);
            return {
              id: row.class_id,
              name: cls.name,
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
        prev.map((c) =>
          c.id === classId ? { ...c, status: updated.status } : c
        )
      );

      // ✅ success popup
      setSuccessMessage("Attendance Updated");
      setTimeout(() => setSuccessMessage(null), 2000);
    } catch (err: any) {
      console.error("Failed to update attendance:", err);
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto relative">
      {/* ✅ success popup */}
      {successMessage && (
        <div
          style={{
            position: "fixed",
            top: "20px",
            right: "20px",
            backgroundColor: "#d1fae5",
            color: "#065f46",
            padding: "10px 20px",
            borderRadius: "8px",
            fontWeight: "bold",
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            zIndex: 9999,
          }}
        >
          ✅ {successMessage}
        </div>
      )}

      <div className="relative w-full mb-12">
        <h1
          style={{
            fontFamily: "Comfortaa",
            fontWeight: "bold",
            fontSize: sizes.titleFont,
            color: "#191970",
            textAlign: "center",
          }}
        >
          {attendanceDate ? `${attendanceDate} Attendance` : "ATTENDANCE"}
        </h1>

        <button
          onClick={() => router.push(`/pages/studentDashboard?token=${link}`)}
          className="flex items-center gap-4 bg-[#191970] rounded-full shadow-xl hover:bg-blue-900 transition-all duration-200 ease-in-out"
          style={{
            position: windowWidth > 640 ? "absolute" : "static",
            top: windowWidth > 640 ? "-10px" : "auto",
            right: windowWidth > 640 ? "20px" : "auto",
            marginTop: windowWidth <= 640 ? "1rem" : "0",
            ...sizes.homeBtn,
            color: "white",
            marginLeft: windowWidth <= 640 ? "auto" : "0",
            marginRight: windowWidth <= 640 ? "auto" : "0",
          }}
        >
          <Home style={{ ...sizes.homeIcon, color: "white" }} />
          <span style={{ fontWeight: "bold", color: "white" }}>Home</span>
        </button>
      </div>

      {classes.length === 0 ? (
        <div className="text-center text-gray-600 p-4">No classes found.</div>
      ) : (
        <div className="flex flex-col gap-10">
          {classes.map((cls) => (
            <div
              key={cls.id}
              className="flex items-center justify-between p-6"
              style={{
                border: "3px solid #191970",
                borderRadius: "8px",
                fontFamily: "Comfortaa, sans-serif",
                flexWrap: windowWidth <= 640 ? "wrap" : "nowrap",
              }}
            >
              <div
                style={{
                  backgroundColor: "#191970",
                  color: "white",
                  fontWeight: "bold",
                  textAlign: "center",
                  width: windowWidth <= 640 ? "100%" : sizes.classBox.width,
                  padding: sizes.classBox.padding,
                  fontSize: sizes.classBox.fontSize,
                }}
              >
                {cls.name}
              </div>

              <div className="flex flex-1 justify-around ml-6 flex-wrap gap-2">
                {["In Person", "Online", "Recording"].map((statusOption) => (
                  <button
                    key={statusOption}
                    onClick={() =>
                      markAttendance(cls.id, statusOption as ClassItem["status"])
                    }
                    style={{
                      borderRadius: "9999px",
                      fontWeight: "700",
                      cursor: "pointer",
                      border: "3px solid #191970",
                      color:
                        cls.status === statusOption ? "#FFD700" : "#191970",
                      backgroundColor:
                        cls.status === statusOption ? "#191970" : "transparent",
                      transition: "all 0.2s ease-in-out",
                      ...sizes.attBtn,
                    }}
                  >
                    {statusOption}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const LoadingFallback: React.FC = () => (
  <div className="p-6 max-w-4xl mx-auto">
    <div className="text-center">Loading attendance...</div>
  </div>
);

const AttendancePage: React.FC = () => (
  <Suspense fallback={<LoadingFallback />}>
    <AttendanceContent />
  </Suspense>
);

export default AttendancePage;
