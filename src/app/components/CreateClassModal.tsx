import * as React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Button,
  ToggleButton,
  ToggleButtonGroup
} from "@mui/material";
import ApiService from "../services/ApiService";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function CreateClassModal({ open, onClose, onCreated }: Props) {
  const [name, setName] = React.useState("");
  const [time, setTime] = React.useState(""); // input time in hh:mm AM/PM or 24h format
  const [days, setDays] = React.useState<string[]>([]);

  const handleDaysChange = (
    event: React.MouseEvent<HTMLElement>,
    newDays: string[]
  ) => {
    setDays(newDays);
  };

  const convertToMilitaryTime = (input: string) => {
    // input comes from <input type="time">, usually hh:mm (24h) already
    // but if using 12h input, we can convert like this:
    // Here we assume input is "hh:mm AM/PM" or "hh:mm" 24h format
    const [hours, minutes] = input.split(":").map(Number);
    // No AM/PM handling needed if type="time", already 24h
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
  };

  const handleCreate = async () => {
    if (!name || !time || days.length === 0) {
      alert("Please fill all fields and select at least one day.");
      return;
    }

    const militaryTime = convertToMilitaryTime(time);

    try {
      await ApiService.post("/classes", {
        name,
        time: militaryTime,
        days
      });
      setName("");
      setTime("");
      setDays([]);
      onClose();
      onCreated();
    } catch (err) {
      console.error("Error creating class:", err);
      alert("Failed to create class. Check console for details.");
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Create New Class</DialogTitle>
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
              <ToggleButton key={day} value={day} aria-label={day}>
                {day}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleCreate}
          variant="contained"
          sx={{
            backgroundColor: "#191970",
            "&:hover": { backgroundColor: "#000080" }
          }}
        >
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
}
