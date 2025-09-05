// app/components/ResponsiveLogo.tsx
'use client';
import React, { useState, useEffect } from 'react';

export default function ResponsiveLogo() {
  const [logoHeight, setLogoHeight] = useState(100);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) setLogoHeight(60);      // mobile
      else if (width < 1024) setLogoHeight(80); // tablet
      else setLogoHeight(100);                 // desktop
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <img
      src="/images/kufah_logo.png"
      alt="Kufah Logo"
      style={{ height: `${logoHeight}px`, width: 'auto', transition: 'height 0.3s ease' }}
    />
  );
}
