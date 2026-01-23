"use client";

import React, { useEffect, useState } from "react";
import ApiService from "../../services/ApiService";

type ClassItem = {
  id: number;
  name: string;
  zoom_link?: string | null;
  recordings_folder_link?: string | null;
};

type QuestionItem = {
  id: number;
  question: string;
  answer: string | null;
  isPublic: boolean;
  classId: number;
  studentId: number;
  published: boolean;
};

type QuestionWithDraft = QuestionItem & {
  draftAnswer: string;
  draftIsPublic: boolean;
  saving?: boolean;
};

type ClassLinksDraft = {
  zoomLink: string;
  recordingsLink: string;
  saving: boolean;
  savedMsg: string | null;
  errorMsg: string | null;
};

const StudentQuestionsPage: React.FC = () => {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [classError, setClassError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<number>(0);

  const [questionsByClass, setQuestionsByClass] = useState<
    Record<number, QuestionWithDraft[]>
  >({});
  const [questionsLoading, setQuestionsLoading] = useState<Record<number, boolean>>({});
  const [questionsError, setQuestionsError] = useState<Record<number, string | null>>({});

  // ✅ NEW: per-class links drafts
  const [linksByClass, setLinksByClass] = useState<Record<number, ClassLinksDraft>>(
    {}
  );

  // Load classes
  useEffect(() => {
    const loadClasses = async () => {
      try {
        setLoadingClasses(true);
        const data = await ApiService.get("/classes");
        const list: ClassItem[] = data || [];
        setClasses(list);

        // initialize drafts
        setLinksByClass((prev) => {
          const next = { ...prev };
          for (const c of list) {
            if (!next[c.id]) {
              next[c.id] = {
                zoomLink: (c.zoom_link ?? "") as string,
                recordingsLink: (c.recordings_folder_link ?? "") as string,
                saving: false,
                savedMsg: null,
                errorMsg: null,
              };
            }
          }
          return next;
        });
      } catch (err) {
        console.error("Error loading classes:", err);
        setClassError("Failed to load classes.");
      } finally {
        setLoadingClasses(false);
      }
    };

    loadClasses();
  }, []);

  const ensureQuestionsLoaded = async (classId: number) => {
    if (questionsByClass[classId] || questionsLoading[classId]) return;

    setQuestionsLoading((prev) => ({ ...prev, [classId]: true }));
    setQuestionsError((prev) => ({ ...prev, [classId]: null }));

    try {
      const data: QuestionItem[] = await ApiService.get("/questions", { classId });

      const withDraft: QuestionWithDraft[] = (data || []).map((q) => ({
        ...q,
        answer: q.answer ?? "",
        draftAnswer: q.answer ?? "",
        draftIsPublic: q.isPublic ?? true,
        saving: false,
      }));

      setQuestionsByClass((prev) => ({ ...prev, [classId]: withDraft }));
    } catch (err) {
      console.error("Error loading questions:", err);
      setQuestionsError((prev) => ({ ...prev, [classId]: "Failed to load questions." }));
    } finally {
      setQuestionsLoading((prev) => ({ ...prev, [classId]: false }));
    }
  };

  const handleTabClick = (index: number) => {
    setActiveTab(index);
    if (index > 0) {
      const cls = classes[index - 1];
      if (cls) ensureQuestionsLoaded(cls.id);
    }
  };

  const updateQuestionDraft = (
    classId: number,
    questionId: number,
    updates: Partial<QuestionWithDraft>
  ) => {
    setQuestionsByClass((prev) => {
      const current = prev[classId];
      if (!current) return prev;
      const updated = current.map((q) => (q.id === questionId ? { ...q, ...updates } : q));
      return { ...prev, [classId]: updated };
    });
  };

  const handlePublishOrUpdate = async (classId: number, questionId: number) => {
    const classQuestions = questionsByClass[classId];
    if (!classQuestions) return;

    const q = classQuestions.find((qq) => qq.id === questionId);
    if (!q) return;

    try {
      updateQuestionDraft(classId, questionId, { saving: true });

      await ApiService.put(`/questions/${questionId}`, {
        answer: q.draftAnswer?.trim() ? q.draftAnswer : null,
        isPublic: q.draftIsPublic,
        published: true, // always true on publish/update
      });

      updateQuestionDraft(classId, questionId, {
        saving: false,
        published: true,
        answer: q.draftAnswer?.trim() ? q.draftAnswer : null,
        isPublic: q.draftIsPublic,
      });
    } catch (err) {
      console.error("Error updating question:", err);
      updateQuestionDraft(classId, questionId, { saving: false });
      alert("Failed to save. Please try again.");
    }
  };

  // ✅ NEW: update link drafts
  const updateLinksDraft = (classId: number, updates: Partial<ClassLinksDraft>) => {
    setLinksByClass((prev) => ({
      ...prev,
      [classId]: {
        ...(prev[classId] || {
          zoomLink: "",
          recordingsLink: "",
          saving: false,
          savedMsg: null,
          errorMsg: null,
        }),
        ...updates,
      },
    }));
  };

  // ✅ NEW: save class links via PUT /classes/:id
  const handleSaveLinks = async (classId: number) => {
    const draft = linksByClass[classId];
    if (!draft) return;

    try {
      updateLinksDraft(classId, { saving: true, savedMsg: null, errorMsg: null });

      const zoom_link = draft.zoomLink.trim() || null;
      const recordings_folder_link = draft.recordingsLink.trim() || null;

      const updated = await ApiService.put(`/classes/${classId}`, {
        zoom_link,
        recordings_folder_link,
      });

      // update classes list too so it stays in sync
      setClasses((prev) =>
        prev.map((c) =>
          c.id === classId
            ? {
                ...c,
                zoom_link: (updated?.zoom_link ?? zoom_link) as any,
                recordings_folder_link:
                  (updated?.recordings_folder_link ?? recordings_folder_link) as any,
              }
            : c
        )
      );

      updateLinksDraft(classId, { saving: false, savedMsg: "Saved ✅" });
      setTimeout(() => updateLinksDraft(classId, { savedMsg: null }), 1200);
    } catch (err: any) {
      console.error("Error saving class links:", err);
      updateLinksDraft(classId, {
        saving: false,
        errorMsg: "Failed to save links. Please try again.",
      });
    }
  };

  const renderHomeTab = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-kufahBlue">
        Home – Student Q&amp;A Management
      </h2>
      <p className="text-sm text-slate-600 leading-relaxed">
        Use this page to review and answer questions submitted by students for each class.
      </p>
    </div>
  );

  const renderClassTab = (cls: ClassItem) => {
    const classId = cls.id;
    const qLoading = questionsLoading[classId];
    const qError = questionsError[classId];
    const questions = questionsByClass[classId] || [];

    const linksDraft = linksByClass[classId] || {
      zoomLink: (cls.zoom_link ?? "") as string,
      recordingsLink: (cls.recordings_folder_link ?? "") as string,
      saving: false,
      savedMsg: null,
      errorMsg: null,
    };

    return (
      <div className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold text-kufahBlue">{cls.name}</h2>
          <p className="text-xs text-slate-500">
            Manage class links + answer/publish questions.
          </p>
        </div>

        {/* ✅ NEW: Links editor */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm px-4 py-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">Class links</h3>
            <div className="text-xs">
              {linksDraft.savedMsg && (
                <span className="text-green-700 font-semibold">{linksDraft.savedMsg}</span>
              )}
              {linksDraft.errorMsg && (
                <span className="text-red-600 font-semibold">{linksDraft.errorMsg}</span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-medium text-kufahBlue">
                Zoom link
              </label>
              <input
                value={linksDraft.zoomLink}
                onChange={(e) => updateLinksDraft(classId, { zoomLink: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs md:text-sm text-slate-900 outline-none transition focus:border-kufahBlue focus:ring-2 focus:ring-kufahBlue/30"
                placeholder="https://zoom.us/j/..."
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-kufahBlue">
                Recordings folder link
              </label>
              <input
                value={linksDraft.recordingsLink}
                onChange={(e) =>
                  updateLinksDraft(classId, { recordingsLink: e.target.value })
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs md:text-sm text-slate-900 outline-none transition focus:border-kufahBlue focus:ring-2 focus:ring-kufahBlue/30"
                placeholder="https://drive.google.com/..."
              />
            </div>
          </div>

          <div className="flex items-center justify-end">
            <button
              type="button"
              onClick={() => handleSaveLinks(classId)}
              disabled={linksDraft.saving}
              className={`inline-flex items-center justify-center rounded-xl px-4 py-2 text-xs font-semibold text-white shadow-sm transition ${
                linksDraft.saving ? "bg-slate-400 cursor-not-allowed" : "bg-kufahBlue hover:bg-[#141458]"
              }`}
            >
              {linksDraft.saving ? "Saving…" : "Save links"}
            </button>
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-3">
          {qLoading && <p className="text-sm text-slate-500">Loading questions…</p>}
          {qError && <p className="text-sm text-red-600">{qError}</p>}
          {!qLoading && !qError && questions.length === 0 && (
            <p className="text-sm text-slate-500">No questions found for this class.</p>
          )}

          {!qLoading &&
            !qError &&
            questions.map((q) => (
              <div
                key={q.id}
                className="rounded-2xl border border-slate-200 bg-white shadow-sm px-4 py-3 space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{q.question}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Student ID: {q.studentId}
                    </p>
                  </div>

                  {q.published ? (
                    <div className="inline-flex items-center gap-1 rounded-full bg-green-50 border border-green-200 px-2 py-1">
                      <span className="text-green-600">✔</span>
                      <span className="text-[11px] font-semibold text-green-700">
                        Published
                      </span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-1 rounded-full bg-slate-50 border border-slate-200 px-2 py-1">
                      <span className="text-[11px] font-semibold text-slate-500">
                        Not published
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-medium text-kufahBlue">
                    Answer
                  </label>
                  <textarea
                    value={q.draftAnswer}
                    onChange={(e) =>
                      updateQuestionDraft(classId, q.id, { draftAnswer: e.target.value })
                    }
                    rows={3}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs md:text-sm text-slate-900 outline-none transition focus:border-kufahBlue focus:ring-2 focus:ring-kufahBlue/30"
                    placeholder="Type your answer here…"
                  />
                </div>

                <div className="flex items-center justify-between gap-4">
                  <label className="inline-flex items-center gap-2 text-xs text-slate-700">
                    <input
                      type="checkbox"
                      checked={q.draftIsPublic}
                      onChange={(e) =>
                        updateQuestionDraft(classId, q.id, {
                          draftIsPublic: e.target.checked,
                        })
                      }
                      className="h-4 w-4 rounded border-slate-300 text-kufahBlue focus:ring-kufahBlue"
                    />
                    <span>Make this question public</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => handlePublishOrUpdate(classId, q.id)}
                    disabled={q.saving}
                    className={`inline-flex items-center justify-center rounded-xl px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition ${
                      q.saving
                        ? "bg-slate-400 cursor-not-allowed"
                        : q.published
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-kufahBlue hover:bg-[#141458]"
                    }`}
                    title={q.published ? "Update published answer" : "Publish answer"}
                  >
                    {q.saving ? "Saving…" : q.published ? "Update" : "Publish"}
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>
    );
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-white via-[#f3f6ff] to-[#dfe7ff] px-4 py-6 md:py-8"
      style={{ fontFamily: "Comfortaa, sans-serif" }}
    >
      <div className="max-w-6xl mx-auto bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-slate-100 px-5 py-6 md:px-7 md:py-7">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-kufahBlue">
              Student Q&amp;A Management
            </h1>
            <p className="text-xs md:text-sm text-slate-500 mt-1">
              Answer questions + manage Zoom/recordings links per class.
            </p>
          </div>
        </header>

        <div className="border-b border-slate-200 mb-4 overflow-x-auto">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleTabClick(0)}
              className={`px-4 py-2 text-sm rounded-t-lg border-b-2 transition ${
                activeTab === 0
                  ? "border-kufahBlue text-kufahBlue bg-white"
                  : "border-transparent text-slate-500 hover:text-kufahBlue hover:bg-slate-50"
              }`}
            >
              Home
            </button>

            {classes.map((cls, idx) => {
              const tabIndex = idx + 1;
              return (
                <button
                  key={cls.id}
                  type="button"
                  onClick={() => handleTabClick(tabIndex)}
                  className={`px-4 py-2 text-sm rounded-t-lg border-b-2 whitespace-nowrap transition ${
                    activeTab === tabIndex
                      ? "border-kufahBlue text-kufahBlue bg-white"
                      : "border-transparent text-slate-500 hover:text-kufahBlue hover:bg-slate-50"
                  }`}
                >
                  {cls.name}
                </button>
              );
            })}
          </div>
        </div>

        {loadingClasses && <p className="text-sm text-slate-500">Loading classes…</p>}
        {classError && <p className="text-sm text-red-600 mb-3">{classError}</p>}

        {!loadingClasses && !classError && (
          <div className="mt-2">
            {activeTab === 0
              ? renderHomeTab()
              : (() => {
                  const cls = classes[activeTab - 1];
                  if (!cls) return <p className="text-sm text-slate-500">Class not found.</p>;
                  return renderClassTab(cls);
                })()}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentQuestionsPage;
