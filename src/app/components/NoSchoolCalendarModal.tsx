"use client";

import * as React from "react";
import { Dialog, Box, Button, Typography } from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { PickersDay } from "@mui/x-date-pickers/PickersDay";
import type { PickersDayProps } from "@mui/x-date-pickers/PickersDay";
import dayjs, { Dayjs } from "dayjs";
import ApiService from "../services/ApiService"; // adjust if needed


type Props = {
  open: boolean;
  onClose: () => void;
};

type NoSchoolRow = { date: string; reason?: string | null };

function iso(d: Dayjs) {
  return d.format("YYYY-MM-DD");
}

export default function NoSchoolCalendarModal({ open, onClose }: Props) {
  const [blocked, setBlocked] = React.useState<Set<string>>(new Set());
  const [month, setMonth] = React.useState<Dayjs>(dayjs());
  const [saving, setSaving] = React.useState(false);

  const loadMonth = React.useCallback(async (m: Dayjs) => {
    // Load a range slightly larger than the month to cover calendar grid
    const from = m.startOf("month").subtract(7, "day").format("YYYY-MM-DD");
    const to = m.endOf("month").add(7, "day").format("YYYY-MM-DD");

    const resp = await ApiService.get(`/noSchool/range?from=${from}&to=${to}`);
    const rows: NoSchoolRow[] = resp?.data ?? resp ?? [];

    setBlocked(new Set(rows.map(r => r.date)));
  }, []);

  React.useEffect(() => {
    if (!open) return;
    loadMonth(month).catch(console.error);
  }, [open, month, loadMonth]);

  const toggleDate = async (d: Dayjs | null) => {
    if (!d) return;
    const date = iso(d);

    setSaving(true);
    try {
      if (blocked.has(date)) {
        // un-block
        await ApiService.delete(`/noSchool/date/${date}`);
        setBlocked(prev => {
          const next = new Set(prev);
          next.delete(date);
          return next;
        });
      } else {
        // block
        await ApiService.post(`/noSchool`, { date, reason: "No school" });
        setBlocked(prev => {
          const next = new Set(prev);
          next.add(date);
          return next;
        });
      }
    } catch (err) {
      console.error("Failed to toggle no-school date", err);
    } finally {
      setSaving(false);
    }
  };

    // Custom day rendering to highlight blocked days
    const Day = (props: PickersDayProps) => {
    // In your version, props.day is still a Dayjs when using AdapterDayjs
    const dateStr = dayjs(props.day as any).format("YYYY-MM-DD");
    const isBlocked = blocked.has(dateStr);

    return (
        <PickersDay
        {...props}
        sx={{
            ...(isBlocked && {
            border: "2px solid #191970",
            borderRadius: "50%",
            }),
        }}
        />
    );
    };

  return (
    <Dialog open={open} onClose={onClose}>
      <Box sx={{ p: 2, width: 360 }}>
        <Typography
          sx={{ fontFamily: "comfortaa", color: "#191970", mb: 1, fontSize: "1.2rem" }}
        >
          No-School Calendar
        </Typography>

        <Typography sx={{ fontSize: 13, color: "#555", mb: 2 }}>
          Click a date to toggle “No school”. Highlighted days are blocked.
        </Typography>

        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DateCalendar
            value={null}
            onChange={toggleDate}
            onMonthChange={(m) => setMonth(m)}
            slots={{ day: Day }}
            disabled={saving}
          />
        </LocalizationProvider>

        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
          <Button onClick={onClose} variant="outlined" sx={{ textTransform: "none" }}>
            Close
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
}
