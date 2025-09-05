import * as React from "react";
import { Dialog, DialogTitle, DialogContent, TextField, DialogActions, Button } from "@mui/material";
import ApiService from "../services/ApiService";

interface Props {
  open: boolean;
  onClose: () => void;
  allStudents: any[];
  classesData: any[];
  onAdded: () => void;
}

export default function AddStudentModal({ open, onClose, allStudents, classesData, onAdded }: Props) {
  const [studentId, setStudentId] = React.useState("");
  const [classId, setClassId] = React.useState("");

  const handleAdd = async () => {
    if (!studentId || !classId) return;
    try {
      await ApiService.post("/student-classes", { studentId, classId });
      setStudentId(""); setClassId("");
      onClose();
      onAdded();
    } catch (err) {
      console.error("Error adding student:", err);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Add Student to Class</DialogTitle>
      <DialogContent>
        <TextField
          select label="Select Student" fullWidth value={studentId} onChange={(e) => setStudentId(e.target.value)}
          SelectProps={{ native: true }} margin="normal" InputLabelProps={{ shrink: true }}
        >
          <option value="">-- Choose a Student --</option>
          {allStudents.map((s) => <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>)}
        </TextField>

        <TextField
          select label="Select Class" fullWidth value={classId} onChange={(e) => setClassId(e.target.value)}
          SelectProps={{ native: true }} margin="normal" InputLabelProps={{ shrink: true }}
        >
          <option value="">-- Choose a Class --</option>
          {classesData.map((c) => <option key={c.id} value={c.id}>{c.className}</option>)}
        </TextField>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleAdd} variant="contained" sx={{ backgroundColor: "#191970", "&:hover": { backgroundColor: "#000080" } }}>Add</Button>
      </DialogActions>
    </Dialog>
  );
}
