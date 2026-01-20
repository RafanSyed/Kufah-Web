// app/page.tsx
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-br from-white via-[#f3f6ff] to-[#dfe7ff] px-4">
      <div className="max-w-4xl w-full mx-auto py-12 md:py-16 space-y-10 text-center">
        {/* Hero text */}
        <section className="space-y-4">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-kufahBlue leading-tight tracking-tight">
            Welcome to Kufah Admin Dashboard
          </h1>
          <p className="text-sm md:text-lg text-slate-600 max-w-2xl mx-auto">
            A streamline Admin Dashboard for Kufah Institution 
          </p>
        </section>

        {/* Teacher portal card */}
        <section className="flex justify-center">
          <Link href="/pages/teacherLogin" className="group w-full max-w-sm">
            <div className="rounded-3xl border border-slate-200 bg-white/90 backdrop-blur-xl shadow-md px-8 py-7 md:px-10 md:py-8 flex flex-col items-center gap-4 transition-all duration-300 ease-out hover:shadow-xl hover:-translate-y-1">
              {/* Icon */}
              <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-kufahBlue/10">
                <svg
                  className="w-10 h-10"
                  fill="none"
                  stroke="#191970"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>

              {/* Text */}
              <div className="space-y-1 text-center">
                <h2 className="text-lg md:text-xl font-semibold text-kufahBlue">
                  Admin Dashboard
                </h2>
                <p className="text-xs md:text-sm text-slate-500">
                  Log in to take attendance, manage classes, and oversee events
                  for the students.
                </p>
              </div>

              {/* CTA */}
              <div className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-kufahBlue">
                <span className="transition-transform group-hover:translate-x-1">
                  Enter Admin Portal
                </span>
                <svg
                  className="w-4 h-4 transition-transform group-hover:translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>
          </Link>
        </section>

        {/* Small footer hint */}
        <p className="text-[11px] md:text-xs text-slate-500">
          Student and admin views will be added to this home screen in future
          versions of Kufah.
        </p>
      </div>
    </div>
  );
}
