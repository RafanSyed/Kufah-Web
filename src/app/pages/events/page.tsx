"use client";

import React, { useEffect, useState } from "react";
import ApiService from "../../services/ApiService";

type EventItem = {
  id: number;
  title: string;
  description?: string | null;
  eventDate: string;
  imageUrl?: string | null;
};

type PreviewTab = "home" | "events";

const EventsAdminPage: React.FC = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUpcomingOnly, setShowUpcomingOnly] = useState(true);
  const [previewTab, setPreviewTab] = useState<PreviewTab>("home");

  // form state
  const [title, setTitle] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

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

  const togglePreviewTab = () => {
    setPreviewTab((prev) => (prev === "home" ? "events" : "home"));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#f3f6ff] to-[#dfe7ff] px-4 py-6 md:py-8">
      <div className="max-w-6xl mx-auto grid gap-6 md:gap-8 md:grid-cols-2">
        {/* LEFT: phone preview */}
        <section className="flex justify-center">
          <div className="w-full max-w-xs rounded-[32px] bg-white shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            {/* ===== TOP BLUE HERO (now includes the Featured card like the app) ===== */}
            <div className="bg-kufahBlue text-white px-5 pt-4 pb-6 rounded-b-[24px]">
              {/* top row: app name + pill */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-lg font-bold">Kufah</div>
                  <div className="text-[11px] text-slate-200">
                    Learning &amp; Ibadah
                  </div>
                </div>

                <button
                  type="button"
                  onClick={togglePreviewTab}
                  className="h-8 px-3 rounded-full border border-white/40 bg-white/10 flex items-center gap-1 text-[11px] font-medium hover:bg-white/15 transition"
                >
                  <span className="text-slate-100">
                    {previewTab === "home" ? "Events" : "Home"}
                  </span>
                  <span className="text-xs">›</span>
                </button>
              </div>

              {/* title area, matching RN layout */}
              <TextLike label={previewTab === "home" ? "HOME" : "EVENTS"} />

              <h1 className="text-2xl font-extrabold mt-1">
                {previewTab === "home" ? "Featured Programs" : "Events"}
              </h1>
              {previewTab === "home" && (
                <div className="h-[3px] w-20 rounded-full bg-[#facc15] mt-2 mb-4" />
              )}

              {/* Featured Programs card INSIDE blue hero, exactly like RN code */}
              {previewTab === "home" && (
                <div className="bg-[#f9fafb] rounded-[20px] p-4 shadow-lg">
                  {/* header row with icon + text */}
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

                  {/* banner area – image fills entire banner like app */}
                  {/* banner area – event text on top, image below */}
                  
                  {/* banner area – image with text overlay */}
                  <div className="mt-2 rounded-[16px] overflow-hidden h-28 bg-[#e5e7eb]">
                    {primaryFeatured && primaryFeatured.imageUrl ? (
                      <div className="relative w-full h-full">
                        {/* image fills banner */}
                        <img
                          src={primaryFeatured.imageUrl}
                          alt={primaryFeatured.title}
                          className="w-full h-full object-cover"
                        />

                        {/* gradient + text overlay */}
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
              )}
            </div>

            {/* ===== PHONE CONTENT (below blue hero) ===== */}
            <div className="flex-1 overflow-y-auto bg-white">
              {previewTab === "home" ? (
                /* About Kufah section */
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
              ) : (
                /* EVENTS TAB PREVIEW */
                <div className="px-4 pt-4 pb-4">
                  <div className="mb-3">
                    <div className="flex items-center">
                      <span className="text-kufahBlue text-[20px] mr-2">
                        📅
                      </span>
                      <p className="text-[22px] font-bold text-kufahBlue">
                        Events
                      </p>
                    </div>
                    <p className="mt-1 text-[13px] text-[#6B7280]">
                      Stay up to date with upcoming programs at Kufah.
                    </p>
                  </div>

                  <div className="flex items-center mb-2">
                    <div className="w-[6px] h-[22px] rounded-full bg-[#facc15] mr-2" />
                    <p className="text-[18px] font-semibold text-kufahBlue">
                      Upcoming Events
                    </p>
                  </div>

                  {loading ? (
                    <p className="text-[13px] text-[#6B7280]">
                      Loading events...
                    </p>
                  ) : events.length === 0 ? (
                    <p className="text-[14px] text-[#6B7280] mt-1">
                      No events scheduled yet. Please check back soon.
                    </p>
                  ) : (
                    events.map((ev) => (
                      <div
                        key={ev.id}
                        className="bg-[#f3f4f6] rounded-[18px] border border-[#E5E7EB] px-3 py-3 mb-3"
                      >
                        <div className="flex items-center mb-1.5">
                          <span className="text-kufahBlue text-[18px] mr-1.5">
                            ☆
                          </span>
                          <p className="text-[17px] font-bold text-[#111827]">
                            {ev.title}
                          </p>
                        </div>

                        <div className="flex items-center mb-1.5">
                          <span className="text-[#4B5563] text-[15px] mr-1.5">
                            🕒
                          </span>
                          <p className="text-[14px] text-[#4B5563]">
                            {formatEventDate(ev.eventDate)}
                          </p>
                        </div>

                        {ev.description && (
                          <p className="mt-1 text-[14px] text-[#4B5563]">
                            {ev.description}
                          </p>
                        )}

                        <button
                          type="button"
                          className="mt-2 ml-auto flex items-center gap-1 rounded-full bg-kufahBlue px-3 py-1.5"
                        >
                          <span className="text-[13px] font-semibold text-white">
                            View details
                          </span>
                          <span className="text-[#facc15] text-xs">›</span>
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* RIGHT: admin form & manage list (same as before) */}
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

          {events.length > 0 && (
            <div className="mt-5">
              <p className="text-xs md:text-sm font-semibold text-kufahBlue mb-2">
                Manage events
              </p>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {events.map((ev) => (
                  <div
                    key={ev.id}
                    className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"
                  >
                    <span className="text-[11px] md:text-xs text-slate-700 truncate">
                      {ev.title}
                    </span>
                    <button
                      className="text-[11px] md:text-xs text-red-500 hover:text-red-600"
                      onClick={() => handleDelete(ev.id)}
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
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
