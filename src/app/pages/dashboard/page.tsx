// app/page.tsx
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-br from-white via-[#f3f6ff] to-[#dfe7ff] px-4">
      <div className="w-full max-w-md mx-auto py-10 space-y-8 text-center">
        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-extrabold text-kufahBlue">
            Kufah Admin Dashboard
          </h1>
          <p className="text-sm md:text-base text-slate-600">
            Choose a section to manage attendance, events, or student questions.
          </p>
        </div>

        {/* Button stack */}
        <div className="flex flex-col gap-4">
          {/* Attendance */}
          <Link href="/pages/teacherDashboard" className="group">
            <button
              type="button"
              className="w-full rounded-2xl bg-white shadow-md border border-slate-200 px-5 py-4 text-left flex items-center justify-between transition-all hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div>
                <p className="text-sm font-semibold text-kufahBlue">
                  Attendance
                </p>
                <p className="text-xs text-slate-500">
                  View and manage class attendance records.
                </p>
              </div>
              <span className="text-kufahBlue transition-transform group-hover:translate-x-1">
                ➜
              </span>
            </button>
          </Link>

          {/* Events 
          <Link href="/pages/events" className="group">
            <button
              type="button"
              className="w-full rounded-2xl bg-white shadow-md border border-slate-200 px-5 py-4 text-left flex items-center justify-between transition-all hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div>
                <p className="text-sm font-semibold text-kufahBlue">
                  Events
                </p>
                <p className="text-xs text-slate-500">
                  Create and organize school or program events.
                </p>
              </div>
              <span className="text-kufahBlue transition-transform group-hover:translate-x-1">
                ➜
              </span>
            </button>
          </Link> */}

          {/* Student Questions 
          <Link href="/pages/studentManagement" className="group">
            <button
              type="button"
              className="w-full rounded-2xl bg-white shadow-md border border-slate-200 px-5 py-4 text-left flex items-center justify-between transition-all hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div>
                <p className="text-sm font-semibold text-kufahBlue">
                  Student Managment
                </p>
                <p className="text-xs text-slate-500">
                  Review student questions and post annoucements
                </p>
              </div>
              <span className="text-kufahBlue transition-transform group-hover:translate-x-1">
                ➜
              </span>
            </button>
          </Link> */}
        </div>
      </div>
    </div>
  );
}
