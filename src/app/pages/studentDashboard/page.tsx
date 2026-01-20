"use client";

export const dynamic = "force-dynamic";
import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import StudentTable from "../../components/StudentTable";
import ApiService from "../../services/ApiService";

const BLUE = "#191970";

const StudentDashboardContent: React.FC = () => {
  const searchParams = useSearchParams();
  const linkToken = searchParams.get("token");

  const [studentId, setStudentId] = useState<number | null>(null);
  const [studentName, setStudentName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!linkToken) {
      setError("Missing token in URL");
      setLoading(false);
      return;
    }

    const fetchStudent = async () => {
      try {
        // 1) token -> student_id
        const linkResponse = await ApiService.get(`/attendance/link/${linkToken}`);
        const rows = linkResponse?.rows ?? linkResponse?.data?.rows ?? [];

        if (!rows || rows.length === 0) {
          setError("No student found for this token");
          setLoading(false);
          return;
        }

        const id = rows[0].student_id;
        setStudentId(id);

        // 2) student by id
        const studentResponse = await ApiService.get(`/students/${id}`);
        const student = studentResponse?.data ?? studentResponse;

        const fullName =
          `${student?.firstName ?? ""} ${student?.lastName ?? ""}`.trim() ||
          student?.firstName ||
          "Student";

        setStudentName(fullName);
        setLoading(false);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Failed to fetch student info");
        setLoading(false);
      }
    };

    fetchStudent();
  }, [linkToken]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  if (!studentId) return <ErrorState message="Student not found" />;

  return (
    <main
      className="min-h-screen"
      style={{
        background: "linear-gradient(180deg, #f7f9ff 0%, #ffffff 60%)",
      }}
    >
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Header card */}
        <div
          className="rounded-2xl border bg-white/90 backdrop-blur shadow-sm"
          style={{ borderColor: "rgba(25,25,112,0.18)" }}
        >
          <div className="flex flex-col gap-3 sm:gap-4 p-5 sm:p-7">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
              <div>
                <h1
                  className="font-comfortaa font-extrabold tracking-tight"
                  style={{
                    color: BLUE,
                    fontSize: "clamp(28px, 4vw, 44px)",
                    lineHeight: 1.05,
                  }}
                >
                  {studentName}
                </h1>
                <p className="text-slate-600 text-sm sm:text-base mt-2">
                  Welcome back — view your classes and attendance below.
                </p>
              </div>

              {/* Small badge */}
              <div className="self-start sm:self-auto">
                <span
                  className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs sm:text-sm font-semibold"
                  style={{
                    borderColor: "rgba(25,25,112,0.22)",
                    color: BLUE,
                    backgroundColor: "rgba(25,25,112,0.04)",
                  }}
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: "#10b981" }}
                  />
                  Student Dashboard
                </span>
              </div>
            </div>

            {/* Divider */}
            <div
              className="h-px w-full"
              style={{ backgroundColor: "rgba(25,25,112,0.12)" }}
            />
            <p className="text-xs sm:text-sm text-slate-500">
              Tip: Open your attendance email to mark today’s status quickly.
            </p>
          </div>
        </div>

        {/* Table section */}
        <div className="mt-5 sm:mt-7">
          <div
            className="rounded-2xl border bg-white shadow-sm overflow-hidden"
            style={{ borderColor: "rgba(25,25,112,0.14)" }}
          >
            <div className="p-4 sm:p-6">
              <h2 className="font-comfortaa font-bold text-lg sm:text-xl" style={{ color: BLUE }}>
                Your Classes
              </h2>
              <p className="text-slate-600 text-sm mt-1">
                Attendance totals and class details.
              </p>
            </div>

            <div className="px-2 sm:px-4 pb-4">
              <StudentTable studentId={studentId} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs sm:text-sm text-slate-500">
          Kufah Attendance • Student Portal
        </div>
      </div>
    </main>
  );
};

const LoadingState: React.FC = () => {
  return (
    <main
      className="min-h-screen"
      style={{
        background: "linear-gradient(180deg, #f7f9ff 0%, #ffffff 60%)",
      }}
    >
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div
          className="rounded-2xl border bg-white shadow-sm p-6 sm:p-10"
          style={{ borderColor: "rgba(25,25,112,0.14)" }}
        >
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-2/3 rounded bg-slate-200" />
            <div className="h-4 w-1/2 rounded bg-slate-200" />
            <div className="h-24 w-full rounded bg-slate-100" />
            <div className="h-10 w-full rounded bg-slate-100" />
          </div>
          <div className="text-center text-slate-600 mt-6">
            Loading your dashboard...
          </div>
        </div>
      </div>
    </main>
  );
};

const ErrorState: React.FC<{ message: string }> = ({ message }) => {
  return (
    <main
      className="min-h-screen"
      style={{
        background: "linear-gradient(180deg, #f7f9ff 0%, #ffffff 60%)",
      }}
    >
      <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 py-10">
        <div className="rounded-2xl border bg-white shadow-sm p-6 sm:p-8">
          <h1 className="font-comfortaa text-2xl sm:text-3xl font-extrabold" style={{ color: BLUE }}>
            Something went wrong
          </h1>
          <p className="text-slate-600 mt-2">{message}</p>
          <div className="mt-5 text-sm text-slate-500">
            If you opened an old link, try the newest attendance email.
          </div>
        </div>
      </div>
    </main>
  );
};

// Suspense wrapper
const LoadingFallback: React.FC = () => <LoadingState />;

const Page: React.FC = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <StudentDashboardContent />
    </Suspense>
  );
};

export default Page;
