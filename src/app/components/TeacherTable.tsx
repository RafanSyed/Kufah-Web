"use client";

import * as React from "react";
import { Tabs, Tab, Box, useMediaQuery } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";

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
};

const columns: GridColDef[] = [
  { field: "student", headerName: "STUDENT", flex: 1, minWidth: 120 },
  { field: "inPerson", headerName: "IN PERSON", type: "number", flex: 1, minWidth: 100 },
  { field: "online", headerName: "ONLINE", type: "number", flex: 1, minWidth: 100 },
  { field: "recording", headerName: "RECORDING", type: "number", flex: 1, minWidth: 100 },
  { field: "absent", headerName: "ABSENT", type: "number", flex: 1, minWidth: 100 },
  { field: "totalGrade", headerName: "TOTAL GRADE", type: "number", flex: 1, minWidth: 120 },
];

const ClassTabsGrid: React.FC<Props> = ({ classes }) => {
  const [selectedTab, setSelectedTab] = React.useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  // Detect mobile screen
  const isMobile = useMediaQuery("(max-width:640px)");

  return (
    <Box>
      <Tabs
        value={selectedTab}
        onChange={handleTabChange}
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
        {/* Example if you want class tabs */}
        {/* {classes.map((cls, index) => <Tab key={index} label={cls.className} />)} */}
      </Tabs>

      <Box sx={{ width: "100%", overflowX: "auto" }}>
        <DataGrid
          rows={classes[selectedTab].students}
          columns={columns}
          pageSizeOptions={[5, 10, 25]}
          initialState={{ pagination: { paginationModel: { pageSize: isMobile ? 3 : 5, page: 0 } } }}
          rowHeight={isMobile ? 35 : 50}
          sx={{
            minWidth: 600, // allows horizontal scroll on small screens
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
          }}
        />
      </Box>
    </Box>
  );
};

export default ClassTabsGrid;
