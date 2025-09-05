"use client";

import { useEffect, useState } from "react";
import ApiService from "../services/ApiService";

interface Attendance {
  id: number;
  date: string;
  status: "Absent" | "In Person" | "Online" | "Recording";
  student_id: number;
  class_id: number;
}

interface AttendanceModalProps {
  studentId: number;
  classId: number;
  isOpen: boolean;
  onClose: () => void;
  onSave?: () => void;
}

const STATUS_OPTIONS = ["In Person", "Online", "Recording", "Absent"] as const;

const AttendanceModal = ({ studentId, classId, isOpen, onClose, onSave }: AttendanceModalProps) => {
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [originalAttendance, setOriginalAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchAttendance();
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const data = await ApiService.get(`/attendance/student/${studentId}/class/${classId}`);
      setAttendance(data);
      setOriginalAttendance(JSON.parse(JSON.stringify(data)));
      setHasChanges(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (rowId: number, newStatus: Attendance["status"]) => {
    const updated = attendance.map(row => row.id === rowId ? { ...row, status: newStatus } : row);
    setAttendance(updated);
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const savePromises = attendance.map(async row => {
        const original = originalAttendance.find(orig => orig.id === row.id);
        if (original && original.status !== row.status) {
          return ApiService.put(`/attendance/${row.id}`, { status: row.status });
        }
      });
      await Promise.all(savePromises);

      setOriginalAttendance(JSON.parse(JSON.stringify(attendance)));
      setHasChanges(false);

      if (onSave) onSave();
    } catch (err) {
      console.error('Error saving attendance:', err);
      alert('Error saving changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (hasChanges && !window.confirm("You have unsaved changes. Close anyway?")) return;
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px',
        }}
        onClick={handleClose}
      >
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            width: '90%',
            maxWidth: '800px',
            maxHeight: '80vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div style={{
            padding: '24px',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#191970', margin: 0 }}>
              Attendance Details
            </h2>
            <button onClick={handleClose} style={{ fontSize: '24px', background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>×</button>
          </div>

          {/* Content */}
          <div style={{ padding: '24px', flex: 1, overflowY: 'auto' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>Loading...</div>
            ) : attendance.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>No attendance records found.</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #d1d5db' }}>
                <thead>
                  <tr style={{ backgroundColor: '#191970' }}>
                    <th style={{ padding: '12px', color: 'white', textAlign: 'left' }}>Date</th>
                    <th style={{ padding: '12px', color: 'white', textAlign: 'right' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.map((row, idx) => (
                    <tr key={row.id} style={{ backgroundColor: idx % 2 === 0 ? '#f9fafb' : 'white', borderTop: '1px solid #d1d5db' }}>
                      <td style={{ padding: '12px', textAlign: 'left', color: '#374151' }}>
                        {new Date(row.date).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit" })}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>
                        {STATUS_OPTIONS.map(statusOption => (
                          <button
                            key={statusOption}
                            onClick={() => handleStatusChange(row.id, statusOption)}
                            style={{
                              marginLeft: '8px',
                              padding: '6px 12px',
                              borderRadius: '6px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              border: 'none',
                              color: row.status === statusOption ? 'white' : '#191970',
                              backgroundColor: row.status === statusOption
                                ? statusOption === 'In Person' ? '#10b981'
                                : statusOption === 'Online' ? '#3b82f6'
                                : statusOption === 'Recording' ? '#8b5cf6'
                                : '#ef4444'
                                : '#e5e7eb'
                            }}
                          >
                            {statusOption}
                          </button>
                        ))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Footer */}
          <div style={{ padding: '24px', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {hasChanges && <span style={{ color: '#f59e0b', fontSize: '14px' }}>• You have unsaved changes</span>}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={handleClose} disabled={saving} style={{ backgroundColor: '#6b7280', color: 'white', padding: '10px 24px', border: 'none', borderRadius: '6px', fontSize: '16px', fontWeight: '600', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1 }}>Cancel</button>
              <button onClick={handleSave} disabled={!hasChanges || saving} style={{ backgroundColor: hasChanges ? '#10b981' : '#d1d5db', color: hasChanges ? 'white' : '#6b7280', padding: '10px 24px', border: 'none', borderRadius: '6px', fontSize: '16px', fontWeight: '600', cursor: hasChanges && !saving ? 'pointer' : 'not-allowed', opacity: saving ? 0.6 : 1 }}>Save Changes</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AttendanceModal;
