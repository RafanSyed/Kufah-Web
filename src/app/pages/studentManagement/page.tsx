"use client";

import React, { useEffect, useState } from "react";
import ApiService from "../../services/ApiService";

type ClassItem = {
  id: number;
  name: string;
};

type QuestionItem = {
  id: number;
  question: string;
  answer: string | null;
  isPublic: boolean;
  classId: number;
  studentId: number;
  publiched: boolean; // 👈 matches DB column name
};

type QuestionWithDraft = QuestionItem & {
  draftAnswer: string;
  draftIsPublic: boolean;
  saving?: boolean;
};

const StudentQuestionsPage: React.FC = () => {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [classError, setClassError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<number>(0); // 0 = Home, 1+ = classes[index-1]

  const [questionsByClass, setQuestionsByClass] = useState<
    Record<number, QuestionWithDraft[]>
  >({});
  const [questionsLoading, setQuestionsLoading] = useState<
    Record<number, boolean>
  >({});
  const [questionsError, setQuestionsError] = useState<
    Record<number, string | null>
  >({});

  // Load classes
  useEffect(() => {
    const loadClasses = async () => {
      try {
        setLoadingClasses(true);
        const data = await ApiService.get("/classes");
        setClasses(data || []);
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
    // already loaded or currently loading
    if (questionsByClass[classId] || questionsLoading[classId]) return;

    setQuestionsLoading((prev) => ({ ...prev, [classId]: true }));
    setQuestionsError((prev) => ({ ...prev, [classId]: null }));

    try {
      const data: QuestionItem[] = await ApiService.get("/questions", {
        classId,
      });

      // Only show questions where publiched === false
      const unpublished = (data || []).filter(
        (q) => !q.publiched
      );

      const withDraft: QuestionWithDraft[] = unpublished.map((q) => ({
        ...q,
        answer: q.answer ?? "",
        draftAnswer: q.answer ?? "",
        draftIsPublic: q.isPublic ?? true,
        saving: false,
      }));

      setQuestionsByClass((prev) => ({
        ...prev,
        [classId]: withDraft,
      }));
    } catch (err) {
      console.error("Error loading questions:", err);
      setQuestionsError((prev) => ({
        ...prev,
        [classId]: "Failed to load questions.",
      }));
    } finally {
      setQuestionsLoading((prev) => ({ ...prev, [classId]: false }));
    }
  };

  const handleTabClick = (index: number) => {
    setActiveTab(index);
    if (index > 0) {
      const cls = classes[index - 1];
      if (cls) {
        ensureQuestionsLoaded(cls.id);
      }
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

      const updated = current.map((q) =>
        q.id === questionId ? { ...q, ...updates } : q
      );

      return { ...prev, [classId]: updated };
    });
  };

  const handlePublish = async (classId: number, questionId: number) => {
    const classQuestions = questionsByClass[classId];
    if (!classQuestions) return;

    const q = classQuestions.find((qq) => qq.id === questionId);
    if (!q) return;

    // If nothing changed, still mark as published so it disappears
    try {
      updateQuestionDraft(classId, questionId, { saving: true });

      await ApiService.put(`/questions/${questionId}`, {
        answer: q.draftAnswer || null,
        isPublic: q.draftIsPublic,
        publiched: true, // 👈 mark as published in DB
      });

      // Remove the question from the list so it no longer shows
      setQuestionsByClass((prev) => {
        const current = prev[classId] || [];
        const filtered = current.filter((qq) => qq.id !== questionId);
        return { ...prev, [classId]: filtered };
      });
    } catch (err) {
      console.error("Error updating question:", err);
      updateQuestionDraft(classId, questionId, { saving: false });
      alert("Failed to publish answer. Please try again.");
    }
  };

  // --- RENDER HELPERS ---

  const renderHomeTab = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-kufahBlue">
        Home – Student Q&amp;A Management
      </h2>
      <p className="text-sm text-slate-600 leading-relaxed">
        Use this page to review and answer questions submitted by students for
        each class. Only unpublished questions appear here. Once you publish a
        question, it will disappear from this list.
      </p>
      <ul className="text-sm text-slate-600 list-disc list-inside space-y-1">
        <li>
          <span className="font-medium">Public</span> questions are visible in
          the app&apos;s Q&amp;A section.
        </li>
        <li>
          You can still update answers or visibility later from other admin
          tools if needed.
        </li>
      </ul>
    </div>
  );

  const renderClassTab = (cls: ClassItem) => {
    const classId = cls.id;
    const qLoading = questionsLoading[classId];
    const qError = questionsError[classId];
    const questions = questionsByClass[classId] || [];

    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-kufahBlue">
          {cls.name} – Questions
        </h2>

        {qLoading && (
          <p className="text-sm text-slate-500">Loading questions…</p>
        )}

        {qError && (
          <p className="text-sm text-red-600">
            {qError}
          </p>
        )}

        {!qLoading && !qError && questions.length === 0 && (
          <p className="text-sm text-slate-500">
            No unpublished questions for this class.
          </p>
        )}

        {!qLoading &&
          !qError &&
          questions.length > 0 && (
            <div className="space-y-3">
              {questions.map((q) => (
                <div
                  key={q.id}
                  className="rounded-2xl border border-slate-200 bg-white shadow-sm px-4 py-3 space-y-3"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {q.question}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Student ID: {q.studentId}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-kufahBlue">
                      Answer
                    </label>
                    <textarea
                      value={q.draftAnswer}
                      onChange={(e) =>
                        updateQuestionDraft(classId, q.id, {
                          draftAnswer: e.target.value,
                        })
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
                      onClick={() => handlePublish(classId, q.id)}
                      disabled={q.saving}
                      className={`inline-flex items-center justify-center rounded-xl px-3 py-1.5 text-xs font-semibold text-white shadow-sm ${
                        q.saving
                          ? "bg-slate-400 cursor-not-allowed"
                          : "bg-kufahBlue hover:bg-[#141458]"
                      } transition`}
                    >
                      {q.saving ? "Publishing…" : "Publish"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
      </div>
    );
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-white via-[#f3f6ff] to-[#dfe7ff] px-4 py-6 md:py-8"
      style={{ fontFamily: "Comfortaa, sans-serif" }}
    >
      <div className="max-w-6xl mx-auto bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-slate-100 px-5 py-6 md:px-7 md:py-7">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-kufahBlue">
              Student Q&amp;A Management
            </h1>
            <p className="text-xs md:text-sm text-slate-500 mt-1">
              Review and answer questions students have submitted for each class.
              Only unpublished questions are shown.
            </p>
          </div>
        </header>

        {/* Tabs */}
        <div className="border-b border-slate-200 mb-4 overflow-x-auto">
          <div className="flex gap-2">
            {/* Home tab */}
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

            {/* Class tabs */}
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

        {/* Classes loading / error */}
        {loadingClasses && (
          <p className="text-sm text-slate-500">Loading classes…</p>
        )}
        {classError && (
          <p className="text-sm text-red-600 mb-3">{classError}</p>
        )}

        {/* Tab content */}
        {!loadingClasses && !classError && (
          <div className="mt-2">
            {activeTab === 0
              ? renderHomeTab()
              : (() => {
                  const cls = classes[activeTab - 1];
                  if (!cls) {
                    return (
                      <p className="text-sm text-slate-500">
                        Class not found.
                      </p>
                    );
                  }
                  return renderClassTab(cls);
                })()}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentQuestionsPage;
