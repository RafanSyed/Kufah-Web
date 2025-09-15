import * as React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Button,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText
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
  const [classes, setClasses] = React.useState<any[]>([]);
  const [selectedClasses, setSelectedClasses] = React.useState<number[]>([]);

  // Fetch all classes on open
  React.useEffect(() => {
    if (open) {
      ApiService.get("/classes")
        .then((data) => setClasses(data))
        .catch((err) => console.error("❌ Error fetching classes:", err));
    }
  }, [open]);

  const handleCreate = async () => {
    try {
      // 1. Create the student
      const student = await ApiService.post("/students", {
        firstName,
        lastName,
        email,
        phone,
      });

      // Some APIs return { id: ..., ... }, others return { data: { id: ... } }
      const studentId = student?.id || student?.data?.id;
      if (!studentId) {
        console.error("❌ No studentId returned from /students API:", student);
        return;
      }

      // 2. Assign classes if any were selected
      if (selectedClasses.length > 0) {
        await ApiService.post("/student-classes/student/bulk", {
          studentId,
          classIds: selectedClasses,
        });
      }

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
    setSelectedClasses([]);
  };

  // 📂 Handle Excel upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      if (rows.length < 2) {
        console.error("❌ Excel has no data");
        return;
      }

      const headers = rows[0].map((h: string) =>
        h?.toString().toLowerCase().trim()
      );

      const students = rows.slice(1).map((row) => {
        const obj: any = {};
        row.forEach((value: any, i: number) => {
          obj[headers[i]] = value;
        });
        return {
          firstName: obj["firstname"] || obj["first name"] || obj["fname"] || "",
          lastName: obj["lastname"] || obj["last name"] || obj["lname"] || "",
          email: obj["email"] || "",
          phone: obj["phone"] ? String(obj["phone"]) : "",
        };
      });

      console.log("📊 Parsed students from Excel:", students);

      if (students.length === 0) {
        console.error("❌ No students found in Excel");
        return;
      }

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

        {/* Multi-select for classes */}
        <FormControl fullWidth margin="normal">
          <InputLabel id="classes-label">Assign Classes</InputLabel>
          <Select
            labelId="classes-label"
            multiple
            value={selectedClasses}
            onChange={(e) => setSelectedClasses(e.target.value as number[])}
            renderValue={(selected) =>
              classes
                .filter((cls) => selected.includes(cls.id))
                .map((cls) => cls.name)
                .join(", ")
            }
          >
            {classes.map((cls) => (
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
