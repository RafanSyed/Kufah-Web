"use client";

import * as React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Button,
} from "@mui/material";
import ApiService from "../services/ApiService";

// ✅ Give props a unique name
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

  React.useEffect(() => {
    const fetchStudent = async () => {
      if (!studentId) return;
      try {
        const res = await ApiService.get(`/students/${studentId}`);
        const student = res.data;
        setFirstName(student.firstName || "");
        setLastName(student.lastName || "");
        setEmail(student.email || "");
        setPhone(student.phone || "");
      } catch (err) {
        console.error("❌ Error fetching student:", err);
      }
    };
    if (open) fetchStudent();
  }, [studentId, open]);

  const handleSave = async () => {
    if (!studentId) return;
    try {
      await ApiService.put(`/students/${studentId}`, {
        firstName,
        lastName,
        email,
        phone,
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
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSave}
          variant="contained"
          sx={{ backgroundColor: "#191970", "&:hover": { backgroundColor: "#000080" } }}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditStudentModal;
