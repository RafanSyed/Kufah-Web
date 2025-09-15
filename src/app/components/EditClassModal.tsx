"use client";

import * as React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Button,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import ApiService from "../services/ApiService";

interface Props {
  open: boolean;
  onClose: () => void;
  classId: number | null;
  onUpdated: () => void;
}

const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function EditClassModal({ open, onClose, classId, onUpdated }: Props) {
  const [name, setName] = React.useState("");
  const [time, setTime] = React.useState("");
  const [days, setDays] = React.useState<string[]>([]);

  // Load class details
  React.useEffect(() => {
    if (classId && open) {
      ApiService.get(`/classes/${classId}`)
        .then((res) => {
          const data = res;
          setName(data.name);
          setTime(data.time);
          setDays(data.days || []);
        })
        .catch((err) => console.error("❌ Failed to fetch class:", err));
    }
  }, [classId, open]);

  const handleDaysChange = (_: any, newDays: string[]) => setDays(newDays);

  const handleUpdate = async () => {
    if (!classId) return;
    if (!name || !time || days.length === 0) {
      alert("Please fill all fields and select at least one day.");
      return;
    }

    try {
      await ApiService.put(`/classes/${classId}`, {
        name,
        time,
        days,
      });
      onUpdated();
      onClose();
    } catch (err) {
      console.error("❌ Error updating class:", err);
      alert("Failed to update class. Check console for details.");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Edit Class</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="normal"
          label="Class Name"
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <TextField
          margin="normal"
          label="Start Time"
          type="time"
          fullWidth
          InputLabelProps={{ shrink: true }}
          value={time}
          onChange={(e) => setTime(e.target.value)}
        />

        <div style={{ marginTop: "16px" }}>
          <ToggleButtonGroup
            value={days}
            onChange={handleDaysChange}
            aria-label="days of the week"
          >
            {daysOfWeek.map((day) => (
              <ToggleButton key={day} value={day}>
                {day}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleUpdate}
          variant="contained"
          sx={{ backgroundColor: "#191970", "&:hover": { backgroundColor: "#000080" } }}
        >
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
}
