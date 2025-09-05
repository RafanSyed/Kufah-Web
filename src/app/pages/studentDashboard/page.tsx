"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import StudentTable from "../../components/StudentTable";
import ApiService from "../../services/ApiService";

const Page: React.FC = () => {
  const searchParams = useSearchParams();
  const linkToken = searchParams.get("token");
  const [studentId, setStudentId] = useState<number | null>(null);
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
        const response = await ApiService.get(`/attendance/link/${linkToken}`);
        console.log("API response:", response); // <-- add this to debug

        if (response.rows && response.rows.length > 0) {
          setStudentId(response.rows[0].student_id);
        } else {
          setError("No student found for this token");
        }

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
        STUDENT DASHBOARD
      </h1>
      <StudentTable studentId={studentId} />
    </main>
  );
};

export default Page;
