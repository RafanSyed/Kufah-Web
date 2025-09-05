"use client";

import * as React from "react";
import { Box, Button, useMediaQuery, useTheme, Typography } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import ApiService from "../services/ApiService";
import AttendanceModal from "./ViewDatesModal";

type ClassRow = {
  id: number;
  className: string;
  inPerson: number;
  online: number;
  recording: number;
  absent: number;
  totalGrade: number;
  classId: number;
};

type Props = {
  studentId: number;
};

const StudentClassGrid: React.FC<Props> = ({ studentId }) => {
  const [classes, setClasses] = React.useState<ClassRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [selectedClassId, setSelectedClassId] = React.useState<number | null>(null);

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm")); // true for small screens

  React.useEffect(() => {
    const fetchStudentClasses = async () => {
      try {
        const studentClasses = await ApiService.get(`/student-classes/student/${studentId}`);

        const transformed = await Promise.all(
          studentClasses.map(async (sc: any) => {
            const classInfo = await ApiService.get(`/classes/${sc.classId}`);
            const attendance = await ApiService.get(
              `/attendance/student/${studentId}/class/${sc.classId}`
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
              totalSessions > 0
                ? Math.round((totalAttended / totalSessions) * 100)
                : 0;

            return {
              id: sc.id,
              className: classInfo.name,
              inPerson: counts.inPerson,
              online: counts.online,
              recording: counts.recording,
              absent: counts.absent,
              totalGrade: attendancePercent,
              classId: sc.classId,
            };
          })
        );

        setClasses(transformed);
      } catch (err) {
        console.error("Error fetching student classes:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentClasses();
  }, [studentId]);

  const baseColumns: GridColDef[] = [
    { field: "className", headerName: "CLASS", flex: 1 },
    { field: "absent", headerName: "ABSENT", type: "number", flex: 0.5 },
    { field: "totalGrade", headerName: "TOTAL %", type: "number", flex: 0.5 },
    {
      field: "view",
      headerName: "VIEW DATES",
      flex: 1,
      renderCell: (params) => (
        <Button
          variant="contained"
          size={isSmallScreen ? "small" : "medium"}
          sx={{
            fontSize: isSmallScreen ? "0.75rem" : "1rem",
            fontWeight: "bold",
            textTransform: "none",
            backgroundColor: "#191970",
            "&:hover": { backgroundColor: "#000080" },
            padding: isSmallScreen ? "4px 10px" : "6px 14px",
            borderRadius: "8px",
          }}
          onClick={() => {
            setSelectedClassId(params.row.classId);
            setModalOpen(true);
          }}
        >
          View
        </Button>
      ),
    },
  ];

  const desktopColumns: GridColDef[] = [
    { field: "inPerson", headerName: "IN PERSON", type: "number", flex: 0.5 },
    { field: "online", headerName: "ONLINE", type: "number", flex: 0.5 },
    { field: "recording", headerName: "RECORDING", type: "number", flex: 0.5 },
  ];

  const columns = isSmallScreen ? baseColumns : [...baseColumns, ...desktopColumns];

  if (loading) return <p>Loading...</p>;
  if (!classes.length) return <p>No classes found for this student.</p>;

  return (
    <Box sx={{ height: 420, width: "90%", mx: "auto" }}>
      <DataGrid
        rows={classes}
        columns={columns}
        pageSizeOptions={[5, 10, 25]}
        initialState={{
          pagination: { paginationModel: { pageSize: 5, page: 0 } },
        }}
        sx={{
          border: "2px solid #191970",
          "& .MuiDataGrid-columnHeaders": {
            fontFamily: "'Comfortaa'",
            fontWeight: "bold",
            fontSize: isSmallScreen ? "0.8rem" : "1.1rem",
            color: "#191970",
            borderBottom: "2px solid #191970",
          },
          "& .MuiDataGrid-cell": {
            fontFamily: "'Comfortaa'",
            fontSize: isSmallScreen ? "0.7rem" : "1rem",
            fontWeight: "normal",
            color: "#191970",
          },
          "& .MuiDataGrid-footerContainer": {
            borderTop: "2px solid #191970",
          },
        }}
      />

      {selectedClassId && (
        <AttendanceModal
          studentId={studentId}
          classId={selectedClassId}
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSave={() => {
            window.location.reload();
          }}
        />
      )}
    </Box>
  );
};

export default StudentClassGrid;