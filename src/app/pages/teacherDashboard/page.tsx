"use client";

export const dynamic = "force-dynamic";
import * as React from "react";
import { Tabs, Tab, Box, Button } from "@mui/material";
import { useRouter } from "next/navigation";

import ClassTabsGrid from "../../components/TeacherTable";
import ApiService from "../../services/ApiService";

import CreateClassModal from "../../components/CreateClassModal";
import CreateStudentModal from "../../components/CreateStudentModal";
import AddStudentModal from "../../components/AddStudentModal";

export default function Home() {
  const router = useRouter();

  const [classesData, setClassesData] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedTab, setSelectedTab] = React.useState(0);

  // Modals
  const [openCreateClassModal, setOpenCreateClassModal] = React.useState(false);
  const [openCreateStudentModal, setOpenCreateStudentModal] = React.useState(false);
  const [openAddStudentModal, setOpenAddStudentModal] = React.useState(false);

  const [allStudents, setAllStudents] = React.useState<any[]>([]);

  // Fetch all students
  const fetchAllStudents = async () => {
    try {
      const resp = await ApiService.get("/students");
      setAllStudents(resp.data || []);
    } catch (err) {
      console.error("Error fetching students:", err);
    }
  };

  // Fetch classes + students with attendance counts
  const fetchClassesData = async () => {
    setLoading(true);
    try {
      const classes = await ApiService.get("/classes");

      const transformedClasses = await Promise.all(
        classes.map(async (cls: any) => {
          const students = await ApiService.get(`/student-classes/class/${cls.id}`);

          const studentsWithAttendance = await Promise.all(
            students.map(async (s: any) => {
              const infoResp = await ApiService.get(`/students/${s.studentId}`);
              const info = infoResp.data;

              const attendance = await ApiService.get(
                `/attendance/student/${s.studentId}/class/${cls.id}`
              );

              const counts = attendance.reduce(
                (acc: any, a: any) => {
                  switch (a.status) {
                    case "In Person":
                      acc.inPerson += 1;
                      break;
                    case "Online":
                      acc.online += 1;
                      break;
                    case "Recording":
                      acc.recording += 1;
                      break;
                    case "Absent":
                      acc.absent += 1;
                      break;
                  }
                  return acc;
                },
                { inPerson: 0, online: 0, recording: 0, absent: 0 }
              );

              const totalAttended = counts.inPerson + counts.online + counts.recording;
              const totalSessions = totalAttended + counts.absent;
              const attendancePercent =
                totalSessions > 0 ? Math.round((totalAttended / totalSessions) * 100) : 0;

              return {
                id: s.studentId,
                student: `${info.firstName} ${info.lastName}`,
                inPerson: counts.inPerson,
                online: counts.online,
                recording: counts.recording,
                absent: counts.absent,
                totalGrade: attendancePercent,
              };
            })
          );

          return { id: cls.id, className: cls.name, students: studentsWithAttendance };
        })
      );

      setClassesData(transformedClasses);
    } catch (err) {
      console.error("Error fetching classes:", err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchAllStudents();
    fetchClassesData();
  }, []);

  const handleTabChange = (_: any, newValue: number) => {
    if (newValue === classesData.length) {
      setOpenCreateClassModal(true);
    } else {
      setSelectedTab(newValue);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ backgroundColor: "#FFF", minHeight: "100vh", padding: "40px 20px" }}>
      {/* Header row: title + Home button */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <h1
          style={{
            fontFamily: "comfortaa",
            fontWeight: "normal",
            fontSize: "2.5rem",
            color: "#191970",
            margin: 0,
          }}
        >
          TEACHER DASHBOARD
        </h1>

        <Button
          variant="outlined"
          sx={{
            borderColor: "#191970",
            color: "#191970",
            textTransform: "none",
            fontFamily: "comfortaa",
            "&:hover": { borderColor: "#000080", backgroundColor: "#f3f6ff" },
          }}
          onClick={() => router.push("/pages/dashboard")}
        >
          Home
        </Button>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mt: 1 }}>
        <Tabs
          value={selectedTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          {classesData.map((cls, i) => (
            <Tab key={i} label={cls.className} />
          ))}
        </Tabs>
      </Box>

      {/* Table */}
      {selectedTab < classesData.length && classesData.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <ClassTabsGrid classes={[classesData[selectedTab]]} />
        </Box>
      )}

      {/* Buttons */}
      <Box
        sx={{
          mt: 3,
          textAlign: "center",
          display: "flex",
          justifyContent: "center",
          gap: 2,
        }}
      >
        <Button
          variant="contained"
          sx={{ backgroundColor: "#191970", "&:hover": { backgroundColor: "#000080" } }}
          onClick={() => setOpenCreateClassModal(true)}
        >
          Create Class
        </Button>

        <Button
          variant="contained"
          sx={{ backgroundColor: "#191970", "&:hover": { backgroundColor: "#000080" } }}
          onClick={() => setOpenAddStudentModal(true)}
        >
          Add Student to Class
        </Button>

        <Button
          variant="contained"
          sx={{ backgroundColor: "#191970", "&:hover": { backgroundColor: "#000080" } }}
          onClick={() => setOpenCreateStudentModal(true)}
        >
          Create Student
        </Button>
      </Box>

      {/* Modals */}
      <CreateClassModal
        open={openCreateClassModal}
        onClose={() => setOpenCreateClassModal(false)}
        onCreated={fetchClassesData}
      />
      <CreateStudentModal
        open={openCreateStudentModal}
        onClose={() => setOpenCreateStudentModal(false)}
        onCreated={fetchAllStudents}
      />
      <AddStudentModal
        open={openAddStudentModal}
        onClose={() => setOpenAddStudentModal(false)}
        allStudents={allStudents}
        classesData={classesData}
        onAdded={fetchClassesData}
      />
    </div>
  );
}
