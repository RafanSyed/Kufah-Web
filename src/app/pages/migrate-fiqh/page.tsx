"use client";
export const dynamic = "force-dynamic";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ApiService from "../../services/ApiService";

const BLUE = "#191970";
const GOLD = "#FFD700";
const RED = "#dc2626";

const MigrateFiqhPage: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get("token");

  const [studentId, setStudentId] = useState<number | null>(null);
  const [studentName, setStudentName] = useState("");
  const [dashboardLink, setDashboardLink] = useState("");

  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  // 1. Resolve token → student
  useEffect(() => {
    if (!token) {
      setError("Missing token");
      setLoading(false);
      return;
    }

    const fetchStudent = async () => {
      try {
        const response = await ApiService.get(
          `/attendance/token/${encodeURIComponent(token)}`
        );

        const data = response;

        if (!data?.student_id) {
          setError("Invalid token");
          setLoading(false);
          return;
        }

        setStudentId(data.student_id);
        setStudentName(data.student_name || "Student");

        // 2. Get dashboard link safely
        const attendanceRes = await ApiService.get(
          `/attendance/student/${data.student_id}`
        );

        const records = attendanceRes?.data ?? attendanceRes;

        if (Array.isArray(records) && records.length > 0) {
          const emailLink = records[0]?.email_link;

          if (emailLink) {
            try {
              const extractedToken = new URL(emailLink).searchParams.get("token");

              if (extractedToken) {
                const baseUrl =
                  typeof window !== "undefined"
                    ? window.location.origin
                    : "http://localhost:3000";

                setDashboardLink(
                  `${baseUrl}/pages/studentDashboard?token=${extractedToken}`
                );
              }
            } catch (err) {
              console.error("Invalid email link format", err);
            }
          }
        }

        setLoading(false);
      } catch (err: any) {
        console.error(err);
        setError("Failed to load migration page");
        setLoading(false);
      }
    };

    fetchStudent();
  }, [token]);

  // 3. Migration call
  const handleMigrate = async () => {
    if (!studentId) return;

    try {
      setConfirming(true);

      await ApiService.post(
        `/student-classes/migrate-fiqh/${studentId}`
      );

      setDone(true);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Migration failed");
    } finally {
      setConfirming(false);
    }
  };

  if (loading) return <div style={{ padding: 20 }}>Loading...</div>;
  if (error) return <div style={{ padding: 20, color: RED }}>{error}</div>;

  if (done) {
    return (
      <div style={{ padding: 24, textAlign: "center", fontFamily: "system-ui" }}>
        <h2 style={{ color: BLUE }}>Migration Complete ✅</h2>

        <p>You have been moved to the Sisters Fiqh class (Saturday 11am).</p>

        <button
          onClick={() => {
            if (dashboardLink) {
              router.push(dashboardLink);
            } else {
              router.push("/");
            }
          }}
          style={{
            marginTop: 20,
            background: BLUE,
            color: GOLD,
            padding: "10px 16px",
            borderRadius: 9999,
            border: "none",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: 24,
        fontFamily: "system-ui",
        background: "linear-gradient(180deg, #f7f9ff 0%, #ffffff 60%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          maxWidth: 600,
          width: "100%",
          background: "white",
          borderRadius: 16,
          padding: 24,
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
          border: `2px solid rgba(25,25,112,0.15)`,
        }}
      >
        <h1 style={{ color: BLUE, marginBottom: 12 }}>
          Fiqh Class Update
        </h1>

        <p style={{ marginBottom: 10 }}>
          As-salamu alaykum <b>{studentName}</b>,
        </p>

        <p style={{ marginBottom: 10 }}>
          If you are a <b>sister in the Fiqh class</b> (previously Tue/Thu 7pm),
          your class will be moving to:
        </p>

        <p style={{ fontWeight: 800, color: BLUE, marginBottom: 16 }}>
          Saturday 11:00 AM (swapped with Tajweed)
        </p>

        <p style={{ marginBottom: 20 }}>
          If this does not apply to you, please ignore this page.
        </p>

        {/* STEP 1 */}
        <button
          onClick={() => setShowConfirm(true)}
          style={{
            width: "100%",
            padding: "14px",
            borderRadius: 12,
            border: "none",
            background: BLUE,
            color: GOLD,
            fontWeight: 900,
            cursor: "pointer",
            fontSize: 16,
          }}
        >
          Migrate Attendance to New Fiqh Class
        </button>

        {/* STEP 2 */}
        {showConfirm && (
          <div
            style={{
              marginTop: 16,
              padding: 16,
              border: "1px solid #ddd",
              borderRadius: 12,
              background: "#fafafa",
            }}
          >
            <p style={{ fontWeight: 700, marginBottom: 10 }}>
              ⚠️ Are you sure?
            </p>

            <p style={{ fontSize: 13, opacity: 0.8, marginBottom: 12 }}>
              This cannot be redone. If you have an issue, please reach out to Kufah Admin.
            </p>

            <button
              onClick={handleMigrate}
              disabled={confirming}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: 10,
                border: "none",
                background: RED,
                color: "white",
                fontWeight: 900,
                cursor: "pointer",
                marginBottom: 8,
              }}
            >
              {confirming ? "Migrating..." : "Yes, proceed"}
            </button>

            <button
              onClick={() => setShowConfirm(false)}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: 10,
                border: "1px solid #ccc",
                background: "white",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        )}

        <p style={{ marginTop: 12, fontSize: 12, opacity: 0.7 }}>
          This will move all your Fiqh attendance records to the new class.
        </p>
      </div>
    </div>
  );
};

export default MigrateFiqhPage;