"use client";

import * as React from "react";
import {
  Tabs,
  Tab,
  Box,
  useMediaQuery,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditStudentModal from "./EditStudentModal";
import EditClassModal from "./EditClassModal";

type StudentRow = {
  id: number;
  student: string;
  inPerson: number;
  online: number;
  recording: number;
  absent: number;
  totalGrade: number;
};

type Props = {
  classes: any[];
  onRefresh?: () => void; // optional: trigger reload from parent
};

const columns: GridColDef[] = [
  { field: "student", headerName: "STUDENT", flex: 1, minWidth: 120 },
  { field: "inPerson", headerName: "IN PERSON", type: "number", flex: 1, minWidth: 100 },
  { field: "online", headerName: "ONLINE", type: "number", flex: 1, minWidth: 100 },
  { field: "recording", headerName: "RECORDING", type: "number", flex: 1, minWidth: 100 },
  { field: "absent", headerName: "ABSENT", type: "number", flex: 1, minWidth: 100 },
  { field: "totalGrade", headerName: "TOTAL GRADE", type: "number", flex: 1, minWidth: 120 },
];

const ClassTabsGrid: React.FC<Props> = ({ classes, onRefresh }) => {
  const [selectedTab, setSelectedTab] = React.useState(0);

  // Student modal state
  const [selectedStudentId, setSelectedStudentId] = React.useState<number | null>(null);
  const [studentModalOpen, setStudentModalOpen] = React.useState(false);

  // Class modal state
  const [menuAnchor, setMenuAnchor] = React.useState<null | HTMLElement>(null);
  const [selectedClassId, setSelectedClassId] = React.useState<number | null>(null);
  const [classModalOpen, setClassModalOpen] = React.useState(false);

  const isMobile = useMediaQuery("(max-width:640px)");

  // Handle student row click
  const handleRowClick = (params: any) => {
    setSelectedStudentId(params.row.id);
    setStudentModalOpen(true);
  };

  const handleCloseStudentModal = () => {
    setStudentModalOpen(false);
    setSelectedStudentId(null);
  };

  const handleStudentUpdated = () => {
    console.log("✅ Student updated");
    onRefresh?.();
  };

  // Handle class 3-dot menu
  const handleMenuOpen = (
    event: React.MouseEvent<HTMLButtonElement>,
    classId: number
  ) => {
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
    setSelectedClassId(classId);
  };

  const handleMenuClose = () => setMenuAnchor(null);

  const handleEditClassClick = () => {
    setClassModalOpen(true);
    handleMenuClose();
  };

  const handleCloseClassModal = () => {
    setClassModalOpen(false);
    setSelectedClassId(null);
  };

  const handleClassUpdated = () => {
    console.log("✅ Class updated");
    onRefresh?.();
  };

  return (
    <Box>
      {/* Tabs with 3-dot menu per class */}
      <Tabs
        value={selectedTab}
        onChange={(_, newValue) => setSelectedTab(newValue)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          "& .MuiTab-root": {
            fontFamily: "'Comfortaa'",
            fontWeight: "normal",
            fontSize: isMobile ? "0.9rem" : "1.2rem",
            color: "#191970",
          },
          "& .Mui-selected": { color: "#191970" },
          mb: 0,
        }}
      >
        {classes.map((cls, index) => (
          <Tab
            key={cls.id}
            label={
              <Box display="flex" alignItems="center">
                {cls.name}
                <IconButton
                  size="small"
                  sx={{ ml: 1 }}
                  onClick={(e) => handleMenuOpen(e, cls.id)}
                >
                  <MoreVertIcon fontSize="small" />
                </IconButton>
              </Box>
            }
          />
        ))}
      </Tabs>

      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={handleMenuClose}>
        <MenuItem onClick={handleEditClassClick}>Edit Class</MenuItem>
      </Menu>

      {/* Students DataGrid */}
      <Box sx={{ width: "100%", overflowX: "auto" }}>
        <DataGrid
          rows={classes[selectedTab].students}
          columns={columns}
          pageSizeOptions={[5, 10, 25]}
          initialState={{
            pagination: { paginationModel: { pageSize: isMobile ? 3 : 5, page: 0 } },
          }}
          rowHeight={isMobile ? 35 : 50}
          onRowClick={handleRowClick}
          sx={{
            minWidth: 600,
            border: "2px solid #191970",
            "& .MuiDataGrid-columnHeaders": {
              fontFamily: "'Comfortaa'",
              fontWeight: "bold",
              color: "#191970",
              fontSize: isMobile ? "0.75rem" : "1rem",
              borderBottom: "2px solid #191970",
            },
            "& .MuiDataGrid-cell": {
              fontFamily: "'Comfortaa'",
              fontWeight: "normal",
              color: "#191970",
              fontSize: isMobile ? "0.7rem" : "0.9rem",
              padding: isMobile ? "0 4px" : "0 8px",
            },
            "& .MuiDataGrid-footerContainer": {
              borderTop: "2px solid #191970",
              fontSize: isMobile ? "0.7rem" : "0.9rem",
            },
            cursor: "pointer",
          }}
        />
      </Box>

      {/* Student Edit Modal */}
      <EditStudentModal
        open={studentModalOpen}
        onClose={handleCloseStudentModal}
        studentId={selectedStudentId}
        onUpdated={handleStudentUpdated}
      />

      {/* Class Edit Modal */}
      <EditClassModal
        open={classModalOpen}
        onClose={handleCloseClassModal}
        classId={selectedClassId}
        onUpdated={handleClassUpdated}
      />
    </Box>
  );
};

export default ClassTabsGrid;
