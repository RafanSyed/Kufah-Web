// app/page.tsx
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: 'Comfortaa, sans-serif' }}>
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          {/* Header */}
          <div className="space-y-4">
            <h1 className="text-3xl md:text-5xl lg:text-6xl xl:text-8xl font-extrabold text-[#191970] leading-tight text-center">
              Welcome to the Attendance System
            </h1>
          </div>

          {/* Navigation Buttons */}
          <nav className="flex flex-col sm:flex-row gap-8 justify-center items-center">
            <Link 
              href="/pages/teacherLogin" 
              className="group relative px-6 py-4 md:px-12 md:py-6 bg-slate-800 text-white font-bold rounded-lg shadow-lg hover:bg-slate-700 transition-all duration-300 ease-in-out transform hover:scale-105 min-w-[280px] text-lg no-underline"
            >
              <span className="flex items-center justify-center gap-3">
                {/* Responsive SVG sizing and direct color for the stroke */}
                <svg className="w-8 h-8 md:w-10 md:h-10" fill="none" stroke="#191970" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <h3 className="text-base md:text-lg font-semibold" style={{ color: '#191970' }}>Teacher Dashboard</h3>
              </span>
            </Link>
          </nav>

          {/* Additional Info */}
          
        </div>
      </div>
    </div>
  );
}