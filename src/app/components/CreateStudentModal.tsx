import * as React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Button,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import ApiService from "../services/ApiService";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export default function CreateStudentModal({ open, onClose, onCreated }: Props) {
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("")

  const handleCreate = async () => {
    try {
      await ApiService.post("/students", {
        firstName,
        lastName,
        email,
        phone,
      });
      setFirstName("");
      setLastName("");
      setEmail("");
      setPhone("");
      onClose();
      onCreated();
    } catch (err) {
      console.error("Error creating student:", err);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Create New Student</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
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
          label="Phone Number"
          type="tel"
          fullWidth
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleCreate}
          variant="contained"
          sx={{ backgroundColor: "#191970", "&:hover": { backgroundColor: "#000080" } }}
        >
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
}
