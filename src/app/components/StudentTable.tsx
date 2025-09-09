"use client";

import * as React from "react";
import { Box, Button, useMediaQuery, useTheme, Typography, Collapse, IconButton } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { ExpandMore, ExpandLess } from "@mui/icons-material";
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
  const [expandedRows, setExpandedRows] = React.useState<{ [key: number]: boolean }>({});

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

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
                  case "In Person": acc.inPerson += 1; break;
                  case "Online": acc.online += 1; break;
                  case "Recording": acc.recording += 1; break;
                  case "Absent": acc.absent += 1; break;
                }
                return acc;
              },
              { inPerson: 0, online: 0, recording: 0, absent: 0 }
            );

            const totalAttended = counts.inPerson + counts.online + counts.recording;
            const totalSessions = totalAttended + counts.absent;
            const attendancePercent = totalSessions > 0 ? Math.round((totalAttended / totalSessions) * 100) : 0;

            return {
              id: sc.id,
              className: classInfo.name,
              ...counts,
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
            fontSize: isSmallScreen ? "0.65rem" : "0.85rem",
            fontWeight: "bold",
            textTransform: "none",
            backgroundColor: "#191970",
            "&:hover": { backgroundColor: "#000080" },
            padding: isSmallScreen ? "3px 8px" : "5px 12px",
            borderRadius: "6px",
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

  const extraColumns: GridColDef[] = [
    { field: "inPerson", headerName: "IN PERSON", type: "number", flex: 0.5 },
    { field: "online", headerName: "ONLINE", type: "number", flex: 0.5 },
    { field: "recording", headerName: "RECORDING", type: "number", flex: 0.5 },
  ];

  const columns = isSmallScreen ? baseColumns : [...baseColumns, ...extraColumns];

  if (loading) return <p>Loading...</p>;
  if (!classes.length) return <p>No classes found for this student.</p>;

  return (
    <Box sx={{ width: "95%", mx: "auto", mb: 4 }}>
      {isSmallScreen ? (
        classes.map((cls) => (
          <Box
            key={cls.id}
            sx={{
              border: "1.5px solid #191970",
              borderRadius: 2,
              p: 1.5,
              mb: 2,
              fontFamily: "'Comfortaa', sans-serif",
              backgroundColor: "#f9f9f9",
            }}
          >
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography variant="subtitle2" fontWeight="bold" color="#191970" fontSize="0.85rem">
                {cls.className} (<Box component="span" fontWeight="bold">{cls.totalGrade}%</Box>)
              </Typography>
              <IconButton
                size="small"
                onClick={() => setExpandedRows((prev) => ({ ...prev, [cls.id]: !prev[cls.id] }))}
              >
                {expandedRows[cls.id] ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
              </IconButton>
            </Box>

            <Collapse in={expandedRows[cls.id]}>
              <Box sx={{ mt: 0.5, ml: 1 }}>
                <Typography fontSize="0.75rem" fontFamily="'Comfortaa'" color="#191970">
                  In Person: <Box component="span" fontWeight="bold">{cls.inPerson}</Box>
                </Typography>
                <Typography fontSize="0.75rem" fontFamily="'Comfortaa'" color="#191970">
                  Online: <Box component="span" fontWeight="bold">{cls.online}</Box>
                </Typography>
                <Typography fontSize="0.75rem" fontFamily="'Comfortaa'" color="#191970">
                  Recording: <Box component="span" fontWeight="bold">{cls.recording}</Box>
                </Typography>
                <Typography fontSize="0.75rem" fontFamily="'Comfortaa'" color="#191970">
                  Absent: <Box component="span" fontWeight="bold">{cls.absent}</Box>
                </Typography>
                <Button
                  variant="contained"
                  size="small"
                  sx={{
                    mt: 1,
                    backgroundColor: "#191970",
                    "&:hover": { backgroundColor: "#000080" },
                    textTransform: "none",
                    fontSize: "0.75rem",
                    padding: "3px 8px",
                  }}
                  onClick={() => {
                    setSelectedClassId(cls.classId);
                    setModalOpen(true);
                  }}
                >
                  View Dates
                </Button>
              </Box>
            </Collapse>
          </Box>
        ))
      ) : (
        <DataGrid
          rows={classes}
          columns={columns}
          pageSizeOptions={[5, 10, 25]}
          initialState={{ pagination: { paginationModel: { pageSize: 5, page: 0 } } }}
          autoHeight
          sx={{
            border: "2px solid #191970",
            "& .MuiDataGrid-columnHeaders": {
              fontFamily: "'Comfortaa'",
              fontWeight: "bold",
              fontSize: "1.1rem",
              color: "#191970",
              borderBottom: "2px solid #191970",
            },
            "& .MuiDataGrid-cell": {
              fontFamily: "'Comfortaa'",
              fontSize: "0.95rem",
              fontWeight: "normal",
              color: "#191970",
            },
            "& .MuiDataGrid-footerContainer": { borderTop: "2px solid #191970" },
          }}
        />
      )}

      {selectedClassId && (
        <AttendanceModal
          studentId={studentId}
          classId={selectedClassId}
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSave={() => window.location.reload()}
        />
      )}
    </Box>
  );
};

export default StudentClassGrid;
