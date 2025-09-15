"use client";

import * as React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
} from "@mui/material";
import ApiService from "../services/ApiService";

export interface EditStudentModalProps {
  open: boolean;
  onClose: () => void;
  studentId: number | null;
  onUpdated: () => void;
}

const EditStudentModal: React.FC<EditStudentModalProps> = ({
  open,
  onClose,
  studentId,
  onUpdated,
}) => {
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");

  const [allClasses, setAllClasses] = React.useState<any[]>([]);
  const [selectedClasses, setSelectedClasses] = React.useState<number[]>([]);

  // Fetch student + classes
  React.useEffect(() => {
    const fetchStudentAndClasses = async () => {
      if (!studentId) return;

      try {
        // 1. Get student details
        const res = await ApiService.get(`/students/${studentId}`);
        const student = res.data;
        setFirstName(student.firstName || "");
        setLastName(student.lastName || "");
        setEmail(student.email || "");
        setPhone(student.phone || "");

        // 2. Get all classes
        const classesRes = await ApiService.get("/classes");
        setAllClasses(classesRes);

        // 3. Get student's current classes
        const studentClassesRes = await ApiService.get(
          `/student-classes/student/${studentId}`
        );
        setSelectedClasses(studentClassesRes.map((sc: any) => sc.classId));
      } catch (err) {
        console.error("❌ Error fetching student/classes:", err);
      }
    };

    if (open) fetchStudentAndClasses();
  }, [studentId, open]);

  const handleSave = async () => {
    if (!studentId) return;
    try {
      // 1. Update student info
      await ApiService.put(`/students/${studentId}`, {
        firstName,
        lastName,
        email,
        phone,
      });

      // 2. Update classes for student (PUT instead of POST)
      await ApiService.put(`/student-classes/student/${studentId}`, {
        classIds: selectedClasses,
      });

      onUpdated();
      onClose();
    } catch (err) {
      console.error("❌ Error updating student:", err);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Edit Student</DialogTitle>
      <DialogContent>
        <TextField
          margin="normal"
          label="First Name"
          fullWidth
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />
        <TextField
          margin="normal"
          label="Last Name"
          fullWidth
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />
        <TextField
          margin="normal"
          label="Email"
          type="email"
          fullWidth
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          margin="normal"
          label="Phone"
          type="tel"
          fullWidth
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        {/* Multi-select for classes */}
        <FormControl fullWidth margin="normal">
          <InputLabel id="classes-label">Classes</InputLabel>
          <Select
            labelId="classes-label"
            multiple
            value={selectedClasses}
            onChange={(e) => setSelectedClasses(e.target.value as number[])}
            renderValue={(selected) =>
              allClasses
                .filter((cls) => selected.includes(cls.id))
                .map((cls) => cls.name)
                .join(", ")
            }
          >
            {allClasses.map((cls) => (
              <MenuItem key={cls.id} value={cls.id}>
                <Checkbox checked={selectedClasses.includes(cls.id)} />
                <ListItemText primary={cls.name} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSave}
          variant="contained"
          sx={{
            backgroundColor: "#191970",
            "&:hover": { backgroundColor: "#000080" },
          }}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditStudentModal;
