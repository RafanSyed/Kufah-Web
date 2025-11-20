"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ApiService from "../../services/ApiService";

type EventItem = {
  id: number;
  title: string;
  description?: string | null;
  eventDate: string;
  imageUrl?: string | null;
};

const EventsAdminPage: React.FC = () => {
  const router = useRouter();

  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUpcomingOnly, setShowUpcomingOnly] = useState(true);

  // create form state
  const [title, setTitle] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  // edit modal state
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editError, setEditError] = useState<string | null>(null);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = showUpcomingOnly ? { upcoming: "true" } : {};
      const data = await ApiService.get("/events", params);
      setEvents(data || []);
    } catch (err: any) {
      console.error("Error fetching events:", err);
      setError("Failed to load events.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [showUpcomingOnly]);

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title || !eventDate) {
      setError("Title and date/time are required.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("eventDate", eventDate);
      if (description) formData.append("description", description);
      if (imageFile) formData.append("image", imageFile);

      await ApiService.post("/events", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setTitle("");
      setEventDate("");
      setDescription("");
      setImageFile(null);
      fetchEvents();
    } catch (err: any) {
      console.error("Error creating event:", err);
      setError("Failed to create event.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this event?")) return;
    try {
      await ApiService.delete(`/events/${id}`);
      setEvents((prev) => prev.filter((e) => e.id !== id));
    } catch (err: any) {
      console.error("Error deleting event:", err);
      setError("Failed to delete event.");
    }
  };

  const toLocalInputValue = (dateStr: string) => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    const pad = (n: number) => String(n).padStart(2, "0");
    const yyyy = d.getFullYear();
    const mm = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    const hh = pad(d.getHours());
    const min = pad(d.getMinutes());
    return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
  };

  const formatEventDate = (dateStr: string) => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;

    const datePart = d.toLocaleDateString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const timePart = d.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    });

    return `${datePart} • ${timePart}`;
  };

  const featuredEvents = events.slice(0, 3);
  const primaryFeatured = featuredEvents[0];

  const openEditModal = (ev: EventItem) => {
    setEditingEvent(ev);
    setEditTitle(ev.title);
    setEditDescription(ev.description || "");
    setEditDate(toLocalInputValue(ev.eventDate));
    setEditImageFile(null);
    setEditError(null);
  };

  const closeEditModal = () => {
    setEditingEvent(null);
    setEditImageFile(null);
    setEditError(null);
  };

  const handleUpdateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent) return;
    setEditError(null);

    if (!editTitle || !editDate) {
      setEditError("Title and date/time are required.");
      return;
    }

    try {
      if (editImageFile) {
        const formData = new FormData();
        formData.append("title", editTitle);
        formData.append("eventDate", editDate);
        if (editDescription) formData.append("description", editDescription);
        formData.append("image", editImageFile);

        await ApiService.put(`/events/${editingEvent.id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await ApiService.put(`/events/${editingEvent.id}`, {
          title: editTitle,
          eventDate: editDate,
          description: editDescription || null,
        });
      }

      closeEditModal();
      fetchEvents();
    } catch (err: any) {
      console.error("Error updating event:", err);
      setEditError("Failed to update event.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#f3f6ff] to-[#dfe7ff] px-4 py-6 md:py-8">
      {/* Top bar with Home button */}
      <div className="max-w-6xl mx-auto mb-4 flex items-center justify-between">
        <h1 className="text-xl md:text-2xl font-semibold text-kufahBlue">
          Kufah Events Admin
        </h1>
        <button
          type="button"
          onClick={() => router.push("/pages/dashboard")}
          className="inline-flex items-center gap-2 rounded-full border border-kufahBlue/20 bg-white px-3 py-1.5 text-xs md:text-sm font-medium text-kufahBlue shadow-sm hover:bg-kufahBlue hover:text-white hover:border-kufahBlue transition"
        >
          <span>🏠</span>
          <span>Dashboard</span>
        </button>
      </div>

      <div className="max-w-6xl mx-auto grid gap-6 md:gap-8 md:grid-cols-2">
        {/* LEFT: phone preview */}
        <section className="flex justify-center">
          <div className="w-full max-w-xs rounded-[32px] bg-white shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            {/* Top blue hero */}
            <div className="bg-kufahBlue text-white px-5 pt-4 pb-6 rounded-b-[24px]">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-lg font-bold">Kufah</div>
                  <div className="text-[11px] text-slate-200">
                    Learning &amp; Ibadah
                  </div>
                </div>
              </div>

              <TextLike label="HOME" />

              <h1 className="text-2xl font-extrabold mt-1">
                Featured Programs
              </h1>
              <div className="h-[3px] w-20 rounded-full bg-[#facc15] mt-2 mb-4" />

              <div className="bg-[#f9fafb] rounded-[20px] p-4 shadow-lg">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 rounded-[12px] bg-kufahBlue flex items-center justify-center mr-3">
                    <span className="text-[#facc15] text-lg">✨</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-[18px] font-bold text-kufahBlue leading-tight">
                      September &amp; October Programs
                    </p>
                    <p className="text-[14px] text-[#4b5563] mt-1">
                      Weekly classes and special series
                    </p>
                  </div>
                </div>

                <div className="mt-2 rounded-[16px] overflow-hidden h-28 bg-[#e5e7eb]">
                  {primaryFeatured && primaryFeatured.imageUrl ? (
                    <div className="relative w-full h-full">
                      <img
                        src={primaryFeatured.imageUrl}
                        alt={primaryFeatured.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-end">
                        <div className="w-full px-3 pb-2 pt-4 bg-gradient-to-t from-black/70 via-black/30 to-transparent">
                          <p className="text-[13px] font-semibold text-white truncate">
                            {primaryFeatured.title}
                          </p>
                          <p className="text-[11px] text-slate-100 truncate">
                            {formatEventDate(primaryFeatured.eventDate)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <p className="text-[14px] text-[#6b7280]">
                        Upcoming events banner
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Phone content */}
            <div className="flex-1 overflow-y-auto bg-white">
              <div className="px-4 mt-5 mb-4">
                <div className="flex items-center mb-3">
                  <span className="text-kufahBlue mr-2 text-[18px]">ℹ️</span>
                  <p className="text-[22px] font-bold text-kufahBlue">
                    About Kufah
                  </p>
                </div>

                <div className="bg-[#f9fafb] rounded-[16px] border border-[#e5e7eb] px-3 py-3">
                  <p className="text-[15px] text-[#111827] leading-5 mb-2">
                    Kufah is an Islamic learning institute focused on
                    cultivating lifelong students of knowledge. The programs
                    combine traditional sacred studies with a structured
                    academic format so students can grow spiritually and
                    intellectually while staying rooted in community life.
                  </p>
                  <p className="text-[15px] text-[#4b5563] leading-5">
                    Through part-time diplomas, youth programs, and regular
                    classes, Kufah helps students build a consistent
                    relationship with the Quran, faith, and practice while
                    balancing school, work, and family.
                  </p>

                  <button
                    type="button"
                    className="mt-3 inline-flex items-center gap-1 rounded-full bg-kufahBlue px-3 py-1.5"
                  >
                    <span className="text-[14px] font-semibold text-white">
                      Learn more at kufah.org
                    </span>
                    <span className="text-[#facc15] text-xs">⧉</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* RIGHT: admin form & manage list */}
        <section className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-slate-100 px-5 py-6 md:px-7 md:py-7">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-lg md:text-xl font-bold text-kufahBlue">
                Create New Event
              </h2>
              <p className="text-xs md:text-sm text-slate-500">
                Add a new class, program, or community event to the schedule.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowUpcomingOnly((prev) => !prev)}
              className="text-[11px] md:text-xs text-slate-500 underline-offset-2 hover:underline"
            >
              {showUpcomingOnly ? "View all events" : "View upcoming only"}
            </button>
          </div>

          {error && (
            <div className="mb-3 text-xs md:text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleCreateEvent}>
            {/* title */}
            <div className="space-y-1.5">
              <label
                htmlFor="title"
                className="block text-xs md:text-sm font-medium text-kufahBlue"
              >
                Event Title
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full h-10 md:h-11 rounded-xl border border-slate-200 bg-white px-3 md:px-4 text-xs md:text-sm text-slate-900 outline-none transition focus:border-kufahBlue focus:ring-2 focus:ring-kufahBlue/30"
                placeholder="Friday Night Halaqah"
              />
            </div>

            {/* date & time */}
            <div className="space-y-1.5">
              <label
                htmlFor="eventDate"
                className="block text-xs md:text-sm font-medium text-kufahBlue"
              >
                Date &amp; Time
              </label>
              <input
                id="eventDate"
                type="datetime-local"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full h-10 md:h-11 rounded-xl border border-slate-200 bg-white px-3 md:px-4 text-xs md:text-sm text-slate-900 outline-none transition focus:border-kufahBlue focus:ring-2 focus:ring-kufahBlue/30"
              />
            </div>

            {/* description */}
            <div className="space-y-1.5">
              <label
                htmlFor="description"
                className="block text-xs md:text-sm font-medium text-kufahBlue"
              >
                Description
              </label>
              <textarea
                id="description"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 md:px-4 py-2 text-xs md:text-sm text-slate-900 outline-none transition focus:border-kufahBlue focus:ring-2 focus:ring-kufahBlue/30"
                placeholder="Weekly gathering with reminders and Q&A."
              />
            </div>

            {/* image */}
            <div className="space-y-1.5">
              <label
                htmlFor="image"
                className="block text-xs md:text-sm font-medium text-kufahBlue"
              >
                Event Image (optional)
              </label>
              <input
                id="image"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setImageFile(file);
                }}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs md:text-sm text-slate-900 outline-none transition focus:border-kufahBlue focus:ring-2 focus:ring-kufahBlue/30"
              />
              <p className="text-[10px] md:text-[11px] text-slate-400">
                Upload a banner image for this event. It will be stored in
                Cloudinary and shown in the mobile preview.
              </p>
            </div>

            <button
              type="submit"
              className="w-full h-10 md:h-11 rounded-xl bg-kufahBlue text-white text-sm md:text-base font-semibold shadow-md shadow-kufahBlue/20 transition hover:bg-[#141458] hover:shadow-lg hover:shadow-kufahBlue/30 active:scale-[0.99]"
            >
              Save Event
            </button>
          </form>

          {/* manage list */}
          {events.length > 0 && (
            <div className="mt-5">
              <p className="text-xs md:text-sm font-semibold text-kufahBlue mb-2">
                Manage events
              </p>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {events.map((ev) => (
                  <div
                    key={ev.id}
                    className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 gap-2"
                  >
                    <span className="text-[11px] md:text-xs text-slate-700 truncate flex-1">
                      {ev.title}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        className="text-[11px] md:text-xs text-kufahBlue hover:text-[#141458]"
                        onClick={() => openEditModal(ev)}
                      >
                        Edit
                      </button>
                      <button
                        className="text-[11px] md:text-xs text-red-500 hover:text-red-600"
                        onClick={() => handleDelete(ev.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>

      {/* EDIT MODAL */}
      {editingEvent && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-kufahBlue">
                Edit Event
              </h3>
              <button
                onClick={closeEditModal}
                className="text-sm text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {editError && (
              <div className="mb-2 text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {editError}
              </div>
            )}

            <form className="space-y-3" onSubmit={handleUpdateEvent}>
              <div className="space-y-1">
                <label
                  htmlFor="editTitle"
                  className="block text-xs font-medium text-kufahBlue"
                >
                  Title
                </label>
                <input
                  id="editTitle"
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full h-9 rounded-lg border border-slate-200 px-3 text-xs outline-none focus:border-kufahBlue focus:ring-2 focus:ring-kufahBlue/30"
                />
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="editDate"
                  className="block text-xs font-medium text-kufahBlue"
                >
                  Date &amp; Time
                </label>
                <input
                  id="editDate"
                  type="datetime-local"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="w-full h-9 rounded-lg border border-slate-200 px-3 text-xs outline-none focus:border-kufahBlue focus:ring-2 focus:ring-kufahBlue/30"
                />
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="editDescription"
                  className="block text-xs font-medium text-kufahBlue"
                >
                  Description
                </label>
                <textarea
                  id="editDescription"
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs outline-none focus:border-kufahBlue focus:ring-2 focus:ring-kufahBlue/30"
                />
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="editImage"
                  className="block text-xs font-medium text-kufahBlue"
                >
                  Event Image
                </label>
                <input
                  id="editImage"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setEditImageFile(file);
                  }}
                  className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs outline-none focus:border-kufahBlue focus:ring-2 focus:ring-kufahBlue/30"
                />
                <p className="text-[10px] text-slate-400">
                  Leave this empty to keep the current image.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-kufahBlue text-xs font-semibold text-white hover:bg-[#141458]"
                >
                  Save changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

/** tiny helper to mimic the small "HOME" label styling */
const TextLike = ({ label }: { label: string }) => (
  <p className="text-[11px] tracking-[0.18em] uppercase text-slate-200">
    {label}
  </p>
);

export default EventsAdminPage;
