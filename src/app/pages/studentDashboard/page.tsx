"use client";

export const dynamic = "force-dynamic";
import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import StudentTable from "../../components/StudentTable";
import ApiService from "../../services/ApiService";

// Create a separate component for the main content that uses useSearchParams
const StudentDashboardContent: React.FC = () => {
  const searchParams = useSearchParams();
  const linkToken = searchParams.get("token");
  const [studentId, setStudentId] = useState<number | null>(null);
  const [studentName, setStudentName] = useState<string>(""); // 🆕
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
        // Step 1: Get student_id from token
        const linkResponse = await ApiService.get(`/attendance/link/${linkToken}`);
        if (!linkResponse.rows || linkResponse.rows.length === 0) {
          setError("No student found for this token");
          setLoading(false);
          return;
        }

        const id = linkResponse.rows[0].student_id;
        setStudentId(id);

        // Step 2: Fetch student details by id
        const studentResponse = await ApiService.get(`/students/${id}`);
        const student = studentResponse.data;
        setStudentName(student.firstName || "Student"); // 🆕

        setLoading(false);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Failed to fetch student info");
        setLoading(false);
      }
    };

    fetchStudent();
  }, [linkToken]);

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;
  if (!studentId) return <div className="p-4 text-red-600">Student not found</div>;

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-6">
      <h1 className="font-comfortaa text-4xl md:text-5xl font-semibold text-[#191970] text-center mb-8">
        {studentName.toUpperCase()} DASHBOARD {/* 🆕 dynamic heading */}
      </h1>
      <StudentTable studentId={studentId} />
    </main>
  );
};


// Loading fallback component
const LoadingFallback: React.FC = () => (
  <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-6">
    <h1 className="font-comfortaa text-4xl md:text-5xl font-semibold text-[#191970] text-center mb-8">
      STUDENT DASHBOARD
    </h1>
    <div className="p-4 text-center">Loading student dashboard...</div>
  </main>
);

// Main component that wraps StudentDashboardContent in Suspense
const Page: React.FC = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <StudentDashboardContent />
    </Suspense>
  );
};

export default Page;
