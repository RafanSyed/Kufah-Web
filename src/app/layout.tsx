// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kufah Attendance",
  description: "School Attendance System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-comfortaa bg-slate-50 text-slate-900">
        <div className="min-h-screen flex flex-col">
          {/* Top header */}
          <header className="sticky top-0 z-20 border-b bg-white/90 backdrop-blur">
            <div className="max-w-6xl mx-auto flex items-center justify-between px-4 md:px-6 py-3 md:py-4">
              {/* Left: logo + title */}
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 md:h-10 md:w-10 rounded-2xl bg-kufahBlue text-white flex items-center justify-center text-sm md:text-base font-bold shadow-sm">
                  K
                </div>
                <div className="flex flex-col leading-tight">
                  <span className="text-sm md:text-base font-semibold text-kufahBlue">
                    Kufah Dashboard
                  </span>
                  <span className="text-[11px] md:text-xs text-slate-500">
                    Simple, dashboard for your needs
                  </span>
                </div>
              </div>
              
            </div>
          </header>

          {/* Main content */}
          <main className="flex-1">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
