'use client'

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const TeacherLogin: React.FC = () => {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screen
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    handleResize(); // initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    const correctUsername = process.env.NEXT_PUBLIC_TEACHER_USERNAME;
    const correctPassword = process.env.NEXT_PUBLIC_TEACHER_PASSWORD;

    if (username === correctUsername && password === correctPassword) {
      router.push("/pages/teacherDashboard");
    } else {
      setError("Invalid username or password");
    }
  };

  // Sizes depending on mobile/desktop
  const headingSize = isMobile ? "2rem" : "4rem";
  const inputHeight = isMobile ? "40px" : "50px";
  const fontSize = isMobile ? "14px" : "16px";
  const buttonHeight = isMobile ? "40px" : "50px";
  const marginBottom = isMobile ? "10px" : "30px";

  return (
    <div 
      className="flex items-center justify-center min-h-screen bg-gray-100"
      style={{ fontFamily: 'Comfortaa, sans-serif', padding: isMobile ? '10px' : '0' }}
    >
      <form
        onSubmit={handleLogin}
        style={{
          backgroundColor: '#fff',
          padding: isMobile ? '20px' : '32px',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          width: isMobile ? '90vw' : '400px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center', // center the inputs
        }}
      >
        <h2
          style={{
            fontSize: headingSize,
            fontWeight: "bold",
            color: "#191970",
            textAlign: "center",
            marginBottom: marginBottom
          }}
        >
          Teacher Login
        </h2>

        <label style={{ color: '#191970', fontSize, display: 'block', marginBottom: '5px', alignSelf: 'flex-start' }}>Username</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{
            width: '90%', // slightly shorter than form
            maxWidth: '320px', // optional max width
            height: inputHeight,
            fontSize,
            padding: '0 10px',
            marginBottom: marginBottom,
            borderRadius: '8px',
            border: '2px solid #d1d5db',
            outline: 'none'
          }}
        />

        <label style={{ color: '#191970', fontSize, display: 'block', marginBottom: '5px', alignSelf: 'flex-start' }}>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: '90%',
            maxWidth: '320px',
            height: inputHeight,
            fontSize,
            padding: '0 10px',
            marginBottom: marginBottom,
            borderRadius: '8px',
            border: '2px solid #d1d5db',
            outline: 'none'
          }}
        />


        {error && (
          <div style={{ color: 'red', fontSize: '14px', textAlign: 'center', marginBottom: marginBottom }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          style={{
            width: '100%',
            height: buttonHeight,
            backgroundColor: '#191970',
            color: 'white',
            fontSize,
            fontWeight: 600,
            borderRadius: '8px',
            cursor: 'pointer',
            marginBottom: isMobile ? '20px' : '260px'
          }}
        >
          Login
        </button>
      </form>
    </div>
  );
};

export default TeacherLogin;
