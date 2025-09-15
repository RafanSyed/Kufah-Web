import * as React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Button,
  IconButton,
  Tooltip
} from "@mui/material";
import { UploadFile as UploadFileIcon } from "@mui/icons-material";
import * as XLSX from "xlsx";
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
  const [phone, setPhone] = React.useState("");

  const handleCreate = async () => {
    try {
      await ApiService.post("/students", {
        firstName,
        lastName,
        email,
        phone,
      });
      resetForm();
      onClose();
      onCreated();
    } catch (err) {
      console.error("❌ Error creating student:", err);
    }
  };

  const resetForm = () => {
    setFirstName("");
    setLastName("");
    setEmail("");
    setPhone("");
  };

  // 📂 Handle Excel upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];

      // Get raw rows (header row + data rows)
      const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      if (rows.length < 2) {
        console.error("❌ Excel has no data");
        return;
      }

      // Normalize headers (lowercase, trim spaces)
      const headers = rows[0].map((h: string) =>
        h?.toString().toLowerCase().trim()
      );

      const students = rows.slice(1).map((row) => {
        const obj: any = {};
        row.forEach((value: any, i: number) => {
          obj[headers[i]] = value;
        });
        return {
          firstName:
            obj["firstname"] || obj["first name"] || obj["fname"] || "",
          lastName:
            obj["lastname"] || obj["last name"] || obj["lname"] || "",
          email: obj["email"] || "",
          phone: obj["phone"] ? String(obj["phone"]) : "",
        };
      });

      console.log("📊 Parsed students from Excel:", students);

      if (students.length === 0) {
        console.error("❌ No students found in Excel");
        return;
      }

      // Call bulk API
      await ApiService.post("/students/bulk", { students });

      onClose();
      onCreated();
    } catch (err) {
      console.error("❌ Error uploading Excel:", err);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      {/* Title with Excel upload button */}
      <DialogTitle
        sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
      >
        Create New Student
        <Tooltip title="Import from Excel">
          <IconButton component="label">
            <UploadFileIcon />
            <input type="file" hidden accept=".xlsx, .xls" onChange={handleFileUpload} />
          </IconButton>
        </Tooltip>
      </DialogTitle>

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
