import * as React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  TextField,
} from "@mui/material";
import ApiService from "../services/ApiService";

interface Props {
  open: boolean;
  onClose: () => void;
  allStudents: any[];
  classesData: any[];
  onAdded: () => void;
}

export default function AddStudentModal({
  open,
  onClose,
  allStudents,
  classesData,
  onAdded,
}: Props) {
  const [selectedStudentIds, setSelectedStudentIds] = React.useState<number[]>([]);
  const [classId, setClassId] = React.useState("");

  const handleAdd = async () => {
    if (!selectedStudentIds.length || !classId) return;

    try {
      // Call bulk API
      await ApiService.post("/student-classes/bulk", {
        studentIds: selectedStudentIds,
        classId,
      });

      // Reset selections
      setSelectedStudentIds([]);
      setClassId("");
      onClose();
      onAdded();
    } catch (err) {
      console.error("Error adding students:", err);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Add Students to Class</DialogTitle>
      <DialogContent>
        {/* Multi-select students */}
        <FormControl fullWidth margin="normal">
          <InputLabel shrink>Select Students</InputLabel>
          <Select
            multiple
            value={selectedStudentIds}
            onChange={(e) => setSelectedStudentIds(e.target.value as number[])}
            renderValue={(selected) =>
              (selected as number[])
                .map(
                  (id) =>
                    allStudents.find((s) => s.id === id)?.firstName +
                    " " +
                    allStudents.find((s) => s.id === id)?.lastName
                )
                .join(", ")
            }
          >
            {allStudents.map((s) => (
              <MenuItem key={s.id} value={s.id}>
                <Checkbox checked={selectedStudentIds.indexOf(s.id) > -1} />
                <ListItemText primary={`${s.firstName} ${s.lastName}`} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Single-select class dropdown remains unchanged */}
        <TextField
          select
          label="Select Class"
          fullWidth
          value={classId}
          onChange={(e) => setClassId(e.target.value)}
          SelectProps={{ native: true }}
          margin="normal"
          InputLabelProps={{ shrink: true }}
        >
          <option value="">-- Choose a Class --</option>
          {classesData.map((c) => (
            <option key={c.id} value={c.id}>
              {c.className}
            </option>
          ))}
        </TextField>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleAdd}
          variant="contained"
          sx={{
            backgroundColor: "#191970",
            "&:hover": { backgroundColor: "#000080" },
          }}
        >
          Add
        </Button>
      </DialogActions>
    </Dialog>
  );
}
